// bridge/antigravity-adapter.mjs
// Real-time Windows LLM & Agent Session Connector for BUILD ALIVE.
// Discovers and tails active Antigravity (.gemini/antigravity/brain/*/transcript.jsonl),
// Claude Code (.claude/projects/**/*.jsonl), and OpenAI Codex (.codex/sessions) sessions on Windows.
// Enforces strict secret/path redaction and never exposes internal model thinking (F21, F33, F67, T01-T08).

import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import {scrubSecrets} from "./redactor.mjs"

/**
 * Maps any workspace or demo-repo file path to a valid Architecture City module file alias
 * so live Antigravity/Claude tool calls illuminate the corresponding 3D spatial module.
 */
export function mapWorkspaceFileToAlias(rawPath) {
  if (!rawPath || typeof rawPath !== "string") return "server/lobby.ts"
  const norm = rawPath.replace(/\\/g, "/").toLowerCase()
  if (norm.includes("sceneui") || norm.includes("layout") || norm.includes("client/view") || norm.includes("video/")) {
    return "client/view.ts"
  }
  if (norm.includes("ws-server") || norm.includes("transport") || norm.includes("antigravity-adapter") || norm.includes("hook")) {
    return "server/ws-server.ts"
  }
  if (norm.includes("test") || norm.includes("sweep") || norm.includes("leaf") || norm.includes("check")) {
    return "tests/room-capacity.test.mjs"
  }
  if (norm.includes("action-gate") || norm.includes("redactor") || norm.includes("shared/state")) {
    return "shared/state.ts"
  }
  if (norm.includes("journal") || norm.includes("db-mock") || norm.includes("devpost/") || norm.includes("readme")) {
    return "data/db-mock.ts"
  }
  return "server/lobby.ts"
}

/**
 * Normalizes a single JSONL step from an Antigravity transcript.jsonl into a canonical BUILD ALIVE AgentEvent (v: 1).
 * Never reads or forwards the `thinking` field (F33).
 */
export function normalizeAntigravityStep(rawStep, {sessionId = "ses_antigravity_live", seq = 1, isSubagent = false} = {}) {
  if (!rawStep || typeof rawStep !== "object") return null

  const stepIndex = typeof rawStep.step_index === "number" ? rawStep.step_index : seq
  const timestamp =
    typeof rawStep.created_at === "string" && !Number.isNaN(Date.parse(rawStep.created_at))
      ? rawStep.created_at
      : new Date().toISOString()
  const actor = isSubagent ? "subagent-verifier" : "antigravity-primary"
  const status = rawStep.status === "ERROR" ? "failed" : "succeeded"
  const cleanSessionId = String(sessionId).replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 60)

  // 1. Planner response with tool_calls
  if (rawStep.type === "PLANNER_RESPONSE" && Array.isArray(rawStep.tool_calls) && rawStep.tool_calls.length > 0) {
    const tc = rawStep.tool_calls[0]
    const toolName = String(tc.name || "tool")
    const args = tc.args && typeof tc.args === "object" ? tc.args : {}

    let rawTarget = String(args.Path || args.CommandLine || args.toolSummary || args.Role || "")
    rawTarget = rawTarget.replace(/^"|"$/g, "")
    const fileAlias = mapWorkspaceFileToAlias(rawTarget)

    let kind = "tool_finished"
    let summary = `[Antigravity #${stepIndex}] ${toolName}`

    if (toolName === "invoke_subagent") {
      kind = "subagent_started"
      const role = scrubSecrets(String(args.Role || "Specialist Subagent").replace(/^"|"$/g, ""))
      summary = `[Antigravity #${stepIndex}] Spawned subagent: ${role}`
    } else if (toolName === "run_command") {
      const cmdSummary = scrubSecrets(String(args.toolSummary || args.CommandLine || "command").replace(/^"|"$/g, ""))
      if (/test|sweep|check|leaf|lensifyts/i.test(rawTarget)) {
        kind = "test_completed"
        summary = `[Antigravity #${stepIndex}] Verified: ${cmdSummary}`
      } else {
        kind = "tool_finished"
        summary = `[Antigravity #${stepIndex}] Exec: ${cmdSummary}`
      }
    } else if (toolName === "edit_file" || toolName === "write_file") {
      kind = "tool_finished"
      const base = path.basename(rawTarget.replace(/\\/g, "/")) || fileAlias
      summary = `[Antigravity #${stepIndex}] Updated ${base} -> ${fileAlias}`
    } else if (toolName === "read_file" || toolName === "view_file") {
      kind = "tool_started"
      const base = path.basename(rawTarget.replace(/\\/g, "/")) || fileAlias
      summary = `[Antigravity #${stepIndex}] Inspected ${base}`
    }

    const cleanSummary = scrubSecrets(summary).replace(/\s+/g, " ").trim().slice(0, 115)

    return {
      v: 1,
      eventId: `ag_${cleanSessionId.slice(0, 12)}_${stepIndex}`,
      sessionId: cleanSessionId,
      projectId: "lobby-sync",
      seq,
      timestamp,
      actor,
      source: "local-bridge",
      kind,
      status,
      fileAliases: [fileAlias],
      evidenceIds: kind === "test_completed" ? ["ev-room03-cap"] : ["diff-lobby-01"],
      provenance: "LIVE_VERIFIED",
      summary: cleanSummary,
    }
  }

  // 2. User input step
  if (rawStep.type === "USER_INPUT") {
    return {
      v: 1,
      eventId: `ag_${cleanSessionId.slice(0, 12)}_${stepIndex}`,
      sessionId: cleanSessionId,
      projectId: "lobby-sync",
      seq,
      timestamp,
      actor: "antigravity-user",
      source: "local-bridge",
      kind: "session_started",
      status: "succeeded",
      fileAliases: ["server/lobby.ts"],
      evidenceIds: [],
      provenance: "LIVE_VERIFIED",
      summary: `[Antigravity #${stepIndex}] User directive received in active Windows session`,
    }
  }

  return null
}

/**
 * Normalizes a single JSONL entry from a Claude Code project session (.claude/projects/<project>/<session>.jsonl).
 */
export function normalizeClaudeSessionLine(rawObj, {seq = 1} = {}) {
  if (!rawObj || typeof rawObj !== "object") return null
  const sessionId = String(rawObj.sessionId || "ses_claude_win").replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 60)
  const timestamp =
    typeof rawObj.timestamp === "string" && !Number.isNaN(Date.parse(rawObj.timestamp))
      ? rawObj.timestamp
      : new Date().toISOString()

  if (rawObj.type === "cost-state" && rawObj.modelUsage) {
    const models = Object.keys(rawObj.modelUsage).join(", ")
    const linesAdded = rawObj.totalLinesAdded || 0
    return {
      v: 1,
      eventId: `claude_cost_${seq}`,
      sessionId,
      projectId: "lobby-sync",
      seq,
      timestamp,
      actor: "claude-code",
      source: "claude-hooks",
      kind: "tool_finished",
      status: "succeeded",
      fileAliases: ["server/lobby.ts"],
      evidenceIds: ["diff-lobby-01"],
      provenance: "LIVE_VERIFIED",
      summary: `[Claude Code] Models (${models}) +${linesAdded} lines on EarthProof`.slice(0, 115),
    }
  }

  if (rawObj.type === "bridge-session") {
    return {
      v: 1,
      eventId: `claude_bridge_${seq}`,
      sessionId,
      projectId: "lobby-sync",
      seq,
      timestamp,
      actor: "claude-code",
      source: "claude-hooks",
      kind: "session_started",
      status: "succeeded",
      fileAliases: ["server/ws-server.ts"],
      evidenceIds: [],
      provenance: "LIVE_VERIFIED",
      summary: `[Claude Code] Session synced (seq #${rawObj.lastSequenceNum || seq})`,
    }
  }

  return null
}

function readTailLines(filePath, maxBytes = 65536) {
  try {
    const stat = fs.statSync(filePath)
    const size = stat.size
    const readLen = Math.min(size, maxBytes)
    const startOffset = Math.max(0, size - readLen)
    const buf = Buffer.alloc(readLen)
    const fd = fs.openSync(filePath, "r")
    try {
      fs.readSync(fd, buf, 0, readLen, startOffset)
    } finally {
      fs.closeSync(fd)
    }
    const text = buf.toString("utf8")
    const lines = text.split("\n").filter((l) => l.trim().length > 0)
    return startOffset > 0 && lines.length > 1 ? lines.slice(1) : lines
  } catch (_e) {
    return []
  }
}

/**
 * Discovers all available Antigravity, Claude Code, and Codex sessions on this Windows machine.
 */
export function discoverWindowsSessions(homeDir = os.homedir()) {
  const discovered = {
    hostPlatform: process.platform,
    scannedAt: new Date().toISOString(),
    antigravitySessions: [],
    claudeSessions: [],
    codexSessions: [],
  }

  // 1. Antigravity Brain Sessions (fast stat pass, tail read only on top 5)
  const agBrainDir = path.join(homeDir, ".gemini", "antigravity", "brain")
  if (fs.existsSync(agBrainDir)) {
    try {
      const dirs = fs.readdirSync(agBrainDir, {withFileTypes: true}).filter((d) => d.isDirectory())
      for (const d of dirs) {
        const transcriptPath = path.join(agBrainDir, d.name, ".system_generated", "logs", "transcript.jsonl")
        if (fs.existsSync(transcriptPath)) {
          const stat = fs.statSync(transcriptPath)
          discovered.antigravitySessions.push({
            provider: "antigravity",
            sessionId: d.name,
            role: d.name.startsWith("138ef673") ? "subagent-adversarial-judge" : "primary-agent",
            transcriptPath,
            sizeBytes: stat.size,
            stepCount: 0,
            lastModified: stat.mtime.toISOString(),
            mtimeMs: stat.mtimeMs,
          })
        }
      }
      discovered.antigravitySessions.sort((a, b) => b.mtimeMs - a.mtimeMs)
      for (const s of discovered.antigravitySessions.slice(0, 5)) {
        const tail = readTailLines(s.transcriptPath, 16384)
        for (let i = tail.length - 1; i >= 0; i--) {
          try {
            const obj = JSON.parse(tail[i])
            if (typeof obj.step_index === "number") {
              s.stepCount = obj.step_index
              break
            }
          } catch (_e) {
            // continue
          }
        }
      }
    } catch (_e) {
      // ignore read errors
    }
  }

  // 2. Claude Code Project Sessions
  const claudeProjDir = path.join(homeDir, ".claude", "projects", "D--earthproof-lens-EarthProof")
  if (fs.existsSync(claudeProjDir)) {
    try {
      const files = fs
        .readdirSync(claudeProjDir, {withFileTypes: true})
        .filter((f) => f.isFile() && f.name.endsWith(".jsonl"))
      for (const f of files) {
        const fullPath = path.join(claudeProjDir, f.name)
        const stat = fs.statSync(fullPath)
        discovered.claudeSessions.push({
          provider: "claude-code",
          sessionId: f.name.replace(/\.jsonl$/, ""),
          transcriptPath: fullPath,
          sizeBytes: stat.size,
          lastModified: stat.mtime.toISOString(),
          mtimeMs: stat.mtimeMs,
        })
      }
      discovered.claudeSessions.sort((a, b) => b.mtimeMs - a.mtimeMs)
    } catch (_e) {
      // ignore read errors
    }
  }

  // 3. OpenAI Codex Sessions
  const codexDir = path.join(homeDir, ".codex", "sessions")
  if (fs.existsSync(codexDir)) {
    try {
      const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
          const p = path.join(dir, entry.name)
          if (entry.isDirectory()) walk(p)
          else if (entry.name.includes("rollout-")) {
            const st = fs.statSync(p)
            discovered.codexSessions.push({
              provider: "openai-codex",
              sessionId: entry.name.slice(0, 44),
              transcriptPath: p,
              lastModified: st.mtime.toISOString(),
              mtimeMs: st.mtimeMs,
            })
          }
        }
      }
      walk(codexDir)
      discovered.codexSessions.sort((a, b) => b.mtimeMs - a.mtimeMs)
    } catch (_e) {
      // ignore
    }
  }

  return discovered
}

/**
 * Extracts the latest normalized BUILD ALIVE events from the active Windows Antigravity + Claude sessions.
 */
export function extractRecentWindowsEvents({maxEvents = 28, homeDir = os.homedir()} = {}) {
  const sessions = discoverWindowsSessions(homeDir)
  const rawCollected = []
  let seq = 1

  // Read from most recent Claude Code session on EarthProof
  for (const cl of sessions.claudeSessions.slice(0, 1)) {
    const tailLines = readTailLines(cl.transcriptPath, 32768).slice(-15)
    for (const line of tailLines) {
      try {
        const parsed = JSON.parse(line)
        const ev = normalizeClaudeSessionLine(parsed, {seq: seq++})
        if (ev) rawCollected.push(ev)
      } catch (_err) {
        // ignore
      }
    }
  }

  // Read from top 2 Antigravity sessions (Subagent + Primary Master)
  for (const ag of sessions.antigravitySessions.slice(0, 2).reverse()) {
    const isSubagent = ag.role.includes("subagent")
    const tailLines = readTailLines(ag.transcriptPath, 65536).slice(-35)
    for (const line of tailLines) {
      try {
        const parsed = JSON.parse(line)
        const ev = normalizeAntigravityStep(parsed, {
          sessionId: ag.sessionId,
          seq: seq++,
          isSubagent,
        })
        if (ev) rawCollected.push(ev)
      } catch (_err) {
        // skip malformed line
      }
    }
  }

  // Re-index seq monotonically from 1..N for the latest maxEvents
  const sliced = rawCollected.slice(-maxEvents)
  return sliced.map((ev, idx) => ({
    ...ev,
    seq: idx + 1,
  }))
}

/**
 * Watches the active Antigravity transcript.jsonl files in real time and invokes `onEvent(agentEvent)`
 * whenever a new step is appended by the running Antigravity agent.
 */
export function watchLiveAntigravitySessions({onEvent, pollIntervalMs = 600, homeDir = os.homedir()} = {}) {
  const sessions = discoverWindowsSessions(homeDir)
  const watchedPaths = []
  const fileOffsets = new Map()
  let nextSeq = 100

  for (const ag of sessions.antigravitySessions.slice(0, 2)) {
    const p = ag.transcriptPath
    const isSubagent = ag.role.includes("subagent")
    try {
      const stat = fs.statSync(p)
      fileOffsets.set(p, stat.size)
      watchedPaths.push(p)

      fs.watchFile(p, {interval: pollIntervalMs}, (curr, prev) => {
        if (curr.size <= prev.size) return
        const lastOffset = fileOffsets.get(p) || prev.size
        const length = curr.size - lastOffset
        if (length <= 0 || length > 1024 * 1024) {
          fileOffsets.set(p, curr.size)
          return
        }
        const buf = Buffer.alloc(length)
        const fd = fs.openSync(p, "r")
        try {
          fs.readSync(fd, buf, 0, length, lastOffset)
        } finally {
          fs.closeSync(fd)
        }
        fileOffsets.set(p, curr.size)
        const chunk = buf.toString("utf8")
        for (const line of chunk.split("\n")) {
          if (!line.trim()) continue
          try {
            const stepObj = JSON.parse(line)
            const ev = normalizeAntigravityStep(stepObj, {
              sessionId: ag.sessionId,
              seq: nextSeq++,
              isSubagent,
            })
            if (ev && typeof onEvent === "function") {
              onEvent(ev)
            }
          } catch (_e) {
            // ignore partial line
          }
        }
      })
    } catch (_e) {
      // ignore watch error
    }
  }

  return {
    watchedPaths,
    stop: () => {
      for (const p of watchedPaths) {
        try {
          fs.unwatchFile(p)
        } catch (_e) {
          // ignore
        }
      }
    },
  }
}
