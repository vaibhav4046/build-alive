// bridge/provider-registry.mjs
// AgentAdapterRegistry: discovery + honest status. Nothing is reported connected without evidence.
// Status: LIVE_CONNECTED | REPLAY_IMPORTED | OFFLINE | UNSUPPORTED | AUTH_REQUIRED

import {execFileSync} from "node:child_process"

function version(bin) {
  try {
    const out = execFileSync("cmd.exe", ["/c", bin, "--version"], {encoding: "utf8", timeout: 10000, stdio: ["ignore", "pipe", "ignore"]})
    return out.trim().split("\n")[0].slice(0, 60)
  } catch (_e) {
    return null
  }
}

export function detectProviders({antigravityState = null, hookEvents = 0} = {}) {
  const now = Date.now()
  const live = antigravityState && antigravityState.lastLiveAt && now - Date.parse(antigravityState.lastLiveAt) < 120000
  const list = []
  list.push({
    provider: "antigravity",
    status: live ? "LIVE_CONNECTED" : antigravityState && antigravityState.replayEvents > 0 ? "REPLAY_IMPORTED" : "OFFLINE",
    mechanism: "local transcript tail (tool calls/results only; no reasoning, no result bodies)",
    capabilities: {observe: true, propose: false, launch: false, approveExecute: false},
    evidence: antigravityState ? {sessionsTracked: antigravityState.sessionsTracked, liveEvents: antigravityState.liveEvents, replayEvents: antigravityState.replayEvents, lastLiveAt: antigravityState.lastLiveAt, lastLiveEventId: antigravityState.lastLiveEventId} : null,
    limitation: "Observes sessions on this PC only. Tool-call steps are 'requested'; results are paired FIFO.",
  })
  const claudeV = version("claude")
  list.push({
    provider: "claude-code",
    status: hookEvents > 0 ? "LIVE_CONNECTED" : "OFFLINE",
    installedVersion: claudeV,
    mechanism: "documented lifecycle hooks (PreToolUse/PostToolUse) -> POST /hook",
    capabilities: {observe: true, propose: false, launch: false, approveExecute: false},
    limitation: claudeV ? "Installed, but no hook is registered for the approved repos (opt-in; merge into existing hooks, never override)." : "Not installed.",
  })
  for (const [name, bin, note] of [
    ["opencode", "opencode", "Plugin event bus (session.*, tool.execute.*) adapter not implemented yet."],
    ["openclaw", "openclaw", "Gateway session/tool events adapter not implemented yet."],
    ["codex", "codex", "Not installed; would use `codex exec --json` item events."],
    ["hermes", "hermes", "Not installed; would use ACP over stdio."],
  ]) {
    const v = version(bin)
    list.push({provider: name, status: v ? "UNSUPPORTED" : "OFFLINE", installedVersion: v, mechanism: "documented protocol (see docs)", capabilities: {observe: false, propose: false, launch: false, approveExecute: false}, limitation: v ? note : "Binary not found on PATH. " + note})
  }
  for (const n of ["chatgpt-app", "grok-bots", "instinct", "muse"]) {
    list.push({provider: n, status: "UNSUPPORTED", mechanism: "no documented local event API used; will not scrape private apps", capabilities: {observe: false, propose: false, launch: false, approveExecute: false}, limitation: "Use generic AgentEvent import (labelled REPLAY)."})
  }
  return list
}
