// BuildAliveTransport.ts
// Optional local WebSocket transport for BUILD ALIVE (`ws://127.0.0.1:8787/build-alive`).
// Connects via Snap's InternetModule when configured; fails closed to LOCAL_RECORDED_REPLAY
// without throwing or blocking if the local bridge is offline or InternetModule is absent.

import {AgentEvent, AllowlistedActionId, BuildAliveEngine, validateWorkspaceWorlds, WorkspaceWorldPayload} from "./BuildAliveCore"

// ?history=1 asks the bridge for ONE compact RECORDED history frame (last sessions, grouped) instead of replaying the whole journal as events.
export const DEFAULT_BRIDGE_WS_URL = "ws://127.0.0.1:8787/build-alive?history=1"

export interface HistoryEvent {
  readonly kind: string
  readonly status: string
  readonly summary: string
  readonly actor: string
  readonly fileAliases: string[]
  readonly ts: number
}
export interface HistorySession {
  readonly sessionId: string
  readonly startedAt: number
  readonly lastAt: number
  readonly count: number
  readonly events: HistoryEvent[]
}

/** Validate a bridge history frame defensively (it is data from a local process, still never trusted). Returns [] for anything malformed. */
export function parseHistoryFrame(parsed: unknown): HistorySession[] {
  const root = parsed as {type?: unknown; sessions?: unknown}
  if (!root || root.type !== "history" || !Array.isArray(root.sessions)) return []
  const out: HistorySession[] = []
  for (const raw of root.sessions.slice(0, 3)) {
    const r = raw as {sessionId?: unknown; startedAt?: unknown; lastAt?: unknown; count?: unknown; events?: unknown}
    if (!r || typeof r.sessionId !== "string" || typeof r.startedAt !== "number" || typeof r.lastAt !== "number" || !Array.isArray(r.events)) continue
    const events: HistoryEvent[] = []
    for (const e of r.events.slice(-12)) {
      const ev = e as {kind?: unknown; status?: unknown; summary?: unknown; actor?: unknown; fileAliases?: unknown; ts?: unknown}
      if (!ev || typeof ev.kind !== "string" || typeof ev.ts !== "number") continue
      events.push({
        kind: ev.kind,
        status: typeof ev.status === "string" ? ev.status : "",
        summary: typeof ev.summary === "string" ? ev.summary.slice(0, 160) : "",
        actor: typeof ev.actor === "string" ? ev.actor : "",
        fileAliases: Array.isArray(ev.fileAliases) ? ev.fileAliases.filter((f) => typeof f === "string").slice(0, 3) as string[] : [],
        ts: ev.ts,
      })
    }
    out.push({sessionId: r.sessionId, startedAt: r.startedAt, lastAt: r.lastAt, count: typeof r.count === "number" ? r.count : events.length, events})
  }
  return out
}

/** "just now", "12 min ago", "earlier today", "yesterday" or a short date: the timestamp chip on a recorded session. */
export function whenLabel(ts: number, now: number): string {
  const diffMin = Math.round((now - ts) / 60000)
  if (diffMin < 2) return "just now"
  if (diffMin < 60) return diffMin + " min ago"
  const d = new Date(ts)
  const n = new Date(now)
  const sameDay = d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
  if (sameDay) return "earlier today"
  const y = new Date(now - 86400000)
  if (d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate()) return "yesterday"
  return d.getDate() + "/" + (d.getMonth() + 1)
}

export class BuildAliveTransport {
  private readonly engine: BuildAliveEngine
  private readonly url: string
  private socket: WebSocket | null = null
  private connected = false
  private lastError: string | null = null
  onStateChanged: (() => void) | null = null
  onWorkspace: ((worlds: WorkspaceWorldPayload[]) => void) | null = null
  onHistory: ((sessions: HistorySession[]) => void) | null = null

  constructor(engine: BuildAliveEngine, url: string = DEFAULT_BRIDGE_WS_URL) {
    this.engine = engine
    this.url = url
  }

  get isConnected(): boolean {
    return this.connected
  }

  get error(): string | null {
    return this.lastError
  }

  connect(internetModule: InternetModule | null): boolean {
    if (!internetModule || typeof internetModule.createWebSocket !== "function") {
      this.connected = false
      this.engine.handleDisconnect()
      return false
    }
    try {
      const ws = internetModule.createWebSocket(this.url)
      this.socket = ws
      print("[BuildAlive] bridge websocket connecting: " + this.url)
      ws.onopen = () => {
        print("[BuildAlive] bridge websocket OPEN")
        this.connected = true
        this.lastError = null
        this.engine.handleReconnect(true)
        if (this.onStateChanged) this.onStateChanged()
      }
      ws.onmessage = (event: WebSocketMessageEvent) => {
        const raw = typeof event.data === "string" ? event.data : ""
        const res = this.handleRawMessage(raw)
        if (res.accepted && typeof res.seq === "number") {
          this.engine.scrubToSeq(res.seq)
          if (this.onStateChanged) this.onStateChanged()
        }
      }
      ws.onerror = (ev: unknown) => {
        print("[BuildAlive] bridge websocket ERROR: " + JSON.stringify(ev))
        this.lastError = "bridge websocket error; falling back to LOCAL_RECORDED_REPLAY"
        this.connected = false
        this.engine.handleDisconnect()
        if (this.onStateChanged) this.onStateChanged()
      }
      ws.onclose = (ev: unknown) => {
        print("[BuildAlive] bridge websocket CLOSED: " + JSON.stringify(ev))
        this.connected = false
        this.engine.handleDisconnect()
        if (this.onStateChanged) this.onStateChanged()
      }
      return true
    } catch (e) {
      this.lastError = e instanceof Error ? e.message : "websocket init failed"
      print("[BuildAlive] bridge websocket init threw: " + this.lastError)
      this.connected = false
      this.engine.handleDisconnect()
      return false
    }
  }

  handleRawMessage(rawJson: string): {accepted: boolean; reason?: string; seq?: number} {
    const isWorkspace = typeof rawJson === "string" && rawJson.slice(0, 32).indexOf('"workspace"') >= 0
    const isHistory = typeof rawJson === "string" && rawJson.slice(0, 32).indexOf('"history"') >= 0
    if (!rawJson || rawJson.length > (isWorkspace || isHistory ? 65536 : 16384)) {
      return {accepted: false, reason: "payload empty or exceeds safety cap"}
    }
    try {
      const parsed = JSON.parse(rawJson) as unknown
      if (isHistory) {
        const sessions = parseHistoryFrame(parsed)
        if (sessions.length > 0 && this.onHistory) this.onHistory(sessions) // RECORDED history only: never fed to the engine as live events; bad frames keep the old history
        return {accepted: sessions.length > 0, reason: sessions.length > 0 ? "history_loaded" : "history_invalid"}
      }
      if (isWorkspace) {
        const v = validateWorkspaceWorlds(parsed)
        if (!v.ok) return {accepted: false, reason: "workspace_" + (v.error || "invalid")}
        if (this.onWorkspace) this.onWorkspace(v.worlds)
        return {accepted: true, reason: "workspace_loaded"}
      }
      return this.engine.ingestEvent(parsed)
    } catch (_err) {
      return {accepted: false, reason: "invalid JSON payload"}
    }
  }

  sendApprovedAction(actionId: AllowlistedActionId): boolean {
    if (!this.connected || !this.socket) return false
    try {
      const payload = JSON.stringify({
        v: 1,
        type: "approved_action",
        actionId,
        sentAtMs: Date.now(),
      })
      this.socket.send(payload)
      return true
    } catch (_err) {
      return false
    }
  }

  disconnect(): void {
    if (this.socket) {
      try {
        this.socket.close()
      } catch (_err) {
        // ignore close errors
      }
      this.socket = null
    }
    this.connected = false
    this.engine.handleDisconnect()
  }
}

export function makeSyntheticLiveEnvelope(
  seq: number,
  kind: AgentEvent["kind"],
  summary: string,
  fileAlias: string = "server/lobby.mjs",
): AgentEvent {
  return {
    v: 1,
    eventId: "ev-live-" + seq,
    sessionId: "ses_live_bridge_01",
    projectId: "lobby-sync",
    seq,
    timestamp: "2026-11-08T05:00:00.000Z",
    actor: "primary-agent",
    source: "claude-hooks",
    kind,
    status: "succeeded",
    fileAliases: [fileAlias],
    evidenceIds: [],
    provenance: "LIVE_VERIFIED",
    summary,
  }
}
