// BuildAliveCore: Pure, deterministic TypeScript implementation of the 72 BUILD ALIVE capabilities (F01-F72).
// Zero Lens Studio global dependencies so this exact file runs in Lens Studio (lensifyts) AND Node.js tests.

export type ProvenanceMode =
  | "LIVE_VERIFIED"
  | "LOCAL_RECORDED_REPLAY"
  | "PREVIEW_SIMULATION"
  | "NOT_CONNECTED"
  | "TESTED"
  | "UNVERIFIED"

export type ConnectionState = "LIVE" | "REPLAY" | "OFFLINE"

export type SceneMode =
  | "BOOT"
  | "PLACEMENT"
  | "PROJECT_HUB"
  | "PROJECT_OVERVIEW"
  | "LIVE_OR_REPLAY"
  | "INSPECT"
  | "LEARN"
  | "APPROVAL_PENDING"
  | "ERROR"
  | "RESULT"

export type VoiceState =
  | "MUTED"
  | "IDLE"
  | "LISTENING"
  | "PROCESSING"
  | "SPEAKING"
  | "INTERRUPTED"
  | "FAILED"

export type VisualThemeId = "Prism" | "Midnight" | "MinimalFocus"

export type EvidenceDensity = "beginner" | "expert"

export type DifficultyTier = "beginner" | "intermediate" | "advanced"

export type DistrictRole = "UI" | "Logic" | "API" | "Data" | "Tests" | "Assets"

export type EdgeKind = "imports" | "calls_ws" | "reads_state" | "verifies" | "unknown"

export type EventKind =
  | "session_started"
  | "tool_started"
  | "tool_finished"
  | "subagent_started"
  | "subagent_stopped"
  | "test_completed"
  | "approval_requested"
  | "approval_resolved"

export type EventStatus = "pending" | "running" | "succeeded" | "failed" | "denied" | "cancelled"

export type AllowlistedActionId = "run_known_test" | "open_read_only_diff" | "request_explanation"

export type SoundCueId = "none" | "chime_pass" | "pulse_change" | "crack_fail" | "chime_approve" | "chime_select"

export interface AgentEvent {
  readonly v: 1
  readonly eventId: string
  readonly sessionId: string
  readonly projectId: string
  readonly seq: number
  readonly timestamp: string
  readonly actor: string
  readonly source: "claude-hooks" | "codex-sdk" | "recorded-trace" | "local-bridge"
  readonly kind: EventKind
  readonly status: EventStatus
  readonly fileAliases: readonly string[]
  readonly evidenceIds: readonly string[]
  readonly provenance: ProvenanceMode
  readonly summary?: string
}

export interface ModuleNode {
  readonly id: string
  readonly label: string
  readonly role: DistrictRole
  readonly clusterId: string
  readonly files: readonly string[]
  readonly summary: string
  readonly status: "healthy" | "changed" | "failed" | "active_agent"
  readonly lastDiffId?: string
}

export interface DependencyEdge {
  readonly id: string
  readonly from: string
  readonly to: string
  readonly kind: EdgeKind
  readonly verified: boolean
  readonly dataFlowLabel?: string
}

export interface FileDiffEvidence {
  readonly diffId: string
  readonly moduleId: string
  readonly fileAlias: string
  readonly beforeLine: string
  readonly afterLine: string
  readonly addedLines: number
  readonly removedLines: number
  readonly explanation: string
}

export interface TestFailureEvidence {
  readonly evidenceId: string
  readonly testName: string
  readonly moduleId: string
  readonly causeModuleId: string
  readonly fileAlias: string
  readonly redactedOutput: string
  readonly expectedValue: string
  readonly actualValue: string
  readonly uncertaintyFlag: boolean
  readonly repairSummary: string
}

export interface LearningCase {
  readonly caseId: string
  readonly projectId: string
  readonly title: string
  readonly prompt: string
  readonly changedModuleId: string
  readonly expectedFailedModuleId: string
  readonly evidenceId: string
  readonly whyItMatters: string
  readonly recallQuestion: string
  readonly recallAnswer: string
  readonly difficulty: DifficultyTier
}

export interface ApprovalRequest {
  readonly requestId: string
  readonly actionId: AllowlistedActionId
  readonly projectId: string
  readonly targetFileAlias: string
  readonly description: string
  readonly nonce: string
  readonly createdAtMs: number
  status: "pending" | "approved" | "denied" | "cancelled" | "executed" | "failed"
  receiptId?: string
}

export interface AuditReceipt {
  readonly receiptId: string
  readonly requestId: string
  readonly actionId: AllowlistedActionId
  readonly actorConfirmation: string
  readonly decision: "approved" | "denied" | "cancelled"
  readonly timestampMs: number
  readonly provenance: ProvenanceMode
  readonly signatureHash: string
}

export interface ProjectDescriptor {
  readonly projectId: string
  readonly title: string
  readonly subtitle: string
  readonly sourcePathAlias: string
  readonly lastEventTimestamp: string
  readonly provenance: ProvenanceMode
  pinned: boolean
  favoriteOrder: number
  readonly modules: readonly ModuleNode[]
  readonly edges: readonly DependencyEdge[]
  readonly diffs: readonly FileDiffEvidence[]
  readonly failures: readonly TestFailureEvidence[]
  readonly recordedEvents: readonly AgentEvent[]
}

export interface GraphLayerVisibility {
  source: boolean
  test: boolean
  agent: boolean
  dependency: boolean
}

export interface ThemePalette {
  readonly id: VisualThemeId
  readonly tealVerified: readonly [number, number, number, number]
  readonly amberChanged: readonly [number, number, number, number]
  readonly coralFailed: readonly [number, number, number, number]
  readonly violetAgent: readonly [number, number, number, number]
  readonly slateUnknown: readonly [number, number, number, number]
  readonly navyBase: readonly [number, number, number, number]
}

export interface PersistedStateV1 {
  readonly schemaVersion: 1
  readonly lastProjectId: string
  readonly pinnedProjects: readonly string[]
  readonly masteryByModule: Record<string, number>
  readonly solvedCases: readonly string[]
  readonly failedCases: number
  readonly theme: VisualThemeId
  readonly reducedMotion: boolean
  readonly soundEnabled: boolean
  readonly highContrast: boolean
  readonly textScale: number
  readonly evidenceDensity: EvidenceDensity
}

export const MAX_EVENTS = 128
export const MAX_POOLED_MESHES = 18
export const MAX_PAYLOAD_BYTES = 4096

export const ALLOWED_ACTIONS: readonly AllowlistedActionId[] = Object.freeze([
  "run_known_test",
  "open_read_only_diff",
  "request_explanation",
])

const VALID_KINDS: ReadonlySet<string> = new Set([
  "session_started",
  "tool_started",
  "tool_finished",
  "subagent_started",
  "subagent_stopped",
  "test_completed",
  "approval_requested",
  "approval_resolved",
])

const VALID_STATUSES: ReadonlySet<string> = new Set([
  "pending",
  "running",
  "succeeded",
  "failed",
  "denied",
  "cancelled",
])

const VALID_PROVENANCE: ReadonlySet<string> = new Set([
  "LIVE_VERIFIED",
  "LOCAL_RECORDED_REPLAY",
  "PREVIEW_SIMULATION",
  "NOT_CONNECTED",
  "TESTED",
  "UNVERIFIED",
])

export const THEMES: Record<VisualThemeId, ThemePalette> = {
  Prism: {
    id: "Prism",
    tealVerified: [0.2, 0.95, 0.85, 1.0],
    amberChanged: [1.0, 0.78, 0.22, 1.0],
    coralFailed: [1.0, 0.38, 0.34, 1.0],
    violetAgent: [0.72, 0.48, 1.0, 1.0],
    slateUnknown: [0.62, 0.68, 0.75, 0.75],
    navyBase: [0.14, 0.24, 0.36, 0.92],
  },
  Midnight: {
    id: "Midnight",
    tealVerified: [0.15, 0.88, 0.78, 1.0],
    amberChanged: [0.95, 0.72, 0.18, 1.0],
    coralFailed: [0.98, 0.32, 0.3, 1.0],
    violetAgent: [0.64, 0.42, 0.95, 1.0],
    slateUnknown: [0.52, 0.58, 0.65, 0.75],
    navyBase: [0.08, 0.14, 0.24, 0.95],
  },
  MinimalFocus: {
    id: "MinimalFocus",
    tealVerified: [0.35, 1.0, 0.9, 1.0],
    amberChanged: [1.0, 0.88, 0.3, 1.0],
    coralFailed: [1.0, 0.45, 0.4, 1.0],
    violetAgent: [0.85, 0.65, 1.0, 1.0],
    slateUnknown: [0.8, 0.85, 0.9, 0.9],
    navyBase: [0.18, 0.28, 0.4, 1.0],
  },
}

// ---- Security, Redaction & Validation (F21, F67, T01-T08) ---------------------------------------

const SECRET_PATTERNS: readonly RegExp[] = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /\b(?:sk|rk|pk)-[A-Za-z0-9_\-]{12,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{16,}\b/g,
  /\bAIza[0-9A-Za-z\-_]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\b(?:API_KEY|SECRET|TOKEN|PASSWORD|PASSWD|CREDENTIAL|AUTH_TOKEN)\s*[:=]\s*["']?[^\s"']{4,}["']?/gi,
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
]

const FORBIDDEN_FILE_PATTERNS: readonly RegExp[] = [
  /(?:^|\/)\.env(?:\.|$)/i,
  /(?:^|\/)\.mcp\.json$/i,
  /(?:^|\/)id_rsa/i,
  /\.pem$/i,
  /\.key$/i,
  /secret/i,
  /credential/i,
]

/**
 * Scrubs credentials, bearer tokens, API keys, emails, and host user paths from any string (F67).
 */
export function scrubSecrets(raw: string): string {
  if (typeof raw !== "string" || raw.length === 0) return ""
  let out = raw
  // Strip Windows and POSIX user home paths
  out = out.replace(/[A-Za-z]:\\Users\\[^\\\s"']+/gi, "[REDACTED_USER_PATH]")
  out = out.replace(/\/Users\/[^/\s"']+/g, "[REDACTED_USER_PATH]")
  out = out.replace(/\/home\/[^/\s"']+/g, "[REDACTED_USER_PATH]")
  for (const pat of SECRET_PATTERNS) {
    out = out.replace(pat, "[REDACTED_SECRET]")
  }
  return out
}

/**
 * Strips ANSI escape sequences, ASCII control characters, and directional overrides,
 * and caps length for safe AR HUD display (T05).
 */
export function sanitizeDisplayText(raw: string, maxLen: number = 120): string {
  if (typeof raw !== "string") return ""
  const noAnsi = raw.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "")
  const noCtrl = noAnsi.replace(/[\x00-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]/g, " ")
  const scrubbed = scrubSecrets(noCtrl).replace(/\s+/g, " ").trim()
  return scrubbed.length > maxLen ? scrubbed.slice(0, maxLen - 3) + "..." : scrubbed
}

/**
 * Validates and normalizes a repository file alias, rejecting path traversal, absolute paths,
 * UNC paths, and secret filenames (T02, F67).
 */
export function sanitizeFileAlias(input: string): {ok: boolean; alias: string; reason?: string} {
  if (typeof input !== "string" || input.trim().length === 0) {
    return {ok: false, alias: "", reason: "empty_path"}
  }
  if (input.indexOf("\0") !== -1) {
    return {ok: false, alias: "", reason: "null_byte"}
  }
  const trimmed = input.trim().replace(/\\/g, "/")
  if (/^[A-Za-z]:/.test(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return {ok: false, alias: "", reason: "absolute_or_drive_path"}
  }
  const parts = trimmed.split("/")
  for (const p of parts) {
    if (p === "" || p === "." || p === "..") {
      return {ok: false, alias: "", reason: "path_traversal"}
    }
    if (!/^[A-Za-z0-9._\-]+$/.test(p)) {
      return {ok: false, alias: "", reason: "invalid_characters"}
    }
  }
  const normalized = parts.join("/")
  for (const pat of FORBIDDEN_FILE_PATTERNS) {
    if (pat.test(normalized)) {
      return {ok: false, alias: "", reason: "forbidden_secret_file"}
    }
  }
  if (normalized.length > 96) {
    return {ok: false, alias: "", reason: "path_too_long"}
  }
  return {ok: true, alias: normalized}
}

/**
 * Validates an untrusted event payload against the canonical v1 protocol schema (F21).
 */
export function validateEventEnvelope(raw: unknown): {
  valid: boolean
  event?: AgentEvent
  error?: string
} {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return {valid: false, error: "not_an_object"}
  }
  const serialized = JSON.stringify(raw)
  if (serialized.length > MAX_PAYLOAD_BYTES) {
    return {valid: false, error: "payload_exceeds_max_bytes"}
  }
  const r = raw as Record<string, unknown>
  if (r.v !== 1) {
    return {valid: false, error: "unsupported_version"}
  }
  const slugFields = ["eventId", "sessionId", "projectId", "actor"] as const
  for (const f of slugFields) {
    const val = r[f]
    if (typeof val !== "string" || !/^[A-Za-z0-9._\-]{1,64}$/.test(val)) {
      return {valid: false, error: "invalid_" + f}
    }
  }
  if (typeof r.seq !== "number" || !Number.isInteger(r.seq) || r.seq < 0 || r.seq > 1_000_000) {
    return {valid: false, error: "invalid_seq"}
  }
  if (typeof r.timestamp !== "string" || Number.isNaN(Date.parse(r.timestamp))) {
    return {valid: false, error: "invalid_timestamp"}
  }
  if (typeof r.kind !== "string" || !VALID_KINDS.has(r.kind)) {
    return {valid: false, error: "invalid_kind"}
  }
  if (typeof r.status !== "string" || !VALID_STATUSES.has(r.status)) {
    return {valid: false, error: "invalid_status"}
  }
  if (typeof r.provenance !== "string" || !VALID_PROVENANCE.has(r.provenance)) {
    return {valid: false, error: "invalid_provenance"}
  }
  const source = r.source
  if (
    source !== "claude-hooks" &&
    source !== "codex-sdk" &&
    source !== "recorded-trace" &&
    source !== "local-bridge"
  ) {
    return {valid: false, error: "invalid_source"}
  }
  if (!Array.isArray(r.fileAliases) || r.fileAliases.length > 8) {
    return {valid: false, error: "invalid_fileAliases"}
  }
  const cleanAliases: string[] = []
  for (const fa of r.fileAliases) {
    const res = sanitizeFileAlias(String(fa))
    if (!res.ok) {
      return {valid: false, error: "invalid_fileAlias:" + res.reason}
    }
    cleanAliases.push(res.alias)
  }
  if (!Array.isArray(r.evidenceIds) || r.evidenceIds.length > 8) {
    return {valid: false, error: "invalid_evidenceIds"}
  }
  const cleanEvidence: string[] = []
  for (const ev of r.evidenceIds) {
    if (typeof ev !== "string" || !/^[A-Za-z0-9._\-]{1,64}$/.test(ev)) {
      return {valid: false, error: "invalid_evidenceId"}
    }
    cleanEvidence.push(ev)
  }

  const summary = typeof r.summary === "string" ? sanitizeDisplayText(r.summary, 120) : undefined

  return {
    valid: true,
    event: {
      v: 1,
      eventId: r.eventId as string,
      sessionId: r.sessionId as string,
      projectId: r.projectId as string,
      seq: r.seq as number,
      timestamp: r.timestamp as string,
      actor: r.actor as string,
      source,
      kind: r.kind as EventKind,
      status: r.status as EventStatus,
      fileAliases: cleanAliases,
      evidenceIds: cleanEvidence,
      provenance: r.provenance as ProvenanceMode,
      summary,
    },
  }
}

/**
 * Deterministic FNV-1a 32-bit hex digest for state verification and audit receipts (F68, F39).
 */
export function deterministicHash(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return ("00000000" + (h >>> 0).toString(16)).slice(-8)
}

// ---- Built-in Sanitized Demo Projects & Recorded Traces (F02, F11-F16, F22, F43) ----------------

export const DEMO_PROJECTS: readonly ProjectDescriptor[] = [
  {
    projectId: "lobby-sync",
    title: "LobbySync",
    subtitle: "Multiplayer Room & State Engine",
    sourcePathAlias: "demo-repo/lobby-sync",
    lastEventTimestamp: "2026-11-08T05:00:06.000Z",
    provenance: "LOCAL_RECORDED_REPLAY",
    pinned: true,
    favoriteOrder: 1,
    modules: [
      {
        id: "client-ui",
        label: "UI:Client",
        role: "UI",
        clusterId: "cluster-frontend",
        files: ["client/view.ts"],
        summary: "Renders player roster & room status",
        status: "healthy",
      },
      {
        id: "server-lobby",
        label: "Logic:Lobby",
        role: "Logic",
        clusterId: "cluster-core",
        files: ["server/lobby.ts"],
        summary: "Enforces maxPlayers=4 capacity guard",
        status: "healthy",
        lastDiffId: "diff-lobby-01",
      },
      {
        id: "ws-gateway",
        label: "API:WS",
        role: "API",
        clusterId: "cluster-core",
        files: ["server/ws-server.ts"],
        summary: "Broadcasts join/leave room frames",
        status: "healthy",
      },
      {
        id: "shared-state",
        label: "Data:State",
        role: "Data",
        clusterId: "cluster-state",
        files: ["shared/state.ts"],
        summary: "Canonical room state reducer",
        status: "healthy",
      },
      {
        id: "db-mock",
        label: "Assets:DB",
        role: "Assets",
        clusterId: "cluster-state",
        files: ["data/db-mock.ts"],
        summary: "In-memory session snapshot store",
        status: "healthy",
      },
      {
        id: "test-suite",
        label: "Tests:Room03",
        role: "Tests",
        clusterId: "cluster-qa",
        files: ["tests/room-capacity.test.mjs"],
        summary: "Verifies 4-player room cap & state sync",
        status: "healthy",
      },
    ],
    edges: [
      {
        id: "bridge-client-lobby",
        from: "client-ui",
        to: "server-lobby",
        kind: "calls_ws",
        verified: true,
        dataFlowLabel: "joinRoom(playerId)",
      },
      {
        id: "bridge-lobby-ws",
        from: "server-lobby",
        to: "ws-gateway",
        kind: "imports",
        verified: true,
        dataFlowLabel: "emitRoomUpdate(room)",
      },
      {
        id: "bridge-lobby-state",
        from: "server-lobby",
        to: "shared-state",
        kind: "reads_state",
        verified: true,
        dataFlowLabel: "appendPlayer(state, p)",
      },
      {
        id: "bridge-state-db",
        from: "shared-state",
        to: "db-mock",
        kind: "unknown",
        verified: false,
        dataFlowLabel: "heuristic snapshot link",
      },
      {
        id: "bridge-lobby-tests",
        from: "server-lobby",
        to: "test-suite",
        kind: "verifies",
        verified: true,
        dataFlowLabel: "assert(room.players.length <= 4)",
      },
    ],
    diffs: [
      {
        diffId: "diff-lobby-01",
        moduleId: "server-lobby",
        fileAlias: "server/lobby.ts",
        beforeLine: "- if (room.players.length >= room.maxPlayers) return {ok: false, reason: 'ROOM_FULL'}",
        afterLine: "+ // agent removed capacity guard during refactor",
        addedLines: 1,
        removedLines: 1,
        explanation: "Agent edit removed the maxPlayers=4 guard in joinRoom(), allowing a 5th player into a 4-player room.",
      },
    ],
    failures: [
      {
        evidenceId: "test-room-03",
        testName: "test-room-03: rejects 5th player when maxPlayers=4",
        moduleId: "test-suite",
        causeModuleId: "server-lobby",
        fileAlias: "tests/room-capacity.test.mjs",
        redactedOutput: "AssertionError [ERR_ASSERTION]: room.players.length expected 4, got 5 in joinRoom()",
        expectedValue: "players.length === 4 (ok: false)",
        actualValue: "players.length === 5 (ok: true)",
        uncertaintyFlag: false,
        repairSummary: "Restore maxPlayers capacity guard in server/lobby.ts and re-run test-room-03.",
      },
    ],
    recordedEvents: [
      {
        v: 1,
        eventId: "evt-lobby-001",
        sessionId: "session-lobbysync-01",
        projectId: "lobby-sync",
        seq: 1,
        timestamp: "2026-11-08T05:00:01.000Z",
        actor: "agent-01",
        source: "recorded-trace",
        kind: "tool_started",
        status: "running",
        fileAliases: ["server/lobby.ts"],
        evidenceIds: ["diff-lobby-01"],
        provenance: "LOCAL_RECORDED_REPLAY",
        summary: "PreToolUse: Edit server/lobby.ts joinRoom()",
      },
      {
        v: 1,
        eventId: "evt-lobby-002",
        sessionId: "session-lobbysync-01",
        projectId: "lobby-sync",
        seq: 2,
        timestamp: "2026-11-08T05:00:02.000Z",
        actor: "agent-01",
        source: "recorded-trace",
        kind: "tool_finished",
        status: "succeeded",
        fileAliases: ["server/lobby.ts", "shared/state.ts"],
        evidenceIds: ["diff-lobby-01"],
        provenance: "LOCAL_RECORDED_REPLAY",
        summary: "PostToolUse: Modified server/lobby.ts (-1/+1 lines)",
      },
      {
        v: 1,
        eventId: "evt-lobby-003",
        sessionId: "session-lobbysync-01",
        projectId: "lobby-sync",
        seq: 3,
        timestamp: "2026-11-08T05:00:03.000Z",
        actor: "subagent-01",
        source: "recorded-trace",
        kind: "subagent_started",
        status: "running",
        fileAliases: ["tests/room-capacity.test.mjs"],
        evidenceIds: ["test-room-03"],
        provenance: "LOCAL_RECORDED_REPLAY",
        summary: "SubagentStart: QA runner executing room-capacity.test.mjs",
      },
      {
        v: 1,
        eventId: "evt-lobby-004",
        sessionId: "session-lobbysync-01",
        projectId: "lobby-sync",
        seq: 4,
        timestamp: "2026-11-08T05:00:04.000Z",
        actor: "subagent-01",
        source: "recorded-trace",
        kind: "test_completed",
        status: "failed",
        fileAliases: ["server/lobby.ts", "tests/room-capacity.test.mjs"],
        evidenceIds: ["test-room-03", "diff-lobby-01"],
        provenance: "LOCAL_RECORDED_REPLAY",
        summary: "PostToolUseFailure: test-room-03 failed (expected 4 players, got 5)",
      },
      {
        v: 1,
        eventId: "evt-lobby-005",
        sessionId: "session-lobbysync-01",
        projectId: "lobby-sync",
        seq: 5,
        timestamp: "2026-11-08T05:00:05.000Z",
        actor: "agent-01",
        source: "recorded-trace",
        kind: "approval_requested",
        status: "pending",
        fileAliases: ["server/lobby.ts", "tests/room-capacity.test.mjs"],
        evidenceIds: ["test-room-03"],
        provenance: "LOCAL_RECORDED_REPLAY",
        summary: "Approval Dock: Restore maxPlayers guard & run_known_test",
      },
      {
        v: 1,
        eventId: "evt-lobby-006",
        sessionId: "session-lobbysync-01",
        projectId: "lobby-sync",
        seq: 6,
        timestamp: "2026-11-08T05:00:06.000Z",
        actor: "subagent-01",
        source: "recorded-trace",
        kind: "test_completed",
        status: "succeeded",
        fileAliases: ["server/lobby.ts", "tests/room-capacity.test.mjs"],
        evidenceIds: ["test-room-03"],
        provenance: "LOCAL_RECORDED_REPLAY",
        summary: "Verified Pass: test-room-03 passed (4/4 cap enforced)",
      },
    ],
  },
  {
    projectId: "edge-guard",
    title: "EdgeGuard",
    subtitle: "Token-Bucket API Rate Limiter",
    sourcePathAlias: "demo-repo/edge-guard",
    lastEventTimestamp: "2026-11-08T04:45:00.000Z",
    provenance: "LOCAL_RECORDED_REPLAY",
    pinned: false,
    favoriteOrder: 2,
    modules: [
      {
        id: "client-ui",
        label: "UI:Dashboard",
        role: "UI",
        clusterId: "cluster-frontend",
        files: ["client/quota-panel.ts"],
        summary: "Displays remaining burst tokens",
        status: "healthy",
      },
      {
        id: "server-lobby",
        label: "Logic:Limiter",
        role: "Logic",
        clusterId: "cluster-core",
        files: ["api/limiter.ts"],
        summary: "Token-bucket refill & burst check",
        status: "healthy",
        lastDiffId: "diff-limit-01",
      },
      {
        id: "ws-gateway",
        label: "API:Gateway",
        role: "API",
        clusterId: "cluster-core",
        files: ["api/gateway.ts"],
        summary: "HTTP/WS ingress middleware",
        status: "healthy",
      },
      {
        id: "shared-state",
        label: "Data:Buckets",
        role: "Data",
        clusterId: "cluster-state",
        files: ["state/buckets.ts"],
        summary: "Per-route token counters",
        status: "healthy",
      },
      {
        id: "db-mock",
        label: "Assets:Rules",
        role: "Assets",
        clusterId: "cluster-state",
        files: ["config/limits.json"],
        summary: "Route rate-limit policy table",
        status: "healthy",
      },
      {
        id: "test-suite",
        label: "Tests:Limit01",
        role: "Tests",
        clusterId: "cluster-qa",
        files: ["tests/rate-limit.test.mjs"],
        summary: "Verifies HTTP 429 on burst > 10",
        status: "healthy",
      },
    ],
    edges: [
      {id: "bridge-client-lobby", from: "client-ui", to: "server-lobby", kind: "calls_ws", verified: true},
      {id: "bridge-lobby-ws", from: "server-lobby", to: "ws-gateway", kind: "imports", verified: true},
      {id: "bridge-lobby-state", from: "server-lobby", to: "shared-state", kind: "reads_state", verified: true},
      {id: "bridge-state-db", from: "shared-state", to: "db-mock", kind: "unknown", verified: false},
      {id: "bridge-lobby-tests", from: "server-lobby", to: "test-suite", kind: "verifies", verified: true},
    ],
    diffs: [
      {
        diffId: "diff-limit-01",
        moduleId: "server-lobby",
        fileAlias: "api/limiter.ts",
        beforeLine: "- if (bucket.tokens < cost) return {allowed: false, status: 429}",
        afterLine: "+ if (bucket.tokens <= -cost) return {allowed: false, status: 429}",
        addedLines: 1,
        removedLines: 1,
        explanation: "Off-by-cost comparison allowed negative token balances during burst traffic.",
      },
    ],
    failures: [
      {
        evidenceId: "test-limit-01",
        testName: "test-limit-01: returns 429 when bucket is exhausted",
        moduleId: "test-suite",
        causeModuleId: "server-lobby",
        fileAlias: "tests/rate-limit.test.mjs",
        redactedOutput: "AssertionError: expected status 429 on request #11, got 200",
        expectedValue: "status === 429",
        actualValue: "status === 200",
        uncertaintyFlag: false,
        repairSummary: "Restore bucket.tokens < cost guard in api/limiter.ts.",
      },
    ],
    recordedEvents: [
      {
        v: 1,
        eventId: "evt-edge-001",
        sessionId: "session-edgeguard-01",
        projectId: "edge-guard",
        seq: 1,
        timestamp: "2026-11-08T04:45:01.000Z",
        actor: "agent-01",
        source: "recorded-trace",
        kind: "tool_finished",
        status: "succeeded",
        fileAliases: ["api/limiter.ts"],
        evidenceIds: ["diff-limit-01"],
        provenance: "LOCAL_RECORDED_REPLAY",
        summary: "Edited api/limiter.ts token threshold",
      },
      {
        v: 1,
        eventId: "evt-edge-002",
        sessionId: "session-edgeguard-01",
        projectId: "edge-guard",
        seq: 2,
        timestamp: "2026-11-08T04:45:02.000Z",
        actor: "subagent-01",
        source: "recorded-trace",
        kind: "test_completed",
        status: "failed",
        fileAliases: ["api/limiter.ts", "tests/rate-limit.test.mjs"],
        evidenceIds: ["test-limit-01"],
        provenance: "LOCAL_RECORDED_REPLAY",
        summary: "test-limit-01 failed: burst allowed past zero tokens",
      },
      {
        v: 1,
        eventId: "evt-edge-003",
        sessionId: "session-edgeguard-01",
        projectId: "edge-guard",
        seq: 3,
        timestamp: "2026-11-08T04:45:03.000Z",
        actor: "subagent-01",
        source: "recorded-trace",
        kind: "test_completed",
        status: "succeeded",
        fileAliases: ["api/limiter.ts", "tests/rate-limit.test.mjs"],
        evidenceIds: ["test-limit-01"],
        provenance: "LOCAL_RECORDED_REPLAY",
        summary: "test-limit-01 passed after guard fix",
      },
    ],
  },
  {
    projectId: "earthproof-rover",
    title: "EarthProof Rover",
    subtitle: "Ramp Torque & Gear-Ratio Trial",
    sourcePathAlias: "Assets/Scripts/EarthProofSim.ts",
    lastEventTimestamp: "2026-11-08T02:20:00.000Z",
    provenance: "PREVIEW_SIMULATION",
    pinned: false,
    favoriteOrder: 3,
    modules: [
      {
        id: "client-ui",
        label: "UI:Controls",
        role: "UI",
        clusterId: "cluster-frontend",
        files: ["Assets/Scripts/EarthProofControlsUI.ts"],
        summary: "Run & Reset pinch buttons",
        status: "healthy",
      },
      {
        id: "server-lobby",
        label: "Logic:Flow",
        role: "Logic",
        clusterId: "cluster-core",
        files: ["Assets/Scripts/EarthProofFlow.ts"],
        summary: "IDLE -> RUNNING -> STALLED / PASSED machine",
        status: "healthy",
      },
      {
        id: "ws-gateway",
        label: "API:Main",
        role: "API",
        clusterId: "cluster-core",
        files: ["Assets/Scripts/EarthProofMain.ts"],
        summary: "Scene adapter & latency logger",
        status: "healthy",
      },
      {
        id: "shared-state",
        label: "Data:Sim",
        role: "Data",
        clusterId: "cluster-state",
        files: ["Assets/Scripts/EarthProofSim.ts"],
        summary: "Inclined-plane torque model (needs 7.9 N.cm)",
        status: "healthy",
      },
      {
        id: "db-mock",
        label: "Assets:Layout",
        role: "Assets",
        clusterId: "cluster-state",
        files: ["Assets/Scripts/EarthProofLayout.ts"],
        summary: "Table, 10/25 deg ramp & rover poses",
        status: "healthy",
      },
      {
        id: "test-suite",
        label: "Tests:LEAF_c1_c7",
        role: "Tests",
        clusterId: "cluster-qa",
        files: ["Assets/Scripts/Leaf/LeafIndex.ts"],
        summary: "9 LEAF scenarios + 5582 Node checks",
        status: "healthy",
      },
    ],
    edges: [
      {id: "bridge-client-lobby", from: "client-ui", to: "server-lobby", kind: "imports", verified: true},
      {id: "bridge-lobby-ws", from: "server-lobby", to: "ws-gateway", kind: "imports", verified: true},
      {id: "bridge-lobby-state", from: "server-lobby", to: "shared-state", kind: "reads_state", verified: true},
      {id: "bridge-state-db", from: "shared-state", to: "db-mock", kind: "imports", verified: true},
      {id: "bridge-lobby-tests", from: "server-lobby", to: "test-suite", kind: "verifies", verified: true},
    ],
    diffs: [
      {
        diffId: "diff-rover-01",
        moduleId: "shared-state",
        fileAlias: "Assets/Scripts/EarthProofSim.ts",
        beforeLine: "- motor: small (4.0 N.cm total < 7.9 N.cm needed on 25 deg steep section)",
        afterLine: "+ motor: geared 5:1 (17.0 N.cm total -> 2.1x safety margin)",
        addedLines: 1,
        removedLines: 1,
        explanation: "Swapping Small (4.0 N.cm) to Geared (17.0 N.cm) overcomes the 7.9 N.cm steep-section demand.",
      },
    ],
    failures: [
      {
        evidenceId: "stall-steep-25",
        testName: "Ramp 25 deg climb with Small motor",
        moduleId: "test-suite",
        causeModuleId: "shared-state",
        fileAlias: "Assets/Scripts/EarthProofSim.ts",
        redactedOutput: "STALLED at s=20 cm: needs 7.9 N.cm, Small motor has 4.0 N.cm (short by 3.9 N.cm)",
        expectedValue: ">= 7.9 N.cm",
        actualValue: "4.0 N.cm",
        uncertaintyFlag: false,
        repairSummary: "Swap to Geared motor (17.0 N.cm, 2.1x margin) and press Run.",
      },
    ],
    recordedEvents: [
      {
        v: 1,
        eventId: "evt-rover-001",
        sessionId: "session-rover-01",
        projectId: "earthproof-rover",
        seq: 1,
        timestamp: "2026-11-08T02:20:01.000Z",
        actor: "agent-01",
        source: "recorded-trace",
        kind: "test_completed",
        status: "failed",
        fileAliases: ["Assets/Scripts/EarthProofSim.ts"],
        evidenceIds: ["stall-steep-25"],
        provenance: "PREVIEW_SIMULATION",
        summary: "Small motor stalled on 25 deg ramp (needs 7.9 N.cm, has 4.0 N.cm)",
      },
      {
        v: 1,
        eventId: "evt-rover-002",
        sessionId: "session-rover-01",
        projectId: "earthproof-rover",
        seq: 2,
        timestamp: "2026-11-08T02:20:02.000Z",
        actor: "agent-01",
        source: "recorded-trace",
        kind: "test_completed",
        status: "succeeded",
        fileAliases: ["Assets/Scripts/EarthProofSim.ts"],
        evidenceIds: ["stall-steep-25"],
        provenance: "PREVIEW_SIMULATION",
        summary: "Geared motor climbed ramp with 2.1x margin (17.0 N.cm vs 7.9 N.cm)",
      },
    ],
  },
]

export const LEARNING_CASES: readonly LearningCase[] = [
  {
    caseId: "case-lobby-cap",
    projectId: "lobby-sync",
    title: "Case 1: Room Capacity Overflow",
    prompt: "Agent edited server/lobby.ts and removed the maxPlayers check. Pinch the module whose verification test fails first.",
    changedModuleId: "server-lobby",
    expectedFailedModuleId: "test-suite",
    evidenceId: "test-room-03",
    whyItMatters: "Guard removal in a state mutator propagates silently through shared state until invariant tests catch the overflow.",
    recallQuestion: "Which module's invariant broke when server/lobby.ts dropped the maxPlayers>=4 guard?",
    recallAnswer: "test-suite (tests/room-capacity.test.mjs: test-room-03 expected 4 players, got 5).",
    difficulty: "beginner",
  },
  {
    caseId: "case-state-stale",
    projectId: "lobby-sync",
    title: "Case 2: Downstream State Propagation",
    prompt: "When server/lobby.ts mutates player membership, which Data module receives the unguarded player append directly?",
    changedModuleId: "server-lobby",
    expectedFailedModuleId: "shared-state",
    evidenceId: "diff-lobby-01",
    whyItMatters: "Tracing direct data dependencies separates verified state mutators from unverified storage heuristics.",
    recallQuestion: "Why is the edge from shared-state to db-mock dashed/flagged in LobbySync?",
    recallAnswer: "Because parser evidence only verified server/lobby.ts -> shared-state; db-mock is an unverified heuristic link.",
    difficulty: "intermediate",
  },
  {
    caseId: "case-rate-burst",
    projectId: "edge-guard",
    title: "Case 3: Token Bucket Off-By-Cost Bug",
    prompt: "In EdgeGuard, api/limiter.ts changed `< cost` to `<= -cost`. Pinch the test module that catches the HTTP 429 regression.",
    changedModuleId: "server-lobby",
    expectedFailedModuleId: "test-suite",
    evidenceId: "test-limit-01",
    whyItMatters: "Boundary sign errors in rate limiters allow burst amplification unless negative-balance tests run before deploy.",
    recallQuestion: "What happened on request #11 when `< cost` was replaced by `<= -cost`?",
    recallAnswer: "The limiter returned HTTP 200 instead of HTTP 429 because negative token balance was permitted.",
    difficulty: "advanced",
  },
]

// ---- Persistence Schema Migration (F05, F07, F48, F69, F72) --------------------------------------

export function defaultPersistedState(): PersistedStateV1 {
  return {
    schemaVersion: 1,
    lastProjectId: "lobby-sync",
    pinnedProjects: ["lobby-sync"],
    masteryByModule: {},
    solvedCases: [],
    failedCases: 0,
    theme: "Prism",
    reducedMotion: false,
    soundEnabled: true,
    highContrast: false,
    textScale: 1.0,
    evidenceDensity: "beginner",
  }
}

export function migratePersistedState(raw: unknown): PersistedStateV1 {
  const base = defaultPersistedState()
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return base
  }
  const r = raw as Record<string, unknown>
  // Support legacy v0 schema (where `project` was used instead of `lastProjectId` and `dark` instead of `theme`)
  const lastProjectId =
    typeof r.lastProjectId === "string" && DEMO_PROJECTS.some((p) => p.projectId === r.lastProjectId)
      ? r.lastProjectId
      : typeof r.project === "string" && DEMO_PROJECTS.some((p) => p.projectId === r.project)
        ? r.project
        : base.lastProjectId

  const pinnedProjects = Array.isArray(r.pinnedProjects)
    ? r.pinnedProjects.filter((x): x is string => typeof x === "string")
    : base.pinnedProjects

  const masteryByModule: Record<string, number> = {}
  if (r.masteryByModule && typeof r.masteryByModule === "object" && !Array.isArray(r.masteryByModule)) {
    for (const [k, v] of Object.entries(r.masteryByModule as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
        masteryByModule[k] = Math.min(1000, Math.floor(v))
      }
    }
  }

  const solvedCases = Array.isArray(r.solvedCases)
    ? r.solvedCases.filter((x): x is string => typeof x === "string")
    : []

  const failedCases =
    typeof r.failedCases === "number" && Number.isFinite(r.failedCases) && r.failedCases >= 0
      ? Math.floor(r.failedCases)
      : 0

  const theme: VisualThemeId =
    r.theme === "Prism" || r.theme === "Midnight" || r.theme === "MinimalFocus"
      ? r.theme
      : r.dark === true
        ? "Midnight"
        : "Prism"

  return {
    schemaVersion: 1,
    lastProjectId,
    pinnedProjects,
    masteryByModule,
    solvedCases,
    failedCases,
    theme,
    reducedMotion: Boolean(r.reducedMotion),
    soundEnabled: r.soundEnabled === undefined ? true : Boolean(r.soundEnabled),
    highContrast: Boolean(r.highContrast),
    textScale: typeof r.textScale === "number" ? Math.max(0.85, Math.min(1.35, r.textScale)) : 1.0,
    evidenceDensity: r.evidenceDensity === "expert" ? "expert" : "beginner",
  }
}

// ---- Main Deterministic Engine (F01-F72) --------------------------------------------------------

export class BuildAliveEngine {
  private projects: ProjectDescriptor[]
  private currentProjectId: string = "lobby-sync"
  private sceneMode: SceneMode = "PROJECT_OVERVIEW"
  private connectionState: ConnectionState = "REPLAY"
  private provenance: ProvenanceMode = "LOCAL_RECORDED_REPLAY"
  private voiceState: VoiceState = "IDLE"
  private theme: VisualThemeId = "Prism"
  private reducedMotion: boolean = false
  private soundEnabled: boolean = true
  private soundIntensity: number = 0.8
  private highContrast: boolean = false
  private textScale: number = 1.0
  private evidenceDensity: EvidenceDensity = "beginner"
  private lastSoundCue: SoundCueId = "none"

  // Spatial navigation & comfort transforms (F09, F10, F18, F61)
  private zoomedClusterId: string | null = null
  private clustersGrouped: boolean = false
  private sceneTransform = {offsetX: 0, offsetY: 0, offsetZ: 0, scale: 1.0, yawDeg: 0}
  private searchQuery: string = ""

  // Selection, layers & hypothetical preview (F13-F20, F42)
  private selectedModuleId: string | null = null
  private layers: GraphLayerVisibility = {source: true, test: true, agent: true, dependency: true}
  private hypotheticalBranchActive: boolean = false

  // Event journal & replay state (F21-F30, F68, F70)
  private eventBuffer: AgentEvent[] = []
  private seenEventIds: Set<string> = new Set()
  private cursorSeq: number = 0
  private playing: boolean = false
  private droppedEvents: number = 0
  private sessionTraces: Map<string, AgentEvent[]> = new Map()

  // Approval dock & audit receipts (F38-F41, T03-T04)
  private pendingApprovals: Map<string, ApprovalRequest> = new Map()
  private auditReceipts: AuditReceipt[] = []
  private nonceCounter: number = 1

  // Learning Atelier state (F43-F52)
  private activeCaseIndex: number = 0
  private lastPrediction: {
    caseId: string
    guessedModuleId: string
    correct: boolean
    feedback: string
  } | null = null
  private masteryByModule: Record<string, number> = {}
  private solvedCases: Set<string> = new Set()
  private failedCasesCount: number = 0

  constructor(initialState?: unknown) {
    this.projects = DEMO_PROJECTS.map((p) => ({
      ...p,
      pinned: p.pinned,
      favoriteOrder: p.favoriteOrder,
    }))
    if (initialState) {
      this.applyPersistedState(migratePersistedState(initialState))
    }
    this.loadProjectTrace(this.currentProjectId)
  }

  // ---- A. Project Universe & Spatial Navigation (F01-F10) ---------------------------------------

  get currentProject(): ProjectDescriptor {
    return this.projects.find((p) => p.projectId === this.currentProjectId) || this.projects[0]
  }

  get mode(): SceneMode {
    return this.sceneMode
  }

  openProjectHub(): void {
    this.sceneMode = "PROJECT_HUB"
    this.lastSoundCue = this.soundEnabled ? "chime_select" : "none"
  }

  selectProject(projectId: string): boolean {
    const found = this.projects.find((p) => p.projectId === projectId)
    if (!found) return false
    // Preserve current project trace before switching (F04, F30)
    this.sessionTraces.set(this.currentProjectId, [...this.eventBuffer])
    this.currentProjectId = found.projectId
    this.provenance = found.provenance
    this.sceneMode = "PROJECT_OVERVIEW"
    this.selectedModuleId = null
    this.hypotheticalBranchActive = false
    this.loadProjectTrace(found.projectId)
    this.lastSoundCue = this.soundEnabled ? "chime_select" : "none"
    return true
  }

  returnToHubPreservingState(): SceneMode {
    this.sessionTraces.set(this.currentProjectId, [...this.eventBuffer])
    this.sceneMode = "PROJECT_HUB"
    return this.sceneMode
  }

  filterProjects(query: string): ProjectDescriptor[] {
    this.searchQuery = sanitizeDisplayText(query, 32).toLowerCase()
    return this.getSortedProjects().filter(
      (p) =>
        this.searchQuery === "" ||
        p.title.toLowerCase().includes(this.searchQuery) ||
        p.subtitle.toLowerCase().includes(this.searchQuery) ||
        p.projectId.toLowerCase().includes(this.searchQuery),
    )
  }

  togglePinProject(projectId: string): boolean {
    const p = this.projects.find((x) => x.projectId === projectId)
    if (!p) return false
    p.pinned = !p.pinned
    return p.pinned
  }

  getSortedProjects(): ProjectDescriptor[] {
    return [...this.projects].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return a.favoriteOrder - b.favoriteOrder
    })
  }

  getProjectMetadata(projectId: string = this.currentProjectId): {
    projectId: string
    title: string
    sourcePathAlias: string
    lastEventTimestamp: string
    provenance: ProvenanceMode
    eventCount: number
  } {
    const p = this.projects.find((x) => x.projectId === projectId) || this.currentProject
    return {
      projectId: p.projectId,
      title: p.title,
      sourcePathAlias: p.sourcePathAlias,
      lastEventTimestamp: p.lastEventTimestamp,
      provenance: p.provenance,
      eventCount: p.recordedEvents.length,
    }
  }

  zoomCluster(clusterId: string | null): string | null {
    this.zoomedClusterId = clusterId
    return this.zoomedClusterId
  }

  recenterScene(offsetX = 0, offsetY = 0, offsetZ = 0, scale = 1.0, yawDeg = 0): {
    offsetX: number
    offsetY: number
    offsetZ: number
    scale: number
    yawDeg: number
  } {
    // Comfort constraints (F10, F61): clamp offsets within +-20 cm, scale [0.75, 1.35], yaw [-30, +30]
    this.sceneTransform = {
      offsetX: Math.max(-20, Math.min(20, offsetX)),
      offsetY: Math.max(-15, Math.min(15, offsetY)),
      offsetZ: Math.max(-20, Math.min(20, offsetZ)),
      scale: Math.max(0.75, Math.min(1.35, scale)),
      yawDeg: Math.max(-30, Math.min(30, yawDeg)),
    }
    return {...this.sceneTransform}
  }

  // ---- B. Living Architecture & Code Comprehension (F11-F20) ------------------------------------

  selectModule(moduleId: string | null): {
    selectedModuleId: string | null
    highlightedDownstream: string[]
    deemphasizedModules: string[]
  } {
    if (moduleId !== null && !this.currentProject.modules.some((m) => m.id === moduleId)) {
      return {selectedModuleId: this.selectedModuleId, highlightedDownstream: [], deemphasizedModules: []}
    }
    this.selectedModuleId = moduleId
    if (moduleId !== null) {
      this.sceneMode = "INSPECT"
      this.lastSoundCue = this.soundEnabled ? "chime_select" : "none"
    }
    const downstream = moduleId ? this.getDownstreamImpact(moduleId).verifiedModules : []
    const activeSet = new Set([moduleId, ...downstream])
    const deemphasized =
      moduleId === null
        ? []
        : this.currentProject.modules.filter((m) => !activeSet.has(m.id)).map((m) => m.id)

    return {
      selectedModuleId: this.selectedModuleId,
      highlightedDownstream: downstream,
      deemphasizedModules: deemphasized,
    }
  }

  getDownstreamImpact(moduleId: string): {
    verifiedModules: string[]
    unverifiedModules: string[]
    edgesTraversed: string[]
  } {
    const verifiedModules: string[] = []
    const unverifiedModules: string[] = []
    const edgesTraversed: string[] = []
    const queue: string[] = [moduleId]
    const visited = new Set<string>([moduleId])

    while (queue.length > 0) {
      const curr = queue.shift()!
      for (const edge of this.currentProject.edges) {
        if (edge.from === curr) {
          edgesTraversed.push(edge.id)
          if (edge.verified) {
            if (!visited.has(edge.to)) {
              visited.add(edge.to)
              verifiedModules.push(edge.to)
              queue.push(edge.to)
            }
          } else {
            if (!unverifiedModules.includes(edge.to)) {
              unverifiedModules.push(edge.to)
            }
          }
        }
      }
    }
    return {verifiedModules, unverifiedModules, edgesTraversed}
  }

  getModuleEvidence(moduleId: string): {
    moduleId: string
    files: readonly string[]
    summary: string
    diff: FileDiffEvidence | null
    failures: TestFailureEvidence[]
  } | null {
    const m = this.currentProject.modules.find((x) => x.id === moduleId)
    if (!m) return null
    const diff = this.currentProject.diffs.find((d) => d.moduleId === moduleId) || null
    const failures = this.currentProject.failures.filter(
      (f) => f.moduleId === moduleId || f.causeModuleId === moduleId,
    )
    return {moduleId: m.id, files: m.files, summary: m.summary, diff, failures}
  }

  toggleLayer(layer: keyof GraphLayerVisibility, visible?: boolean): GraphLayerVisibility {
    this.layers[layer] = visible === undefined ? !this.layers[layer] : visible
    return {...this.layers}
  }

  toggleClusterGroup(grouped?: boolean): boolean {
    this.clustersGrouped = grouped === undefined ? !this.clustersGrouped : grouped
    return this.clustersGrouped
  }

  getVerifiedDataFlows(): {edgeId: string; from: string; to: string; flow: string; verified: boolean}[] {
    return this.currentProject.edges
      .filter((e) => Boolean(e.dataFlowLabel))
      .map((e) => ({
        edgeId: e.id,
        from: e.from,
        to: e.to,
        flow: e.dataFlowLabel!,
        verified: e.verified,
      }))
  }

  compareSnapshots(seqA: number, seqB: number): {
    seqA: number
    seqB: number
    changedFiles: string[]
    statusDelta: string
    addedPaths: string[]
    removedPaths: string[]
  } {
    const eventsUpToA = this.eventBuffer.filter((e) => e.seq <= seqA)
    const eventsUpToB = this.eventBuffer.filter((e) => e.seq <= seqB)
    const filesA = new Set<string>()
    const filesB = new Set<string>()
    eventsUpToA.forEach((e) => e.fileAliases.forEach((f) => filesA.add(f)))
    eventsUpToB.forEach((e) => e.fileAliases.forEach((f) => filesB.add(f)))

    const addedPaths = [...filesB].filter((f) => !filesA.has(f))
    const removedPaths = [...filesA].filter((f) => !filesB.has(f))
    const changedFiles = [...new Set([...filesA, ...filesB])]
    const lastA = eventsUpToA[eventsUpToA.length - 1]?.status || "idle"
    const lastB = eventsUpToB[eventsUpToB.length - 1]?.status || "idle"

    return {
      seqA,
      seqB,
      changedFiles,
      statusDelta: `${lastA} -> ${lastB}`,
      addedPaths,
      removedPaths,
    }
  }

  // ---- C. Agents, Harness & Event Traces (F21-F32) ----------------------------------------------

  ingestEvent(raw: unknown): {accepted: boolean; reason?: string; seq?: number} {
    const res = validateEventEnvelope(raw)
    if (!res.valid || !res.event) {
      this.droppedEvents++
      return {accepted: false, reason: res.error || "validation_failed"}
    }
    const ev = res.event
    if (this.seenEventIds.has(ev.eventId)) {
      return {accepted: false, reason: "duplicate_eventId", seq: ev.seq}
    }
    this.seenEventIds.add(ev.eventId)
    this.eventBuffer.push(ev)
    // Sort monotonically by seq, tie-breaking by eventId for strict determinism (F68)
    this.eventBuffer.sort((a, b) => (a.seq !== b.seq ? a.seq - b.seq : a.eventId.localeCompare(b.eventId)))
    if (this.eventBuffer.length > MAX_EVENTS) {
      const removed = this.eventBuffer.shift()
      if (removed) this.seenEventIds.delete(removed.eventId)
    }
    if (ev.provenance === "LIVE_VERIFIED") {
      this.connectionState = "LIVE"
      this.provenance = "LIVE_VERIFIED"
    }
    return {accepted: true, seq: ev.seq}
  }

  stepForward(): AgentEvent | null {
    const maxSeq = this.eventBuffer[this.eventBuffer.length - 1]?.seq || 0
    if (this.cursorSeq < maxSeq) {
      const nextEv = this.eventBuffer.find((e) => e.seq > this.cursorSeq)
      this.cursorSeq = nextEv ? nextEv.seq : maxSeq
      this.applyEventEffectsAtCursor()
      return this.activeEvent
    }
    return this.activeEvent
  }

  stepBackward(): AgentEvent | null {
    const prevEvents = this.eventBuffer.filter((e) => e.seq < this.cursorSeq)
    this.cursorSeq = prevEvents[prevEvents.length - 1]?.seq || 0
    this.applyEventEffectsAtCursor()
    return this.activeEvent
  }

  scrubToSeq(seq: number): AgentEvent | null {
    const maxSeq = this.eventBuffer[this.eventBuffer.length - 1]?.seq || 0
    this.cursorSeq = Math.max(0, Math.min(maxSeq, Math.floor(seq)))
    this.applyEventEffectsAtCursor()
    return this.activeEvent
  }

  play(): void {
    this.playing = true
    this.sceneMode = "LIVE_OR_REPLAY"
  }

  pause(): void {
    this.playing = false
  }

  rewind(): void {
    this.cursorSeq = this.eventBuffer.length > 0 ? this.eventBuffer[0].seq : 0
    this.playing = false
    this.applyEventEffectsAtCursor()
  }

  reset(): void {
    this.cursorSeq = 0
    this.playing = false
    this.selectedModuleId = null
    this.hypotheticalBranchActive = false
    this.sceneMode = "PROJECT_OVERVIEW"
    this.lastPrediction = null
    this.pendingApprovals.clear()
    this.lastSoundCue = "none"
  }

  get activeEvent(): AgentEvent | null {
    const candidates = this.eventBuffer.filter((e) => e.seq <= this.cursorSeq)
    return candidates[candidates.length - 1] || null
  }

  mapToolToGlyph(ev: AgentEvent | null = this.activeEvent): {
    glyph: string
    actor: string
    lane: "primary" | "subagent"
    statusBadge: string
  } {
    if (!ev) {
      return {glyph: "[IDLE]", actor: "none", lane: "primary", statusBadge: "[IDLE]"}
    }
    const lane = ev.actor.startsWith("subagent") ? "subagent" : "primary"
    const badge =
      ev.status === "failed"
        ? "[FAIL]"
        : ev.status === "succeeded"
          ? "[PASS]"
          : ev.status === "running"
            ? "[AGT]"
            : "[CHG]"
    const glyph =
      ev.kind === "test_completed"
        ? "GLYPH_TEST_VERIFIER"
        : ev.kind === "subagent_started" || ev.kind === "subagent_stopped"
          ? "GLYPH_SUBAGENT_VESSEL"
          : ev.kind === "approval_requested" || ev.kind === "approval_resolved"
            ? "GLYPH_APPROVAL_TOKEN"
            : "GLYPH_CODE_EDITOR"
    return {glyph, actor: ev.actor, lane, statusBadge: badge}
  }

  getTaskQueue(): {eventId: string; seq: number; actor: string; kind: EventKind; status: EventStatus}[] {
    return this.eventBuffer.map((e) => ({
      eventId: e.eventId,
      seq: e.seq,
      actor: e.actor,
      kind: e.kind,
      status: e.seq <= this.cursorSeq ? e.status : "pending",
    }))
  }

  getProviderAdapters(): {
    providerId: string
    label: string
    status: ProvenanceMode
    protocol: string
  }[] {
    return [
      {
        providerId: "claude-hooks",
        label: "Claude Code Lifecycle Hooks",
        status: this.connectionState === "LIVE" ? "LIVE_VERIFIED" : "LOCAL_RECORDED_REPLAY",
        protocol: "PreToolUse / PostToolUse / PostToolUseFailure / SubagentStart",
      },
      {
        providerId: "codex-sdk",
        label: "Codex Session Event Adapter",
        status: "TESTED",
        protocol: "session.event -> canonical v1 normalizer",
      },
      {
        providerId: "external-unconnected",
        label: "External Consumer Web Sessions",
        status: "NOT_CONNECTED",
        protocol: "No cookie scraping or unauthorized session access",
      },
    ]
  }

  // ---- D. Interactive Debugging & Human Intervention (F33-F42) ----------------------------------

  getActiveFailures(): TestFailureEvidence[] {
    const visibleEvents = this.eventBuffer.filter((e) => e.seq <= this.cursorSeq)
    const hasFailed = visibleEvents.some((e) => e.kind === "test_completed" && e.status === "failed")
    const completedTests = visibleEvents.filter((e) => e.kind === "test_completed")
    const hasPassedAfter = completedTests[completedTests.length - 1]?.status === "succeeded"
    if (!hasFailed || hasPassedAfter) return []
    return [...this.currentProject.failures]
  }

  isTestRepaired(): boolean {
    const testEvents = this.eventBuffer.filter(
      (e) => e.seq <= this.cursorSeq && e.kind === "test_completed",
    )
    return testEvents.length >= 2 && testEvents[testEvents.length - 1]?.status === "succeeded"
  }

  traceChangeToTest(evidenceId: string): {
    found: boolean
    causeModuleId: string
    testModuleId: string
    bridgeIds: string[]
    uncertaintyFlag: boolean
    explanation: string
  } {
    const f = this.currentProject.failures.find((x) => x.evidenceId === evidenceId) || this.currentProject.failures[0]
    if (!f) {
      return {
        found: false,
        causeModuleId: "",
        testModuleId: "",
        bridgeIds: [],
        uncertaintyFlag: true,
        explanation: "No recorded failure evidence for this ID.",
      }
    }
    const impact = this.getDownstreamImpact(f.causeModuleId)
    return {
      found: true,
      causeModuleId: f.causeModuleId,
      testModuleId: f.moduleId,
      bridgeIds: impact.edgesTraversed,
      uncertaintyFlag: f.uncertaintyFlag || impact.unverifiedModules.length > 0,
      explanation: `${f.fileAlias}: ${f.redactedOutput} -> caused by ${f.causeModuleId}`,
    }
  }

  explainCurrentState(): string {
    const ev = this.activeEvent
    const diff = this.currentProject.diffs[0]
    const fail = this.currentProject.failures[0]
    if (!ev) {
      return `[IDLE] Project ${this.currentProject.title} loaded (${this.provenance}). Step timeline or pinch a module.`
    }
    if (ev.status === "failed" && fail) {
      if (this.evidenceDensity === "beginner") {
        return `[FAIL] ${fail.testName}: ${diff ? diff.explanation : fail.redactedOutput}`
      }
      return `[FAIL] seq#${ev.seq} (${ev.actor}): ${fail.redactedOutput} | Diff ${diff?.fileAlias}: ${diff?.beforeLine} -> ${diff?.afterLine}`
    }
    if (this.isTestRepaired() && fail) {
      return `[PASS] Verified repair: ${fail.repairSummary}`
    }
    return `[CHG] seq#${ev.seq} (${ev.actor}): ${ev.summary || ev.kind} on ${ev.fileAliases.join(", ")}`
  }

  proposeSafeAction(
    actionId: string,
    targetFileAlias: string = "tests/room-capacity.test.mjs",
  ): {ok: boolean; request?: ApprovalRequest; reason?: string} {
    if (!ALLOWED_ACTIONS.includes(actionId as AllowlistedActionId)) {
      return {ok: false, reason: "action_not_allowlisted"}
    }
    const cleanFile = sanitizeFileAlias(targetFileAlias)
    if (!cleanFile.ok) {
      return {ok: false, reason: "invalid_target_file:" + cleanFile.reason}
    }
    const requestId = `req-${this.nonceCounter}`
    const nonce = deterministicHash(`${requestId}:${this.currentProjectId}:${this.nonceCounter++}`)
    const req: ApprovalRequest = {
      requestId,
      actionId: actionId as AllowlistedActionId,
      projectId: this.currentProjectId,
      targetFileAlias: cleanFile.alias,
      description: `Execute allowlisted ${actionId} on ${cleanFile.alias}`,
      nonce,
      createdAtMs: 1794114000000 + this.nonceCounter,
      status: "pending",
    }
    this.pendingApprovals.set(requestId, req)
    this.sceneMode = "APPROVAL_PENDING"
    return {ok: true, request: req}
  }

  approveAction(
    requestId: string,
    actorConfirmation: string,
    nonce: string,
  ): {ok: boolean; receipt?: AuditReceipt; reason?: string} {
    const req = this.pendingApprovals.get(requestId)
    if (!req) return {ok: false, reason: "unknown_requestId"}
    if (req.status !== "pending") return {ok: false, reason: "request_already_" + req.status}
    if (req.nonce !== nonce) return {ok: false, reason: "nonce_mismatch"}
    if (typeof actorConfirmation !== "string" || actorConfirmation.trim().length < 3) {
      return {ok: false, reason: "missing_explicit_confirmation"}
    }
    if (this.connectionState === "OFFLINE" && req.actionId === "run_known_test") {
      req.status = "failed"
      return {ok: false, reason: "fail_closed_host_offline"}
    }

    req.status = "approved"
    const receiptId = `rcpt-${this.auditReceipts.length + 1}`
    const sig = deterministicHash(`${receiptId}:${req.requestId}:${req.actionId}:${req.nonce}:approved`)
    const receipt: AuditReceipt = {
      receiptId,
      requestId: req.requestId,
      actionId: req.actionId,
      actorConfirmation: sanitizeDisplayText(actorConfirmation, 48),
      decision: "approved",
      timestampMs: req.createdAtMs + 100,
      provenance: this.provenance,
      signatureHash: sig,
    }
    req.receiptId = receiptId
    this.auditReceipts.push(receipt)

    // Advance replay to verified pass state when test retry is approved
    if (req.actionId === "run_known_test") {
      const maxSeq = this.eventBuffer[this.eventBuffer.length - 1]?.seq || this.cursorSeq
      this.cursorSeq = maxSeq
      req.status = "executed"
    }
    this.sceneMode = "RESULT"
    this.lastSoundCue = this.soundEnabled ? "chime_approve" : "none"
    return {ok: true, receipt}
  }

  denyAction(requestId: string, reasonText: string = "user_denied"): {ok: boolean; receipt?: AuditReceipt} {
    const req = this.pendingApprovals.get(requestId)
    if (!req || req.status !== "pending") return {ok: false}
    req.status = "denied"
    const receiptId = `rcpt-${this.auditReceipts.length + 1}`
    const receipt: AuditReceipt = {
      receiptId,
      requestId: req.requestId,
      actionId: req.actionId,
      actorConfirmation: sanitizeDisplayText(reasonText, 48),
      decision: "denied",
      timestampMs: req.createdAtMs + 50,
      provenance: this.provenance,
      signatureHash: deterministicHash(`${receiptId}:${req.requestId}:denied`),
    }
    this.auditReceipts.push(receipt)
    this.sceneMode = "PROJECT_OVERVIEW"
    return {ok: true, receipt}
  }

  abortAction(requestId: string): boolean {
    const req = this.pendingApprovals.get(requestId)
    if (!req || (req.status !== "pending" && req.status !== "approved")) return false
    req.status = "cancelled"
    this.sceneMode = "PROJECT_OVERVIEW"
    return true
  }

  previewHypotheticalChange(enable?: boolean): {
    active: boolean
    provenance: ProvenanceMode
    label: string
  } {
    this.hypotheticalBranchActive = enable === undefined ? !this.hypotheticalBranchActive : enable
    return {
      active: this.hypotheticalBranchActive,
      provenance: "PREVIEW_SIMULATION",
      label: this.hypotheticalBranchActive
        ? "[SIM] Hypothetical branch: isolate shared-state cache (no host file edited)"
        : "[SIM] Hypothetical branch off",
    }
  }

  // ---- E. Learning, Mastery & Replay (F43-F52) --------------------------------------------------

  enterLearningMode(caseIndex?: number): LearningCase {
    if (caseIndex !== undefined && caseIndex >= 0 && caseIndex < LEARNING_CASES.length) {
      this.activeCaseIndex = caseIndex
    }
    this.sceneMode = "LEARN"
    return this.activeLearningCase
  }

  get activeLearningCase(): LearningCase {
    return LEARNING_CASES[this.activeCaseIndex] || LEARNING_CASES[0]
  }

  submitPrediction(guessedModuleId: string): {
    correct: boolean
    expectedModuleId: string
    feedback: string
    masteryCount: number
    adaptiveDifficulty: DifficultyTier
  } {
    const c = this.activeLearningCase
    const correct = guessedModuleId === c.expectedFailedModuleId
    if (correct) {
      this.solvedCases.add(c.caseId)
      this.masteryByModule[c.expectedFailedModuleId] =
        (this.masteryByModule[c.expectedFailedModuleId] || 0) + 1
      this.lastSoundCue = this.soundEnabled ? "chime_pass" : "none"
    } else {
      this.failedCasesCount++
      this.lastSoundCue = this.soundEnabled ? "crack_fail" : "none"
    }

    const feedback = correct
      ? `[PASS] Correct! ${c.changedModuleId} broke ${c.expectedFailedModuleId} (${c.evidenceId}). ${c.whyItMatters}`
      : `[FAIL] Not quite: you picked ${guessedModuleId}, but recorded trace ${c.evidenceId} shows ${c.expectedFailedModuleId} failed.`

    this.lastPrediction = {
      caseId: c.caseId,
      guessedModuleId,
      correct,
      feedback,
    }
    return {
      correct,
      expectedModuleId: c.expectedFailedModuleId,
      feedback,
      masteryCount: this.masteryByModule[c.expectedFailedModuleId] || 0,
      adaptiveDifficulty: this.getAdaptiveDifficulty(),
    }
  }

  comparePredictionToTrace(): {
    hasPrediction: boolean
    guessedModuleId: string
    actualFailedModuleId: string
    matched: boolean
    evidenceId: string
  } {
    const c = this.activeLearningCase
    if (!this.lastPrediction) {
      return {
        hasPrediction: false,
        guessedModuleId: "none",
        actualFailedModuleId: c.expectedFailedModuleId,
        matched: false,
        evidenceId: c.evidenceId,
      }
    }
    return {
      hasPrediction: true,
      guessedModuleId: this.lastPrediction.guessedModuleId,
      actualFailedModuleId: c.expectedFailedModuleId,
      matched: this.lastPrediction.correct,
      evidenceId: c.evidenceId,
    }
  }

  getAdaptiveDifficulty(): DifficultyTier {
    const solved = this.solvedCases.size
    if (solved >= 3 && this.failedCasesCount <= 1) return "advanced"
    if (solved >= 1) return "intermediate"
    return "beginner"
  }

  getRecallCard(): {caseId: string; question: string; answer: string} {
    const c = this.activeLearningCase
    return {
      caseId: c.caseId,
      question: c.recallQuestion,
      answer: c.recallAnswer,
    }
  }

  exportSanitizedLearningTrace(): string {
    return JSON.stringify({
      v: 1,
      exportedAt: "2026-11-08T05:00:00.000Z",
      provenance: this.provenance,
      solvedCases: [...this.solvedCases],
      masteryByModule: {...this.masteryByModule},
      adaptiveDifficulty: this.getAdaptiveDifficulty(),
    })
  }

  // ---- F. Voice, Tactile Interaction, Visuals & Accessibility (F53-F64) -------------------------

  setTheme(theme: VisualThemeId): ThemePalette {
    this.theme = theme
    return THEMES[this.theme]
  }

  get palette(): ThemePalette {
    return THEMES[this.theme]
  }

  setAccessibilityOptions(opts: {
    reducedMotion?: boolean
    soundEnabled?: boolean
    soundIntensity?: number
    highContrast?: boolean
    textScale?: number
    evidenceDensity?: EvidenceDensity
  }): void {
    if (opts.reducedMotion !== undefined) this.reducedMotion = opts.reducedMotion
    if (opts.soundEnabled !== undefined) this.soundEnabled = opts.soundEnabled
    if (opts.soundIntensity !== undefined) {
      this.soundIntensity = Math.max(0, Math.min(1, opts.soundIntensity))
    }
    if (opts.highContrast !== undefined) this.highContrast = opts.highContrast
    if (opts.textScale !== undefined) {
      this.textScale = Math.max(0.85, Math.min(1.35, opts.textScale))
    }
    if (opts.evidenceDensity !== undefined) this.evidenceDensity = opts.evidenceDensity
  }

  transitionVoiceState(next: VoiceState): VoiceState {
    if (!this.soundEnabled && next === "SPEAKING") {
      this.voiceState = "MUTED"
      return this.voiceState
    }
    this.voiceState = next
    return this.voiceState
  }

  // ---- G. Reliability, Offline, Security & Proof (F65-F72) --------------------------------------

  handleDisconnect(): {connectionState: ConnectionState; provenance: ProvenanceMode} {
    this.connectionState = "OFFLINE"
    this.provenance = "LOCAL_RECORDED_REPLAY"
    // Fail closed on any pending host actions
    for (const req of this.pendingApprovals.values()) {
      if (req.status === "pending") req.status = "cancelled"
    }
    return {connectionState: this.connectionState, provenance: this.provenance}
  }

  handleReconnect(liveVerified: boolean = false): {
    connectionState: ConnectionState
    provenance: ProvenanceMode
  } {
    this.connectionState = liveVerified ? "LIVE" : "REPLAY"
    this.provenance = liveVerified ? "LIVE_VERIFIED" : "LOCAL_RECORDED_REPLAY"
    return {connectionState: this.connectionState, provenance: this.provenance}
  }

  getProvenanceSummary(): {
    connectionState: ConnectionState
    provenance: ProvenanceMode
    projectId: string
    cursorSeq: number
    totalEvents: number
    droppedEvents: number
    receiptCount: number
    bannerText: string
  } {
    const bannerText =
      this.connectionState === "LIVE"
        ? `LIVE VERIFIED • ${this.currentProject.title} • seq #${this.cursorSeq}`
        : this.connectionState === "OFFLINE"
          ? `OFFLINE FALLBACK • LOCAL RECORDED REPLAY • ${this.currentProject.title}`
          : `SIMULATED IN PREVIEW • LOCAL RECORDED REPLAY • ${this.currentProject.title}`

    return {
      connectionState: this.connectionState,
      provenance: this.provenance,
      projectId: this.currentProjectId,
      cursorSeq: this.cursorSeq,
      totalEvents: this.eventBuffer.length,
      droppedEvents: this.droppedEvents,
      receiptCount: this.auditReceipts.length,
      bannerText,
    }
  }

  exportPersistedState(): PersistedStateV1 {
    return {
      schemaVersion: 1,
      lastProjectId: this.currentProjectId,
      pinnedProjects: this.projects.filter((p) => p.pinned).map((p) => p.projectId),
      masteryByModule: {...this.masteryByModule},
      solvedCases: [...this.solvedCases],
      failedCases: this.failedCasesCount,
      theme: this.theme,
      reducedMotion: this.reducedMotion,
      soundEnabled: this.soundEnabled,
      highContrast: this.highContrast,
      textScale: this.textScale,
      evidenceDensity: this.evidenceDensity,
    }
  }

  wipeAllLocalData(): PersistedStateV1 {
    this.masteryByModule = {}
    this.solvedCases.clear()
    this.failedCasesCount = 0
    this.auditReceipts = []
    this.pendingApprovals.clear()
    this.sessionTraces.clear()
    this.reset()
    return this.exportPersistedState()
  }

  computeDeterministicStateHash(): string {
    const payload = JSON.stringify({
      p: this.currentProjectId,
      m: this.sceneMode,
      c: this.connectionState,
      pr: this.provenance,
      seq: this.cursorSeq,
      sel: this.selectedModuleId,
      fail: this.getActiveFailures().map((f) => f.evidenceId),
      rep: this.isTestRepaired(),
      rcpt: this.auditReceipts.map((r) => r.signatureHash),
      solved: [...this.solvedCases].sort(),
      theme: this.theme,
      rm: this.reducedMotion,
    })
    return deterministicHash(payload)
  }

  snapshot() {
    return {
      projectId: this.currentProjectId,
      projectTitle: this.currentProject.title,
      sceneMode: this.sceneMode,
      connectionState: this.connectionState,
      provenance: this.provenance,
      cursorSeq: this.cursorSeq,
      totalEvents: this.eventBuffer.length,
      selectedModuleId: this.selectedModuleId,
      activeFailures: this.getActiveFailures(),
      testRepaired: this.isTestRepaired(),
      explanation: this.explainCurrentState(),
      glyph: this.mapToolToGlyph(),
      theme: this.theme,
      reducedMotion: this.reducedMotion,
      soundEnabled: this.soundEnabled,
      highContrast: this.highContrast,
      textScale: this.textScale,
      evidenceDensity: this.evidenceDensity,
      lastSoundCue: this.lastSoundCue,
      lastPrediction: this.lastPrediction,
      receipts: [...this.auditReceipts],
      stateHash: this.computeDeterministicStateHash(),
    }
  }

  // ---- Internal helpers -------------------------------------------------------------------------

  private loadProjectTrace(projectId: string): void {
    const cached = this.sessionTraces.get(projectId)
    const proj = this.projects.find((p) => p.projectId === projectId) || this.projects[0]
    const sourceEvents = cached && cached.length > 0 ? cached : proj.recordedEvents
    this.eventBuffer = []
    this.seenEventIds.clear()
    for (const ev of sourceEvents) {
      this.ingestEvent(ev)
    }
    this.cursorSeq = 0
  }

  private applyEventEffectsAtCursor(): void {
    const ev = this.activeEvent
    if (!ev) {
      this.lastSoundCue = "none"
      return
    }
    if (!this.soundEnabled) {
      this.lastSoundCue = "none"
      return
    }
    if (ev.status === "failed") {
      this.lastSoundCue = "crack_fail"
    } else if (ev.kind === "test_completed" && ev.status === "succeeded") {
      this.lastSoundCue = "chime_pass"
    } else {
      this.lastSoundCue = "pulse_change"
    }
  }

  private applyPersistedState(s: PersistedStateV1): void {
    this.currentProjectId = s.lastProjectId
    for (const p of this.projects) {
      p.pinned = s.pinnedProjects.includes(p.projectId)
    }
    this.masteryByModule = {...s.masteryByModule}
    this.solvedCases = new Set(s.solvedCases)
    this.failedCasesCount = s.failedCases
    this.theme = s.theme
    this.reducedMotion = s.reducedMotion
    this.soundEnabled = s.soundEnabled
    this.highContrast = s.highContrast
    this.textScale = s.textScale
    this.evidenceDensity = s.evidenceDensity
  }
}
