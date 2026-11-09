// BuildAliveProviders: the agent stations around the holographic core and the flow-pipeline stages.
// Statuses are a bundled SNAPSHOT of the local bridge's GET /providers (taken 2026-11-09 ~05:30 GMT on this PC); nothing here
// claims a live connection. The Lens only shows LIVE for the Claude Code station while its own websocket to the bridge is
// connected (engine connection state LIVE); otherwise that station reads REPLAY. Stations the bridge marks UNSUPPORTED can only
// be fed by generic AgentEvent import and are labelled as such.

export type ProviderBadge = "LIVE" | "REPLAY" | "OFFLINE" | "SIGN-IN" | "UNSUPPORTED"

export interface ProviderStation {
  readonly id: string
  readonly name: string
  readonly bridgeStatus: string
  readonly note: string
}

export const PROVIDERS_SNAPSHOT_SOURCE = "bridge /providers snapshot 2026-11-09 05:30 GMT"

export const PROVIDER_STATIONS: readonly ProviderStation[] = [
  {id: "claude-code", name: "Claude Code", bridgeStatus: "LIVE_CONNECTED", note: "documented lifecycle hooks -> POST /hook (opt-in)"},
  {id: "codex", name: "Codex", bridgeStatus: "OFFLINE", note: "binary not found on PATH; adapter not connected"},
  {id: "antigravity", name: "Antigravity", bridgeStatus: "OFFLINE", note: "local transcript tail; no sessions tracked"},
  {id: "opencode", name: "OpenCode", bridgeStatus: "OFFLINE", note: "binary not found; adapter not implemented"},
  {id: "hermes", name: "Hermes", bridgeStatus: "OFFLINE", note: "not installed; would use ACP over stdio"},
  {id: "openclaw", name: "OpenClaw", bridgeStatus: "OFFLINE", note: "binary not found; adapter not implemented"},
  {id: "chatgpt-app", name: "ChatGPT app", bridgeStatus: "UNSUPPORTED", note: "generic AgentEvent import only (REPLAY)"},
  {id: "grok-bots", name: "Grok bots", bridgeStatus: "UNSUPPORTED", note: "generic AgentEvent import only (REPLAY)"},
  {id: "instinct", name: "Instinct", bridgeStatus: "UNSUPPORTED", note: "generic AgentEvent import only (REPLAY)"},
  {id: "muse", name: "Muse", bridgeStatus: "UNSUPPORTED", note: "generic AgentEvent import only (REPLAY)"},
]

/** Honest badge for a station given whether THIS Lens has a live bridge connection right now. */
export function badgeFor(station: ProviderStation, lensConnectedLive: boolean): ProviderBadge {
  if (station.bridgeStatus === "LIVE_CONNECTED") return lensConnectedLive ? "LIVE" : "REPLAY"
  if (station.bridgeStatus === "UNSUPPORTED") return "UNSUPPORTED"
  if (station.bridgeStatus === "SIGN_IN" || station.bridgeStatus === "NEEDS_AUTH") return "SIGN-IN"
  return "OFFLINE"
}

/** The "how an AI agent works" flow, lit stage by stage from real or replayed events. */
export const FLOW_STAGES: readonly string[] = ["Prompt", "Plan", "Tools", "Files", "Tests", "Result", "Loop"]

/** Which stage an observed event lights (index into FLOW_STAGES), or -1 when nothing is happening. */
export function stageForEvent(kind: string | null, status: string | null): number {
  if (!kind) return -1
  if (kind === "session_started" || kind === "prompt_submitted") return 0
  if (kind === "subagent_started" || kind === "plan_updated") return 1
  if (kind === "tool_started") return 2
  if (kind === "tool_finished") return 3
  if (kind === "test_completed") return status === "failed" ? 4 : 5
  if (kind === "session_ended" || kind === "approval_resolved") return 6
  return 2
}
