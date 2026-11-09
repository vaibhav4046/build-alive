// devpost/tests/build-alive.sweep.mjs
// Comprehensive deterministic & negative test suite for BUILD ALIVE (F01-F72).
// Tests 1,000+ checks across:
// - F01-F72 feature assertions
// - Threat suite T01-T08 (secrets, traversal, nonces, allowlists, fail-closed)
// - Ergonomics & FOV audit
// - Monotonic replay & state hash determinism
// - Real WebSocket bridge & Claude hook ingestion
// - Latency profiling (p50/p95/p99)

import assert from "node:assert/strict"
import {
  BuildAliveEngine,
  validateEventEnvelope,
  scrubSecrets,
  sanitizeDisplayText,
  sanitizeFileAlias,
  deterministicHash,
  migratePersistedState,
  DEMO_PROJECTS,
  LEARNING_CASES,
} from "../../Assets/Scripts/BuildAliveCore.ts"
import {
  auditControlErgonomics,
  angularOffsetFromGazeDeg,
  RAIL_CONTROLS,
  MIN_RAIL_SEPARATION_CM,
  PROJECT_ISLANDS,
  CITY_MODULES,
} from "../../Assets/Scripts/BuildAliveLayout.ts"
import {runDemoRepoSuite} from "../../demo-repo/tests/room-capacity.test.mjs"
import {ActionGate, ALLOWLISTED_ACTIONS} from "../../bridge/action-gate.mjs"
import {normalizeClaudeHookEvent} from "../../bridge/claude-hook.mjs"
import {normalizeCodexEvent} from "../../bridge/codex-adapter.mjs"
import {EventJournal} from "../../bridge/journal.mjs"
import {createBridgeServer} from "../../bridge/ws-server.mjs"
import {
  discoverWindowsSessions,
  extractRecentWindowsEvents,
  normalizeAntigravityStep,
} from "../../bridge/antigravity-adapter.mjs"

let passedChecks = 0
function check(cond, msg) {
  assert.ok(cond, msg)
  passedChecks++
}

console.log("=== STARTING BUILD ALIVE DETERMINISTIC SWEEP ===")

// 1. Core Security & Threat Model (T01-T08)
console.log("-> 1. Security, Threat Model & Secret Redaction (T01-T08)")
{
  const secretSamples = [
    "sk-ant-api03-abcdef1234567890abcdef1234567890",
    "ghp_123456789012345678901234567890123456",
    "gho_123456789012345678901234567890123456",
    "github_pat_11A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7",
    "xoxb-1234567890-123456789012-abcdef123456",
    "AIzaSyD-1234567890abcdefghijklmnopqrst",
    "AKIAIOSFODNN7EXAMPLE",
  ]
  for (const s of secretSamples) {
    const res = scrubSecrets(`Key: ${s} in file`)
    check(!res.includes(s), `Secret ${s.slice(0, 8)} must be scrubbed`)
    check(res.includes("[REDACTED_SECRET]"), "Must replace with [REDACTED_SECRET]")
  }

  // Windows and Unix host paths
  const hostPaths = [
    "C:\\Users\\lalwa\\secrets.txt",
    "/home/lalwa/.ssh/id_rsa",
    "/Users/lalwa/dev/key.pem",
  ]
  for (const p of hostPaths) {
    const res = scrubSecrets(`Error at ${p}`)
    check(!res.includes("lalwa"), "Host usernames must be scrubbed")
    check(res.includes("[REDACTED_USER_PATH]"), "Host paths must be scrubbed to [REDACTED_USER_PATH]")
  }

  // Directory traversal attacks
  const badFiles = ["../../etc/passwd", "..\\..\\windows\\system32", "valid/../../secret.ts"]
  for (const bf of badFiles) {
    const sf = sanitizeFileAlias(bf)
    check(!sf.ok || !sf.alias.includes(".."), `Traversal rejected or neutralized for ${bf}`)
  }

  // Action Gate Allowlist & Nonce Tampering
  const gate = new ActionGate()
  const badAction = gate.proposeAction({actionId: "rm_rf_root", targetFile: "server.ts"})
  check(!badAction.ok, "Non-allowlisted action must be rejected")

  const goodAction = gate.proposeAction({
    actionId: ALLOWLISTED_ACTIONS.RUN_KNOWN_TEST,
    targetFile: "tests/room-capacity.test.mjs",
  })
  check(goodAction.ok, "Allowlisted action must be accepted")

  const tampered = gate.resolveApproval({
    requestId: goodAction.proposal.requestId,
    nonce: "tampered_nonce_value",
    actorConfirmation: "CONFIRM",
    approved: true,
  })
  check(!tampered.ok && tampered.reason.includes("nonce"), "Tampered nonce must fail approval")

  const validApproval = gate.resolveApproval({
    requestId: goodAction.proposal.requestId,
    nonce: goodAction.proposal.nonce,
    actorConfirmation: "CONFIRM_OK",
    approved: true,
  })
  check(validApproval.ok, "Valid approval with correct nonce must succeed")
  check(validApproval.receipt.signature.length === 64, "Must produce sha256 audit receipt")
}

// 2. Demo Repository Real Code Checks
console.log("-> 2. Demo Repository Real Code Checks (LobbySync)")
{
  const buggy = runDemoRepoSuite({useBuggyGuard: true})
  check(!buggy.passed, "Buggy guard must fail test-room-03")
  check(buggy.results.find((r) => r.id === "test-room-03").passed === false, "test-room-03 fails on buggy > guard")

  const fixed = runDemoRepoSuite({useBuggyGuard: false})
  check(fixed.passed, "Fixed guard must pass all demo tests")
  check(fixed.passedCount === 4, "All 4 tests pass")
}

// 3. Ergonomics, Control Spacing & Camera FOV
console.log("-> 3. Ergonomics & Camera FOV Audit")
{
  const audit = auditControlErgonomics()
  check(audit.passed, "auditControlErgonomics() must pass")
  check(audit.minWidthCm >= 5.0, "All interactive targets >= 5 cm")
  check(audit.minRailSpacingCm >= MIN_RAIL_SEPARATION_CM, "Dock control spacing >= MIN_RAIL_SEPARATION_CM (6 cm, v4 dock)")
  check(audit.allInView, "All controls and modules in camera FOV from seated/standing gaze")

  for (const c of RAIL_CONTROLS) {
    const fov = angularOffsetFromGazeDeg(c.center)
    check(fov.inView, `Rail control ${c.sceneName} must be in camera FOV`)
  }
}

// 4. Deterministic Engine & Monotonic Replay (F01-F72)
console.log("-> 4. Deterministic Engine, Scrubbing & Replay Invariants")
{
  const engine = new BuildAliveEngine()
  check(engine.snapshot().cursorSeq === 0, "Initial cursor at 0")
  check(engine.snapshot().sceneMode === "PROJECT_OVERVIEW", "Initial sceneMode is PROJECT_OVERVIEW")

  // Step timeline forward through recorded steps
  for (let s = 1; s <= 6; s++) {
    engine.stepForward()
    check(engine.snapshot().cursorSeq >= s, `Cursor advances monotonically (step ${s})`)
  }

  // Active failure detection at step 4 (where test failed in recorded trace)
  engine.scrubToSeq(4)
  const failSnap = engine.snapshot()
  check(failSnap.activeFailures.length > 0, "Active failure present at seq 4")
  check(failSnap.activeFailures[0].evidenceId === "test-room-03", "Failure is test-room-03")

  // Step backward / rewind
  engine.stepBackward()
  check(engine.snapshot().cursorSeq === 3, "stepBackward rewound to seq 3")

  // Learning Atelier challenge
  engine.enterLearningMode(0)
  check(engine.snapshot().sceneMode === "LEARN", "Entered LEARN sceneMode")
  const learnRes = engine.submitPrediction("test-suite")
  check(learnRes.correct, "Correct prediction for case 0")
  check(engine.snapshot().lastPrediction.correct, "Snapshot records correct prediction")

  // Safe action approval workflow
  const prop = engine.proposeSafeAction("run_known_test", "tests/room-capacity.test.mjs")
  check(prop.ok, "proposeSafeAction succeeded")
  const appr = engine.approveAction(prop.request.requestId, "CONFIRMED_USER", prop.request.nonce)
  check(appr.ok, "approveAction succeeded")
  check(engine.isTestRepaired(), "Test is marked repaired after approval")

  // State hash determinism check (100 runs must produce identical hash)
  const baseHash = engine.computeDeterministicStateHash()
  for (let i = 0; i < 100; i++) {
    const h = engine.computeDeterministicStateHash()
    check(h === baseHash, `State hash must be deterministic (run ${i})`)
  }
}

// 5. Schema Migration & Persistence
console.log("-> 5. Schema Migration & Backward Compatibility")
{
  const legacyV0 = {
    selectedProject: "edge-guard",
    theme: "Midnight",
    reducedMotion: true,
  }
  const migrated = migratePersistedState(legacyV0)
  check(migrated.schemaVersion === 1, "Migrated to schemaVersion 1")
  check(migrated.lastProjectId === "edge-guard", "Preserved project selection")
  check(migrated.theme === "Midnight", "Preserved theme")
  check(migrated.reducedMotion === true, "Preserved reduced motion")
}

// 6. Monotonic Stress Sweep (1,000 distinct permutations)
console.log("-> 6. Permutation & Stress Invariants (1,000 runs)")
{
  const engine = new BuildAliveEngine()
  const projectIds = ["lobby-sync", "edge-guard", "earthproof-rover"]

  for (let i = 0; i < 1000; i++) {
    const pid = projectIds[i % projectIds.length]
    engine.selectProject(pid)
    engine.scrubToSeq((i * 3) % 15)
    if (i % 5 === 0) engine.stepForward()
    if (i % 7 === 0) engine.stepBackward()
    if (i % 11 === 0) engine.toggleLayer("dependency")
    const snap = engine.snapshot()
    check(typeof snap.stateHash === "string" && snap.stateHash.length === 8, "Valid 8-char stateHash")
    check(snap.projectId === pid, "Correct project selected")
  }
}

// 7. Live Bridge WebSocket Round-Trip & Latency Benchmarks
console.log("-> 7. Live Bridge WebSocket Round-Trip & Latency Profiling")
{
  const bridge = createBridgeServer({port: 8989})
  await bridge.listen()

  const ws = new WebSocket("ws://127.0.0.1:8989/build-alive")
  const receivedMessages = []

  await new Promise((resolve) => {
    ws.onopen = resolve
  })
  ws.onmessage = (event) => receivedMessages.push(JSON.parse(typeof event.data === "string" ? event.data : event.data.toString()))

  // Broadcast hook event
  const hookEv = normalizeClaudeHookEvent("PostToolUse", {
    toolName: "test_runner",
    params: {file_path: "D:\\dev\\EarthProof\\tests\\room-capacity.test.mjs"},
    sessionId: "ses_live_01",
  })
  check(hookEv !== null, "Hook normalized successfully")
  bridge.broadcast(hookEv)

  await new Promise((r) => setTimeout(r, 100))
  check(receivedMessages.length >= 1, "WebSocket received broadcasted event")

  // Latency Profiling (200 interactions)
  const latencies = []
  for (let i = 0; i < 200; i++) {
    const t0 = performance.now()
    const p = bridge.actionGate.proposeAction({
      actionId: ALLOWLISTED_ACTIONS.RUN_KNOWN_TEST,
      targetFile: "tests/room-capacity.test.mjs",
    })
    bridge.actionGate.resolveApproval({
      requestId: p.proposal.requestId,
      nonce: p.proposal.nonce,
      actorConfirmation: "CONFIRM",
      approved: true,
    })
    const elapsed = performance.now() - t0
    latencies.push(elapsed)
  }

  latencies.sort((a, b) => a - b)
  const p50 = latencies[Math.floor(latencies.length * 0.5)]
  const p95 = latencies[Math.floor(latencies.length * 0.95)]
  const p99 = latencies[Math.floor(latencies.length * 0.99)]

  console.log(`Latency benchmark: p50=${p50.toFixed(2)}ms, p95=${p95.toFixed(2)}ms, p99=${p99.toFixed(2)}ms`)
  check(p99 < 50.0, "p99 latency < 50 ms on local bridge processing")

  ws.close()
  await bridge.close()
}

// 8. Live Windows Antigravity, Claude Code & Codex Session Integration
console.log("-> 8. Live Windows Antigravity, Claude Code & Codex Session Integration")
{
  const discovered = discoverWindowsSessions()
  check(Array.isArray(discovered.antigravitySessions), "Antigravity sessions array returned")
  check(Array.isArray(discovered.claudeSessions), "Claude sessions array returned")
  check(Array.isArray(discovered.codexSessions), "Codex sessions array returned")

  const recentEvents = extractRecentWindowsEvents({maxEvents: 16})
  check(Array.isArray(recentEvents), "Extracted recent Windows events")

  const liveEngine = new BuildAliveEngine()
  for (const ev of recentEvents) {
    const val = validateEventEnvelope(ev)
    check(val.valid, `Extracted Windows event ${ev.eventId} passes v1 envelope schema`)
    const ing = liveEngine.ingestEvent(ev)
    check(ing.accepted, `Live engine ingested Windows event ${ev.eventId}`)
    check(!JSON.stringify(ev).includes("lalwa"), "Personal Windows username scrubbed from event")
  }

  // Verify live bridge with watchWindowsSessions: true and /sessions + /antigravity endpoints
  const liveBridge = createBridgeServer({port: 8991, watchWindowsSessions: true})
  await liveBridge.listen()

  const sessRes = await fetch("http://127.0.0.1:8991/sessions")
  check(sessRes.status === 200, "GET /sessions returns 200 OK")
  const sessJson = await sessRes.json()
  check(sessJson.status === "connected" && sessJson.watchingLive === true, "GET /sessions reports live watcher active")

  const noTok = await fetch("http://127.0.0.1:8991/antigravity", {method: "POST", headers: {"Content-Type": "application/json"}, body: "{}"})
  check(noTok.status === 401, "POST /antigravity without the shared secret is rejected (401)")
  const agToken = (await import("node:fs")).readFileSync(new URL("../../bridge/.hook-token", import.meta.url), "utf8").trim()
  const postRes = await fetch("http://127.0.0.1:8991/antigravity", {
    method: "POST",
    headers: {"Content-Type": "application/json", "x-build-alive-token": agToken},
    body: JSON.stringify({
      sessionId: "ebc49ffb-1ff7-47ff-b06f-fe425801a26f",
      step: {
        step_index: 9999,
        type: "PLANNER_RESPONSE",
        status: "DONE",
        created_at: new Date().toISOString(),
        thinking: "Confidential internal reasoning that must NEVER leak",
        tool_calls: [{name: "edit_file", args: {Path: "C:\\Users\\lalwa\\project\\BuildAliveCore.ts"}}],
      },
    }),
  })
  check(postRes.status === 200, "POST /antigravity accepts live step")
  const postJson = await postRes.json()
  check(postJson.accepted === true, "POST /antigravity normalized and journaled step")

  const allJournal = liveBridge.journal.getAllEvents()
  const lastJournalEv = allJournal[allJournal.length - 1]
  check(!JSON.stringify(lastJournalEv).includes("Confidential internal reasoning"), "Thinking field never leaked (F33)")
  check(!JSON.stringify(lastJournalEv).includes("lalwa"), "Host path scrubbed on /antigravity endpoint")

  await liveBridge.close()
}

console.log(`\n=== SWEEP COMPLETED SUCCESSFULLY: ${passedChecks} assertions verified, 0 failures ===`)
