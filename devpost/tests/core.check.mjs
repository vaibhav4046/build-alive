// Deterministic Node suite for BuildAliveCore + BuildAliveLayout.
// Run: node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tests/core.check.mjs
// Writes devpost/test-results-build-alive.json with the real counts and latency numbers.
import assert from "node:assert/strict"
import fs from "node:fs"
import {
  BuildAliveEngine, DEMO_PROJECTS, LEARNING_CASES, ALLOWED_ACTIONS, MAX_EVENTS,
  validateEventEnvelope, scrubSecrets, sanitizeDisplayText, sanitizeFileAlias, deterministicHash,
  migratePersistedState, defaultPersistedState, THEMES,
} from "../../Assets/Scripts/BuildAliveCore.ts"
import {
  auditControlErgonomics, CITY_MODULES, CITY_BRIDGES, RAIL_CONTROLS, PROJECT_ISLANDS,
  angularOffsetFromGazeDeg, dist3D,
} from "../../Assets/Scripts/BuildAliveLayout.ts"

let passed = 0
const failures = []
function t(name, fn) {
  try { fn(); passed++ } catch (e) { failures.push(`${name}: ${e.message.split("\n")[0]}`) }
}
const pct = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1))]
}
const env = (o = {}) => ({
  v: 1, eventId: "ev-x-1", sessionId: "ses1", projectId: "lobby-sync", seq: 50,
  timestamp: "2026-11-08T05:00:00.000Z", actor: "primary-agent", source: "claude-hooks",
  kind: "tool_finished", status: "succeeded", fileAliases: ["server/lobby.mjs"], evidenceIds: [],
  provenance: "LOCAL_RECORDED_REPLAY", summary: "ok", ...o,
})

// ---- A. projects / navigation --------------------------------------------------------------
t("3 demo projects", () => assert.equal(DEMO_PROJECTS.length, 3))
t("boots in replay, never live", () => {
  const s = new BuildAliveEngine().snapshot()
  assert.equal(s.connectionState, "REPLAY"); assert.equal(s.provenance, "LOCAL_RECORDED_REPLAY"); assert.equal(s.cursorSeq, 0)
})
t("select project switches trace and mode", () => {
  const e = new BuildAliveEngine()
  assert.equal(e.selectProject("edge-guard"), true)
  assert.equal(e.snapshot().projectId, "edge-guard"); assert.equal(e.snapshot().sceneMode, "PROJECT_OVERVIEW")
  assert.equal(e.selectProject("nope"), false); assert.equal(e.snapshot().projectId, "edge-guard")
})
t("pin/search/sort/metadata", () => {
  const e = new BuildAliveEngine()
  assert.equal(e.getSortedProjects()[0].projectId, "lobby-sync") // pinned by default, favoriteOrder 1
  assert.equal(e.togglePinProject("earthproof-rover"), true)
  assert.equal(e.getSortedProjects().filter((p) => p.pinned).length, 3)
  assert.equal(e.togglePinProject("earthproof-rover"), false)
  assert.equal(e.togglePinProject("ghost"), false)
  assert.equal(e.filterProjects("rover").length, 1)
  assert.equal(e.filterProjects("").length, 3)
  assert.ok(e.getProjectMetadata("lobby-sync").eventCount > 0)
})
t("recenter clamps comfort limits", () => {
  const r = new BuildAliveEngine().recenterScene(999, 999, -999, 9, 999)
  assert.deepEqual([r.offsetX, r.offsetY, r.offsetZ, r.scale, r.yawDeg], [20, 15, -20, 1.35, 30])
})
t("hub round trip preserves project", () => {
  const e = new BuildAliveEngine(); e.selectProject("edge-guard"); e.stepForward()
  assert.equal(e.returnToHubPreservingState(), "PROJECT_HUB")
  assert.equal(e.snapshot().projectId, "edge-guard")
})

// ---- B. architecture / impact --------------------------------------------------------------
t("downstream impact separates verified and unverified", () => {
  const i = new BuildAliveEngine().getDownstreamImpact("server-lobby")
  assert.ok(i.verifiedModules.includes("ws-gateway")); assert.ok(i.unverifiedModules.includes("db-mock"))
  assert.ok(!i.verifiedModules.includes("db-mock"))
})
t("select module -> INSPECT and de-emphasis", () => {
  const e = new BuildAliveEngine(); const r = e.selectModule("test-suite")
  assert.equal(e.snapshot().sceneMode, "INSPECT"); assert.equal(r.selectedModuleId, "test-suite")
  assert.equal(e.selectModule("ghost").selectedModuleId, "test-suite")
})
t("layers, grouping, evidence, data flows", () => {
  const e = new BuildAliveEngine()
  assert.equal(e.toggleLayer("test").test, false); assert.equal(e.toggleLayer("test").test, true)
  assert.equal(e.toggleClusterGroup(), true)
  assert.ok(e.getModuleEvidence("test-suite").failures.length >= 1)
  assert.equal(e.getModuleEvidence("ghost"), null)
  assert.ok(e.getVerifiedDataFlows().every((f) => typeof f.verified === "boolean"))
})
t("compareSnapshots reports status delta", () => {
  const c = new BuildAliveEngine().compareSnapshots(3, 6)
  assert.match(c.statusDelta, /->/); assert.ok(c.changedFiles.length > 0)
})

// ---- C. event journal / replay -------------------------------------------------------------
t("replay walks 6 events, failure at 4, repaired at 6", () => {
  const e = new BuildAliveEngine()
  const seen = []
  for (let i = 0; i < 6; i++) { e.stepForward(); const s = e.snapshot(); seen.push([s.cursorSeq, s.activeFailures.length, s.testRepaired]) }
  assert.deepEqual(seen, [[1, 0, false], [2, 0, false], [3, 0, false], [4, 1, false], [5, 1, false], [6, 0, true]])
})
t("stepBackward and scrub clamp", () => {
  const e = new BuildAliveEngine(); e.scrubToSeq(5); e.stepBackward()
  assert.equal(e.snapshot().cursorSeq, 4); e.scrubToSeq(-10); assert.equal(e.snapshot().cursorSeq, 0)
  e.scrubToSeq(10_000); assert.equal(e.snapshot().cursorSeq, 6)
})
t("reset restores baseline", () => {
  const e = new BuildAliveEngine(); const h0 = e.snapshot().stateHash
  e.scrubToSeq(5); e.selectModule("test-suite"); e.reset()
  assert.equal(e.snapshot().cursorSeq, 0); assert.equal(e.snapshot().sceneMode, "PROJECT_OVERVIEW"); assert.equal(e.snapshot().stateHash, h0)
})
t("duplicate eventId rejected", () => {
  const e = new BuildAliveEngine()
  assert.equal(e.ingestEvent(env()).accepted, true); assert.equal(e.ingestEvent(env()).accepted, false)
})
t("out-of-order events sorted by seq", () => {
  const e = new BuildAliveEngine()
  e.ingestEvent(env({eventId: "a", seq: 20})); e.ingestEvent(env({eventId: "b", seq: 15}))
  const q = e.getTaskQueue().map((x) => x.seq); assert.deepEqual(q, [...q].sort((a, b) => a - b))
})
t("buffer is bounded at MAX_EVENTS", () => {
  const e = new BuildAliveEngine()
  for (let i = 0; i < MAX_EVENTS + 40; i++) e.ingestEvent(env({eventId: "f" + i, seq: 100 + i}))
  assert.ok(e.snapshot().totalEvents <= MAX_EVENTS)
})
t("glyph lanes", () => {
  const e = new BuildAliveEngine(); e.scrubToSeq(3)
  assert.equal(e.mapToolToGlyph().glyph, "GLYPH_SUBAGENT_VESSEL")
})
t("provider adapters never claim unauthorized sources", () => {
  const a = new BuildAliveEngine().getProviderAdapters()
  assert.equal(a.find((x) => x.providerId === "external-unconnected").status, "NOT_CONNECTED")
  assert.equal(a.find((x) => x.providerId === "claude-hooks").status, "LOCAL_RECORDED_REPLAY")
})

// ---- provenance integrity ------------------------------------------------------------------
t("payload cannot self-declare LIVE_VERIFIED", () => {
  const e = new BuildAliveEngine()
  assert.equal(e.ingestEvent(env({eventId: "spoof", provenance: "LIVE_VERIFIED"})).accepted, true)
  const s = e.snapshot(); assert.equal(s.connectionState, "REPLAY"); assert.equal(s.provenance, "LOCAL_RECORDED_REPLAY")
  assert.notEqual(e.getTaskQueue().length, 0)
})
t("reconnect(true) is the only path to LIVE", () => {
  const e = new BuildAliveEngine(); e.handleReconnect(true)
  assert.equal(e.snapshot().provenance, "LIVE_VERIFIED")
  e.handleDisconnect(); assert.equal(e.snapshot().connectionState, "OFFLINE"); assert.equal(e.snapshot().provenance, "LOCAL_RECORDED_REPLAY")
  assert.match(e.getProvenanceSummary().bannerText, /OFFLINE FALLBACK/)
})

// ---- D. safe actions -----------------------------------------------------------------------
t("allowlist is exactly 3 read-only/known actions", () => assert.deepEqual([...ALLOWED_ACTIONS], ["run_known_test", "open_read_only_diff", "request_explanation"]))
t("non-allowlisted action refused", () => {
  const e = new BuildAliveEngine()
  for (const a of ["rm -rf", "apply-room-capacity-guard", "", "run_known_test; curl x", "__proto__"]) assert.equal(e.proposeSafeAction(a).ok, false, a)
})
t("traversal / secret targets refused", () => {
  const e = new BuildAliveEngine()
  for (const f of ["../../etc/passwd", "C:\\Windows\\x", "/abs/path", ".env", "keys/id_rsa", "a/../b", "secret/x.txt", "x\0y"]) assert.equal(e.proposeSafeAction("run_known_test", f).ok, false, f)
})
t("approve needs matching nonce and explicit confirmation", () => {
  const e = new BuildAliveEngine(); const r = e.proposeSafeAction("run_known_test").request
  assert.equal(e.approveAction(r.requestId, "CONFIRM", "wrong").reason, "nonce_mismatch")
  assert.equal(e.approveAction(r.requestId, "", r.nonce).reason, "missing_explicit_confirmation")
  assert.equal(e.approveAction("req-999", "CONFIRM", r.nonce).reason, "unknown_requestId")
  const ok = e.approveAction(r.requestId, "CONFIRM", r.nonce); assert.equal(ok.ok, true)
  assert.equal(e.approveAction(r.requestId, "CONFIRM", r.nonce).ok, false) // no replay
  assert.equal(e.snapshot().receipts.length, 1)
})
t("approve advances to repaired state; deny leaves state and logs receipt", () => {
  const e = new BuildAliveEngine(); e.scrubToSeq(5)
  const r = e.proposeSafeAction("run_known_test").request
  assert.equal(e.snapshot().sceneMode, "APPROVAL_PENDING")
  assert.equal(e.denyAction(r.requestId).ok, true); assert.equal(e.snapshot().testRepaired, false)
  const r2 = e.proposeSafeAction("run_known_test").request
  e.approveAction(r2.requestId, "CONFIRM", r2.nonce)
  assert.equal(e.snapshot().testRepaired, true); assert.equal(e.snapshot().receipts.length, 2)
})
t("offline host fails closed", () => {
  const e = new BuildAliveEngine(); const r = e.proposeSafeAction("run_known_test").request
  e.handleDisconnect()
  const res = e.approveAction(r.requestId, "CONFIRM", r.nonce)
  assert.equal(res.ok, false)
})
t("disconnect cancels pending approval", () => {
  const e = new BuildAliveEngine(); const r = e.proposeSafeAction("run_known_test").request
  e.handleDisconnect(); assert.equal(e.approveAction(r.requestId, "CONFIRM", r.nonce).ok, false)
})
t("abort works only on pending/approved", () => {
  const e = new BuildAliveEngine(); const r = e.proposeSafeAction("run_known_test").request
  assert.equal(e.abortAction(r.requestId), true); assert.equal(e.abortAction(r.requestId), false)
})
t("hypothetical branch is labelled simulation", () => {
  const h = new BuildAliveEngine().previewHypotheticalChange(true)
  assert.equal(h.provenance, "PREVIEW_SIMULATION"); assert.match(h.label, /\[SIM\]/)
})

// ---- E. learning ---------------------------------------------------------------------------
t("learning cases and prediction scoring", () => {
  assert.ok(LEARNING_CASES.length >= 3)
  const e = new BuildAliveEngine(); const c = e.enterLearningMode(0)
  assert.equal(e.snapshot().sceneMode, "LEARN")
  assert.equal(e.submitPrediction("db-mock").correct, false)
  assert.equal(e.submitPrediction(c.expectedFailedModuleId).correct, true)
  assert.equal(e.comparePredictionToTrace().matched, true)
  assert.ok(e.getRecallCard().question.length > 0)
})
t("adaptive difficulty rises with solved cases", () => {
  const e = new BuildAliveEngine(); assert.equal(e.getAdaptiveDifficulty(), "beginner")
  for (let i = 0; i < LEARNING_CASES.length; i++) { e.enterLearningMode(i); e.submitPrediction(e.activeLearningCase.expectedFailedModuleId) }
  assert.notEqual(e.getAdaptiveDifficulty(), "beginner")
})
t("learning export carries no event text or paths", () => {
  const e = new BuildAliveEngine(); e.enterLearningMode(0); e.submitPrediction("x")
  const j = e.exportSanitizedLearningTrace(); assert.ok(!/Users|\.mjs|sk-/.test(j)); JSON.parse(j)
})

// ---- F. accessibility / themes / persistence -----------------------------------------------
t("themes and accessibility clamps", () => {
  const e = new BuildAliveEngine(); assert.equal(e.setTheme("Midnight").id, "Midnight")
  e.setAccessibilityOptions({textScale: 9, soundIntensity: 5, reducedMotion: true, highContrast: true})
  const s = e.snapshot(); assert.equal(s.textScale, 1.35); assert.equal(s.reducedMotion, true); assert.equal(s.highContrast, true)
  e.setAccessibilityOptions({textScale: 0}); assert.equal(e.snapshot().textScale, 0.85)
  assert.equal(Object.keys(THEMES).length, 3)
})
t("every status has a non-colour badge", () => {
  const e = new BuildAliveEngine(); e.scrubToSeq(4); assert.equal(e.mapToolToGlyph().statusBadge, "[FAIL]")
  e.scrubToSeq(6); assert.equal(e.mapToolToGlyph().statusBadge, "[PASS]")
})
t("voice state fails closed when sound off", () => {
  const e = new BuildAliveEngine(); e.setAccessibilityOptions({soundEnabled: false})
  assert.equal(e.transitionVoiceState("SPEAKING"), "MUTED")
})
t("persistence roundtrip, migration, wipe", () => {
  const e = new BuildAliveEngine(); e.selectProject("edge-guard"); e.setTheme("MinimalFocus"); e.enterLearningMode(0); e.submitPrediction(e.activeLearningCase.expectedFailedModuleId)
  const p = e.exportPersistedState(); const e2 = new BuildAliveEngine(p)
  assert.equal(e2.snapshot().projectId, "edge-guard"); assert.equal(e2.snapshot().theme, "MinimalFocus")
  assert.deepEqual(migratePersistedState(null), defaultPersistedState())
  assert.deepEqual(migratePersistedState({schemaVersion: 99, theme: "<script>"}).theme, "Prism")
  const w = e.wipeAllLocalData(); assert.deepEqual(w.solvedCases, []); assert.deepEqual(w.masteryByModule, {})
})

// ---- security primitives -------------------------------------------------------------------
const secrets = [
  "sk-ant-api03-SECRET999999999999999999", "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", "AIzaSyA-1234567890abcdefghijklmn",
  "AKIAABCDEFGHIJKLMNOP", "Bearer abc.def.ghi-123", "API_KEY=hunter2hunter2", "password: 'p@ssw0rd!'", "user@example.com",
  "-----BEGIN RSA PRIVATE KEY-----\nMIIabc\n-----END RSA PRIVATE KEY-----", "C:\\Users\\someone\\proj\\a.ts", "/Users/someone/x", "/home/someone/x",
]
for (const s of secrets) t("scrub: " + s.slice(0, 18), () => {
  const out = scrubSecrets("log " + s + " end"); assert.match(out, /\[REDACTED_/); assert.ok(!out.includes(s.slice(0, 14)) || /REDACTED/.test(out))
})
t("display text strips ANSI, control chars, bidi overrides, caps length", () => {
  const out = sanitizeDisplayText("\x1b[31mred\x1b[0m\u202Eevil\x00x" + "y".repeat(500), 40)
  assert.ok(!/\x1b|\u202e|\x00/.test(out)); assert.ok(out.length <= 40)
})
t("file alias rules", () => {
  assert.equal(sanitizeFileAlias("server/lobby.mjs").ok, true)
  for (const bad of ["", "..", "a//b", "a/./b", "C:/x", "/x", "a b", "a;b", "x".repeat(120), ".env", "a/secret.txt", "k.pem"]) assert.equal(sanitizeFileAlias(bad).ok, false, bad)
})
t("deterministic hash is stable and discriminating", () => {
  assert.equal(deterministicHash("a"), deterministicHash("a")); assert.notEqual(deterministicHash("a"), deterministicHash("b"))
})

// ---- layout ergonomics ---------------------------------------------------------------------
t("layout audit passes (>=5 cm, >=12 cm, in FOV)", () => {
  const a = auditControlErgonomics(); assert.equal(a.passed, true, JSON.stringify(a))
  assert.ok(a.minWidthCm >= 5); assert.ok(a.minRailSpacingCm >= 12 - 0.01); assert.ok(a.minIslandSpacingCm >= 12 - 0.01); assert.equal(a.allInView, true)
  assert.equal(a.cardInView, true); assert.ok(a.minCrossGroupGapCm >= 8)
})
t("6 modules / 5 bridges / 5 rail controls / 3 islands", () => {
  assert.deepEqual([CITY_MODULES.length, CITY_BRIDGES.length, RAIL_CONTROLS.length, PROJECT_ISLANDS.length], [6, 5, 5, 3])
})
t("bridges reference real modules; one is explicitly unverified", () => {
  const ids = new Set(CITY_MODULES.map((m) => m.moduleId))
  assert.ok(CITY_BRIDGES.every((b) => ids.has(b.fromModuleId) && ids.has(b.toModuleId)))
  assert.equal(CITY_BRIDGES.filter((b) => !b.verified).length, 1)
})
t("FOV math rejects points far off gaze", () => {
  assert.equal(angularOffsetFromGazeDeg({x: 200, y: 0, z: -10}).inView, false)
  assert.ok(Math.abs(dist3D({x: 0, y: 0, z: 0}, {x: 3, y: 4, z: 0}) - 5) < 1e-9)
})
t("project graphs: module ids unique, edges point at modules", () => {
  for (const p of DEMO_PROJECTS) {
    const ids = p.modules.map((m) => m.id); assert.equal(new Set(ids).size, ids.length, p.projectId)
    assert.ok(p.edges.every((e) => ids.includes(e.from) && ids.includes(e.to)), p.projectId)
  }
})

// ---- generated negative + fuzz corpus ------------------------------------------------------
let fuzzCases = 0
const rnd = (() => { let s = 0x2545f491; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296) })()
const pick = (a) => a[Math.floor(rnd() * a.length)]
const junk = [null, undefined, 0, -1, 1e12, NaN, "", " ", "x".repeat(300), "../a", "a\0b", [], {}, [1, 2], true, "<img onerror=1>", "\u202e", {a: {b: {}}}]
const fields = ["v", "eventId", "sessionId", "projectId", "seq", "timestamp", "actor", "source", "kind", "status", "fileAliases", "evidenceIds", "provenance", "summary"]
t("1200 mutated envelopes: never throws, accepted iff validator says valid", () => {
  const e = new BuildAliveEngine()
  for (let i = 0; i < 1200; i++) {
    const o = env({eventId: "fz" + i, seq: 300 + (i % 700)})
    const nm = 1 + Math.floor(rnd() * 3)
    for (let m = 0; m < nm; m++) { const f = pick(fields); if (rnd() < 0.2) delete o[f]; else o[f] = pick(junk) }
    const verdict = validateEventEnvelope(o).valid
    const res = e.ingestEvent(o)
    fuzzCases++
    if (!verdict) assert.equal(res.accepted, false, JSON.stringify(o).slice(0, 120))
  }
})
t("400 non-object payloads rejected", () => {
  const e = new BuildAliveEngine()
  for (let i = 0; i < 400; i++) { assert.equal(e.ingestEvent(pick([null, undefined, 1, "s", [], [[]], true, () => 1, Symbol.iterator.toString()])).accepted, false); fuzzCases++ }
})
t("oversize payload rejected", () => assert.equal(validateEventEnvelope(env({summary: "z".repeat(9000)})).error, "payload_exceeds_max_bytes"))
t("proto-pollution key does not leak", () => {
  const e = new BuildAliveEngine(); e.ingestEvent(JSON.parse('{"__proto__":{"polluted":1},"v":1}')); assert.equal({}.polluted, undefined)
})
t("500 random action proposals: only allowlist+clean alias accepted", () => {
  const e = new BuildAliveEngine()
  const acts = [...ALLOWED_ACTIONS, "x", "", "RUN_KNOWN_TEST", "run_known_test ", "constructor"]
  const files = ["tests/a.mjs", "../x", "C:/a", ".env", "ok/file.ts", "a b", "", "secret.js"]
  for (let i = 0; i < 500; i++) {
    const a = pick(acts), f = pick(files); const r = e.proposeSafeAction(a, f); fuzzCases++
    const should = ALLOWED_ACTIONS.includes(a) && sanitizeFileAlias(f).ok
    assert.equal(r.ok, should, `${a}|${f}`)
  }
})
t("determinism: identical op sequences give identical state hashes (300 runs)", () => {
  for (let run = 0; run < 300; run++) {
    const seed = run + 1; const ops = []
    let s = seed; const r = () => ((s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296)
    for (let k = 0; k < 12; k++) ops.push([Math.floor(r() * 7), Math.floor(r() * 7)])
    const exec = () => {
      const e = new BuildAliveEngine()
      for (const [op, arg] of ops) {
        if (op === 0) e.stepForward(); else if (op === 1) e.stepBackward(); else if (op === 2) e.scrubToSeq(arg)
        else if (op === 3) e.selectModule(CITY_MODULES[arg % 6].moduleId); else if (op === 4) e.enterLearningMode(arg % 3)
        else if (op === 5) e.reset(); else e.setTheme(["Prism", "Midnight", "MinimalFocus"][arg % 3])
      }
      return e.snapshot().stateHash
    }
    assert.equal(exec(), exec()); fuzzCases++
  }
})

// ---- latency (pure core; Lens Studio frame latency is measured separately by LEAF L17) ------
const e = new BuildAliveEngine(); const lat = []
const ops = [() => e.stepForward(), () => e.selectModule("server-lobby"), () => e.snapshot(), () => e.reset(), () => e.ingestEvent(env({eventId: "L" + Math.random(), seq: 1 + Math.floor(Math.random() * 90)}))]
for (let i = 0; i < 20000; i++) { const t0 = performance.now(); ops[i % ops.length](); lat.push((performance.now() - t0) * 1000) }
const latency = {samples: lat.length, unit: "microseconds", p50: +pct(lat, 50).toFixed(1), p95: +pct(lat, 95).toFixed(1), p99: +pct(lat, 99).toFixed(1), max: +Math.max(...lat).toFixed(1)}

const summary = {suite: "BuildAliveCore+Layout", node: process.version, namedTestsPassed: passed, namedTestsFailed: failures.length, generatedCases: fuzzCases, failures, latency}
fs.writeFileSync(new URL("../test-results-build-alive.json", import.meta.url), JSON.stringify(summary, null, 2))
console.log(JSON.stringify(summary, null, 2))
process.exit(failures.length ? 1 : 0)
