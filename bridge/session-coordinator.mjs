// bridge/session-coordinator.mjs
// SessionCoordinator + Antigravity transcript adapter (v3).
// - Only tool calls/results are read (never `thinking`, never result bodies except exit code).
// - Each tool call and its result become two events, paired FIFO per session.
// - Events are emitted ONLY when the target resolves into an approved repo; otherwise counted as unmapped.
// - Appended-after-start steps are LIVE_VERIFIED; backfilled history is LOCAL_RECORDED_REPLAY.

import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import {scrubSecrets} from "./redactor.mjs"

const TEST_CMD = /\b(test|tests|sweep|check|jest|pytest|vitest|lensifyts|tsc)\b/i
const slug = (s, n = 64) => String(s).replace(/[^A-Za-z0-9._-]/g, "_").slice(0, n)

export class StepTranslator {
  constructor({resolver, sessionId, isSubagent = false}) {
    this.resolver = resolver
    this.sessionId = slug(sessionId, 40)
    this.sid8 = slug(sessionId, 8)
    this.isSubagent = isSubagent
    this.pending = []
  }

  resolveCall(tc) {
    const a = tc.args && typeof tc.args === "object" ? tc.args : {}
    const fileArg = a.Path || a.AbsolutePath || a.TargetFile || a.File
    if (fileArg) return this.resolver.resolvePath(String(fileArg))
    const text = [a.CommandLine, a.Cwd, a.Workspace].filter(Boolean).join(" ")
    if (text) return this.resolver.resolveText(text)
    return null
  }

  /** @returns {object[]} zero or more raw (un-sequenced) events */
  feed(step, {live}) {
    if (!step || typeof step !== "object") return []
    const ts = typeof step.created_at === "string" && !Number.isNaN(Date.parse(step.created_at)) ? step.created_at : new Date().toISOString()
    const prov = live ? "LIVE_VERIFIED" : "LOCAL_RECORDED_REPLAY"
    const actor = this.isSubagent ? "subagent-" + this.sid8 : "antigravity-primary"
    const out = []
    if (step.type === "PLANNER_RESPONSE" && Array.isArray(step.tool_calls)) {
      step.tool_calls.forEach((tc, i) => {
        const res = this.resolveCall(tc)
        const tool = slug(tc.name || "tool", 24)
        this.pending.push({tool, res, step: step.step_index, cmd: tc.args && tc.args.CommandLine ? String(tc.args.CommandLine) : ""})
        if (!res) {
          this.resolver.stats.unmapped++
          return
        }
        this.resolver.stats.mapped++
        out.push({
          v: 1,
          eventId: `ag-${this.sid8}-${step.step_index}-${i}-c`,
          sessionId: this.sessionId,
          projectId: res.projectId,
          timestamp: ts,
          actor,
          source: "local-bridge",
          kind: tool === "invoke_subagent" ? "subagent_started" : "tool_started",
          status: "running",
          fileAliases: res.alias ? [res.alias] : [],
          evidenceIds: [],
          provenance: prov,
          summary: scrubSecrets(`${tool} requested${res.alias ? " on " + path.posix.basename(res.alias) : " in repo"}`).slice(0, 100),
        })
      })
      return out
    }
    if (step.source === "MODEL" && step.type !== "PLANNER_RESPONSE" && this.pending.length > 0) {
      const call = this.pending.shift()
      if (!call.res) return []
      const content = typeof step.content === "string" ? step.content : ""
      const exit = /Command exited with code (\d+)/.exec(content)
      const failed = step.status === "ERROR" || (exit && exit[1] !== "0")
      const isTest = call.tool === "run_command" && TEST_CMD.test(call.cmd)
      out.push({
        v: 1,
        eventId: `ag-${this.sid8}-${step.step_index}-r`,
        sessionId: this.sessionId,
        projectId: call.res.projectId,
        timestamp: ts,
        actor,
        source: "local-bridge",
        kind: isTest ? "test_completed" : "tool_finished",
        status: failed ? "failed" : "succeeded",
        fileAliases: call.res.alias ? [call.res.alias] : [],
        evidenceIds: [],
        provenance: prov,
        summary: scrubSecrets(`${call.tool}${exit ? " exit " + exit[1] : failed ? " error" : " done"}${isTest ? " (test/check command)" : ""}`).slice(0, 100),
      })
      return out
    }
    return out
  }
}

function discoverTranscripts(homeDir, maxAgeMs) {
  const dir = path.join(homeDir, ".gemini", "antigravity", "brain")
  const found = []
  if (!fs.existsSync(dir)) return found
  for (const d of fs.readdirSync(dir, {withFileTypes: true})) {
    if (!d.isDirectory()) continue
    const p = path.join(dir, d.name, ".system_generated", "logs", "transcript.jsonl")
    try {
      const st = fs.statSync(p)
      if (Date.now() - st.mtimeMs <= maxAgeMs) found.push({sessionId: d.name, path: p, size: st.size})
    } catch (_e) {
      // no transcript
    }
  }
  return found
}

function readRange(p, from, to) {
  const len = to - from
  const buf = Buffer.alloc(len)
  const fd = fs.openSync(p, "r")
  try {
    fs.readSync(fd, buf, 0, len, from)
  } finally {
    fs.closeSync(fd)
  }
  return buf.toString("utf8")
}

/**
 * Backfills recent history as REPLAY, then tails appended steps as LIVE.
 * @returns {{stop():void, state():object}}
 */
export function watchAntigravity({resolver, onEvent, homeDir = os.homedir(), maxAgeMs = 20 * 60 * 1000, pollMs = 500, backfillBytes = 262144, backfillEvents = 24}) {
  const tracked = new Map() // path -> {offset, translator, carry}
  const status = {sessionsTracked: 0, liveEvents: 0, replayEvents: 0, lastLiveAt: null, lastLiveEventId: null}

  function attach(t, isStart) {
    const translator = new StepTranslator({resolver, sessionId: t.sessionId})
    const rec = {offset: t.size, translator, carry: ""}
    tracked.set(t.path, rec)
    if (isStart) {
      const from = Math.max(0, t.size - backfillBytes)
      const text = readRange(t.path, from, t.size)
      const lines = text.split("\n")
      if (from > 0) lines.shift()
      const evs = []
      for (const l of lines) {
        if (!l.trim()) continue
        try {
          evs.push(...translator.feed(JSON.parse(l), {live: false}))
        } catch (_e) {
          // skip
        }
      }
      for (const ev of evs.slice(-backfillEvents)) {
        status.replayEvents++
        onEvent(ev)
      }
      translator.pending.length = 0
    }
  }

  const initial = discoverTranscripts(homeDir, maxAgeMs)
  for (const t of initial) attach(t, true)
  status.sessionsTracked = tracked.size

  const timer = setInterval(() => {
    for (const t of discoverTranscripts(homeDir, maxAgeMs)) {
      if (!tracked.has(t.path)) {
        attach(t, false)
        tracked.get(t.path).offset = 0 // brand-new session: read from the start, as live
        status.sessionsTracked = tracked.size
      }
    }
    for (const [p, rec] of tracked) {
      let size
      try {
        size = fs.statSync(p).size
      } catch (_e) {
        continue
      }
      if (size <= rec.offset) continue
      const chunk = rec.carry + readRange(p, rec.offset, size)
      rec.offset = size
      const lines = chunk.split("\n")
      rec.carry = chunk.endsWith("\n") ? "" : lines.pop()
      if (chunk.endsWith("\n")) lines.pop()
      for (const l of lines) {
        if (!l.trim()) continue
        try {
          for (const ev of rec.translator.feed(JSON.parse(l), {live: true})) {
            status.liveEvents++
            status.lastLiveAt = new Date().toISOString()
            status.lastLiveEventId = ev.eventId
            onEvent(ev)
          }
        } catch (_e) {
          // partial/malformed line
        }
      }
    }
  }, pollMs)

  return {stop: () => clearInterval(timer), state: () => ({...status, sessionsTracked: tracked.size})}
}
