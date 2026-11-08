// BuildAliveTransport.ts
// Optional local WebSocket transport for BUILD ALIVE (`ws://127.0.0.1:8787/build-alive`).
// Connects via Snap's InternetModule when configured; fails closed to LOCAL_RECORDED_REPLAY
// without throwing or blocking if the local bridge is offline or InternetModule is absent.

import {AgentEvent, AllowlistedActionId, BuildAliveEngine} from "./BuildAliveCore"

export const DEFAULT_BRIDGE_WS_URL = "ws://127.0.0.1:8787/build-alive"

export class BuildAliveTransport {
  private readonly engine: BuildAliveEngine
  private readonly url: string
  private socket: WebSocket | null = null
  private connected = false
  private lastError: string | null = null
  onStateChanged: (() => void) | null = null

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
      ws.onopen = () => {
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
      ws.onerror = () => {
        this.lastError = "bridge websocket error; falling back to LOCAL_RECORDED_REPLAY"
        this.connected = false
        this.engine.handleDisconnect()
        if (this.onStateChanged) this.onStateChanged()
      }
      ws.onclose = () => {
        this.connected = false
        this.engine.handleDisconnect()
        if (this.onStateChanged) this.onStateChanged()
      }
      return true
    } catch (e) {
      this.lastError = e instanceof Error ? e.message : "websocket init failed"
      this.connected = false
      this.engine.handleDisconnect()
      return false
    }
  }

  handleRawMessage(rawJson: string): {accepted: boolean; reason?: string; seq?: number} {
    if (!rawJson || rawJson.length > 16384) {
      return {accepted: false, reason: "payload empty or exceeds 16 KB safety cap"}
    }
    try {
      const parsed = JSON.parse(rawJson) as unknown
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
