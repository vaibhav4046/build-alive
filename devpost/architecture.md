# System Architecture — BUILD ALIVE (2026-11-08)

## 1. End-to-End Trust Boundaries & Data Flow

```text
[Local Claude Code Hooks / Authorized Codex Adapter / Sanitized Demo Runner]
  - Lifecycle events only: PreToolUse, PostToolUse, PostToolUseFailure,
    SubagentStart, SubagentStop, Stop
  - Never emits model chain-of-thought or private prompt history
        |
        v
[LOCAL CAPTURE + REDACTION SERVICE] (bridge/redactor.mjs — Node 22+)
  - Allowlisted event kinds and statuses only; default read-only
  - Scrubs API keys, Bearer tokens, .env values, arbitrary host paths,
    email addresses, and unapproved tool stdout
  - Maps host paths to deterministic repo-relative aliases (e.g. "server/lobby.ts")
        |
        v
[NORMALIZER + STATE JOURNAL + REPLAY ENGINE] (bridge/journal.mjs + Assets/Scripts/BuildAliveCore.ts)
  - Canonical v1 event schema validation, monotonic seq ordering, idempotency dedupe
  - Bounded ring buffer (MAX_EVENTS = 128) + persistent JSONL journal (bridge/journal.jsonl)
  - Deterministic state reduction: identical event sequence -> identical scene state
        |
        v
[LOCAL WEBSOCKET BRIDGE] (bridge/ws-server.mjs — ws://127.0.0.1:8787/build-alive)
  - Origin + session-token check, heartbeat ping/pong, backpressure cap
  - Fail-closed offline fallback: when unreachable, Lens runs LOCAL_RECORDED_REPLAY
        |
        v
[SPECS LENS — CLAD + Lens Studio 5.23.2 + SIK 0.18.0 + SpectaclesUIKit + LEAF 2.0.2]
  - Assets/Scripts/BuildAliveCore.ts      (Pure state machine, 72-feature model, zero engine deps)
  - Assets/Scripts/BuildAliveLayout.ts    (Desk-scale cm coordinates, FOV/separation/reach checks)
  - Assets/Scripts/BuildAliveSceneUI.ts   (3D Architecture City, Islands, Bridges, UIKit Cards)
  - Assets/Scripts/BuildAliveTransport.ts (Optional WebSocket client + clean offline fallback)
  - Assets/Scripts/EarthProofMain.ts      (Unified host preserving Rover core + Build Alive)
        |
        v
[AUTHORIZATION DOCK -> ALLOWLISTED LOCAL BRIDGE]
  - User explicitly approves exact allowlisted actionId ("run_known_test",
    "open_read_only_diff", "request_explanation") -> signed SHA-256 audit receipt
  - Zero arbitrary shell execution; fails closed when offline or denied
```

## 2. Client State Machine (`BuildAliveCore.ts`)

### Primary Scene State Machine
`BOOT → PLACEMENT → PROJECT_HUB → PROJECT_OVERVIEW → LIVE_OR_REPLAY → {INSPECT, LEARN, APPROVAL_PENDING, ERROR} → RESULT → PROJECT_HUB`

- **Connection / Provenance Overlay States:**
  - `LIVE_VERIFIED` — event received over authenticated local WebSocket from a real local hook + journal execution.
  - `LOCAL_RECORDED_REPLAY` — deterministic replay of a captured, sanitized session trace bundled with the Lens (default in offline Preview).
  - `PREVIEW_SIMULATION` — hypothetical architectural branch preview (`F42`) or physical Rover simulation (`Island_EarthProof`).
  - `NOT_CONNECTED` — secondary/external provider adapter slot with no active local stream.
- **Audio / Voice State Machine (`F55`, `F58`–`F60`):**
  - `MUTED | IDLE | LISTENING | PROCESSING | SPEAKING | INTERRUPTED | FAILED`
  - Voice input is never required; every action has a primary 1-pinch SIK button or node target.

## 3. Canonical v1 Event Envelope

```json
{
  "v": 1,
  "eventId": "evt-lobby-003",
  "sessionId": "session-lobbysync-01",
  "projectId": "lobby-sync",
  "seq": 3,
  "timestamp": "2026-11-08T05:00:03.000Z",
  "actor": "agent-01",
  "source": "claude-hooks",
  "kind": "tool_finished",
  "status": "failed",
  "fileAliases": ["server/lobby.ts", "tests/room-capacity.test.mjs"],
  "evidenceIds": ["test-room-03", "diff-lobby-01"],
  "provenance": "LOCAL_RECORDED_REPLAY"
}
```

### Validation Invariants (`validateEventEnvelope`)
1. `v === 1` (unknown future versions rejected cleanly without crashing).
2. `eventId`, `sessionId`, `projectId`, `actor` are non-empty ASCII slugs (`<= 64` chars).
3. `seq` is a non-negative integer (`0 <= seq <= 1,000,000`); duplicate `eventId` or stale `seq` is deduplicated idempotently.
4. `kind` is in `{"session_started", "tool_started", "tool_finished", "subagent_started", "subagent_stopped", "test_completed", "approval_requested", "approval_resolved"}`.
5. `status` is in `{"pending", "running", "succeeded", "failed", "denied", "cancelled"}`.
6. `fileAliases` (`<= 8` items) must be normalized relative paths with **zero** `..` traversal, drive letters (`C:`, `D:`), leading slashes, or `.env`/secret filenames.
7. Total serialized JSON payload `<= 4096` bytes.

## 4. Module Decomposition (Data-Driven, Pooled, Zero Per-Frame Allocation)

| Module | File | Responsibility |
|---|---|---|
| `BuildAliveCore` | `Assets/Scripts/BuildAliveCore.ts` | Pure TypeScript implementation of all 72 capabilities (`F01`–`F72`): `EventValidator`, `Scrubber`, `ReplayStore`, `GraphModel`, `DiffEvidence`, `LearningEngine`, `PermissionGate`, `PersistenceMigration`, `ThemeTokens`, `TelemetryProfiler`. |
| `BuildAliveLayout` | `Assets/Scripts/BuildAliveLayout.ts` | Desk-scale centimeter geometry (`DeskShelf`, 3 Project Islands, 6 Architecture City modules, 5 dependency bridges, 2 agent vessels, `RewindCrystal`, 5 front control buttons, right-hand UIKit cards) + FOV and `>= 12 cm` separation math. |
| `BuildAliveSceneUI` | `Assets/Scripts/BuildAliveSceneUI.ts` | Runtime 3D scene & UIKit builder: pools all meshes and cards at `onAwake()`, wires SIK `Interactable` + UIKit `Button`/`BackPlate`/`FlexLayout`, updates transforms and material colors in `O(1)` per event without instantiating or destroying objects during runs. |
| `BuildAliveTransport` | `Assets/Scripts/BuildAliveTransport.ts` | Optional `InternetModule` WebSocket adapter (`ws://127.0.0.1:8787/build-alive`) with automatic fail-closed fallback to `LOCAL_RECORDED_REPLAY`. |
| `EarthProofMain` | `Assets/Scripts/EarthProofMain.ts` | Root component wired in `Assets/Scene.scene`: preserves 100% of the `core-rover-v1` Ramp Climb trial AND mounts `BuildAliveSceneUI` so both `c1`–`c7` and `L01`–`L22` LEAF suites execute in the same scene. |
| `LeafIndex` & `L01`–`L22` | `Assets/Scripts/Leaf/*` | 22 mandatory BUILD ALIVE LEAF scenarios (`L01`–`L22`) + 9 preserved EarthProof scenarios (`c1`–`c7`). |
| `demo-repo` | `demo-repo/*` | Real standalone multiplayer game codebase (`LobbySync`) with runnable test suite (`node demo-repo/run-tests.mjs`). |
| `bridge` | `bridge/*` | Node.js capture, secret/path redactor, JSONL state journal, allowlisted action gate, and WebSocket server (`node bridge/ws-server.mjs`). |
