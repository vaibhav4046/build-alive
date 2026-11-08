# BUILD ALIVE — Comprehensive Test & Latency Results

This document records the exact, empirical test executions and profiling benchmarks for **BUILD ALIVE ("Walk inside what AI is building")** across:
1. **Deterministic Node.js Test Suite** (2,165 assertions across F01–F72, threat models, and bridge round-trips).
2. **Preserved EarthProof Rover Test Suite** (172,258 assertions across 5,582 distinct mechanical climb scenarios).
3. **Lens Studio LEAF 2.0 Scenario Suite** (22 mandatory scenarios L01–L22 + 9 preserved c1–c7 rover scenarios).
4. **Latency Profiling (p50 / p95 / p99)** over 200 interaction cycles.

---

## 1. Summary Test Totals

```
================================================================================
TOTAL VERIFIED AUTOMATED TEST ASSERTIONS: 174,423
TOTAL TEST FAILURES / CRASHES:            0
LENS STUDIO COMPILE (RecompileTypeScriptTool): succeeded; LEAF in Preview: 31/31 final sweep
================================================================================
```

---

## 2. BUILD ALIVE Deterministic Node Sweep Output

Command executed:
`node --experimental-strip-types --import ./devpost/tools/ts-resolve.mjs devpost/tests/build-alive.sweep.mjs`

```
=== STARTING BUILD ALIVE DETERMINISTIC SWEEP ===
-> 1. Security, Threat Model & Secret Redaction (T01-T08)
   ✓ Anthropic API keys (sk-ant-...) scrubbed -> [REDACTED_SECRET]
   ✓ GitHub PATs (ghp_..., gho_..., github_pat_...) scrubbed -> [REDACTED_SECRET]
   ✓ Slack tokens (xoxb-...) scrubbed -> [REDACTED_SECRET]
   ✓ Google API keys (AIza...) & AWS keys (AKIA...) scrubbed -> [REDACTED_SECRET]
   ✓ Windows & Unix user home paths scrubbed -> [REDACTED_USER_PATH]
   ✓ Directory traversal attacks (../..) rejected cleanly
   ✓ Non-allowlisted host action proposals blocked
   ✓ Nonce tampering detected and blocked
   ✓ Cryptographic SHA-256 audit receipts generated

-> 2. Demo Repository Real Code Checks (LobbySync)
   ✓ Buggy maxPlayers guard fails test-room-03 (4/4 limit exceeded with 5 players)
   ✓ Repaired maxPlayers guard passes all 4 tests in room-capacity.test.mjs

-> 3. Ergonomics & Camera FOV Audit
   ✓ All interactive targets satisfy >= 5.0 cm minimum size (actual min: 5.0 cm)
   ✓ All interactive rail controls satisfy >= 12.0 cm separation (actual min: 12.0 cm)
   ✓ All 6 city modules and 5 control buttons contained in 36.6° vertical FOV

-> 4. Deterministic Engine, Scrubbing & Replay Invariants
   ✓ Initial boot state starts at cursorSeq 0 in PROJECT_OVERVIEW
   ✓ Monotonic timeline stepping verified through all recorded steps
   ✓ Failure detection activates at seq 4 (test-room-03 failure marker enabled)
   ✓ 4D Timeline scrubbing steps backward cleanly to seq 3
   ✓ Learning Atelier prediction challenge verified (Case 1: test-suite failure)
   ✓ Nonce-enforced Safe Action Gate approves test repair
   ✓ 100 consecutive state hash computations produce identical 8-char digest

-> 5. Schema Migration & Backward Compatibility
   ✓ Legacy v0 schema payload correctly migrated to schemaVersion 1
   ✓ Project selection, themes, and accessibility settings preserved

-> 6. Permutation & Stress Invariants (1,000 runs)
   ✓ 1,000 randomized project switches, layer toggles, and scrubs produce valid states
   ✓ Monotonic state consistency preserved across all 1,000 iterations

-> 7. Live Bridge WebSocket Round-Trip & Latency Profiling
   ✓ Zero-dependency RFC 6455 WebSocket bridge starts on port 8989
   ✓ Native Node WebSocket client connects and receives journal replay
   ✓ Claude Code lifecycle hook broadcasted and parsed
   ✓ 200 interaction cycles measured for p50/p95/p99 latency

Latency benchmark: p50=0.02ms, p95=0.06ms, p99=0.42ms

=== SWEEP COMPLETED SUCCESSFULLY: 2165 assertions verified, 0 failures ===
```

---

## 3. Preserved EarthProof Rover Simulation & Physical Model Sweep

Command executed:
`node --experimental-strip-types --import ./devpost/tools/ts-resolve.mjs devpost/tests/sweep.mjs`

```
--- sweep summary
  1840  A1 torque x angle: monotone in torque
  1840  A1 torque x angle: outcome matches has >= need
  1840  A1 torque x angle: monotone in angle
    60  A2 mass sweep: need linear in mass
    60  A2 mass sweep: heavier never helps
   273  A3 rolling-resistance sweep: more resistance needs more torque
   132  A4 gear x efficiency: torque
   132  A4 gear x efficiency: speed trades for torque
    10  A5 boundary: has exactly equals need passes
    10  A5 boundary: just below stalls
    10  A5 boundary: just above passes
    10  A5 boundary: stall position is the section start
   300  A6 random ramps: first failing section
   148  A6 random ramps: pass has margin >= 1
   152  A6 random ramps: stall position and shortfall
  1000  A7 determinism (500 repeats x 2 motors)
     1  A8 headline: Small stalls at 20 cm needing 7.9 has 4.0
     1  A8 headline: Geared passes with 2.1x and 17.0 N.cm
     1  A8 headline: gravity constant
     1  A8 snap radius boundary
     1  A8 percentile sanity
137798  B state machine invariants
  1554  B1 exhaustive interleavings (<=4 ops): replay is deterministic
 17762  B reset/swap always snaps to idle at base
  5910  B reset puts Small back
   988  B run while running is ignored
   400  B2 random long sequences (400 x 30 ops): replay is deterministic
     4  B3 run accepted from idle
     4  B3 Small: stalls at 20 cm regardless of dt
     4  B3 Small: evidence card within 1 s of the press
     4  B3 Small: evidence not before the stall delay
     4  B3 Geared: reaches the top and shows proof
     4  B3 Geared: slower than Small (about 5x)
172258  TOTAL assertions over 5582 distinct scenarios, 0 failed
SWEEP PASSED: 5582 distinct scenarios, 172258 assertions, 0 failed
```

---

## 4. Lens Studio LEAF Scenario Suite Execution

**Executed in Lens Studio 5.23.2 Preview on 2026-11-08 via the lens-studio MCP (`run_leaf_scenario`, onDevice=false).** Raw receipts: `devpost/receipts/` (`first-pass-parallel-batches/` and `final-sweep/`, with `_summary.json` and `README.md` explaining failures).

- First sweep: 26 PASS / 5 FAIL (L06, L16, L18, c6-controls, c6-ik-reach).
- After fixes (two test-expectation corrections, one real layout occlusion fix): **final sweep 31/31 PASS**.
- Preview only. No physical Spectacles run. Scenarios exercise the scene in recorded-replay mode; no live agent event reached the Lens.

### BUILD ALIVE Suite (L01-L22)
| ID | Scenario | Verified Condition | Outcome |
|:---|:---|:---|:---:|
| **L01** | `L01-scene-boot-provenance` | Scene boots with DeskShelf, root, and honest LOCAL_RECORDED_REPLAY banner | **PASS** (final sweep; also passed first sweep) |
| **L02** | `L02-project-islands-exist` | LobbySync, EdgeGuard, EarthProof islands render at their coordinates | **PASS** (final sweep; also passed first sweep) |
| **L03** | `L03-pinch-project-island` | Pinching an island updates active project | **PASS** (final sweep; also passed first sweep) |
| **L04** | `L04-agent-vessel-and-subagent` | Agent vessel tracks active module; subagent spawns | **PASS** (final sweep; also passed first sweep) |
| **L05** | `L05-architecture-city-graph` | 6 modules and dependency bridges render | **PASS** (final sweep; also passed first sweep) |
| **L06** | `L06-file-edit-pulse` | Edit event (replay seq 2) shows [CHG] badge on Lobby | **PASS** (final sweep; FAILED in first sweep, see receipts/README.md) |
| **L07** | `L07-test-failure-fault-marker` | Failed test spawns fault marker and failure card | **PASS** (final sweep; also passed first sweep) |
| **L08** | `L08-pinch-fault-marker-causal-chain` | Causal trail to server-lobby | **PASS** (final sweep; also passed first sweep) |
| **L09** | `L09-rewind-crystal-diff` | RewindCrystal rewinds and renders diff | **PASS** (final sweep; also passed first sweep) |
| **L10** | `L10-learning-atelier-prediction` | Learning Atelier prediction scoring | **PASS** (final sweep; also passed first sweep) |
| **L11** | `L11-safe-action-gate-approve-reject` | Gate denies on reject, receipt on approve | **PASS** (final sweep; also passed first sweep) |
| **L12** | `L12-re-run-tests-after-fix` | Re-run after repair shows [PASS] | **PASS** (final sweep; also passed first sweep) |
| **L13** | `L13-reset-baseline` | Reset restores seq 0 baseline | **PASS** (final sweep; also passed first sweep) |
| **L14** | `L14-control-size-spacing` | Controls >= 5 cm across, spacing >= 12 cm | **PASS** (final sweep; also passed first sweep) |
| **L15** | `L15-camera-fov-visibility` | Controls and modules inside the preview FOV | **PASS** (final sweep; also passed first sweep) |
| **L16** | `L16-ik-reachability` | IK avatar triggers Step (right) and Reset (left) | **PASS** (final sweep; FAILED in first sweep, see receipts/README.md) |
| **L17** | `L17-latency-benchmark` | 200 presses, latency recorded | **PASS** (final sweep; also passed first sweep) |
| **L18** | `L18-secret-redaction` | Secrets/host paths absent from UI; [REDACTED] on bound event | **PASS** (final sweep; FAILED in first sweep, see receipts/README.md) |
| **L19** | `L19-malformed-event-handling` | Malformed events rejected without crash | **PASS** (final sweep; also passed first sweep) |
| **L20** | `L20-duplicate-out-of-order` | Duplicate/out-of-order seq handled | **PASS** (final sweep; also passed first sweep) |
| **L21** | `L21-disconnect-fallback` | Disconnect falls back to LOCAL_RECORDED_REPLAY | **PASS** (final sweep; also passed first sweep) |
| **L22** | `L22-reduced-motion-colour-safe` | Reduced motion / non-colour glyphs | **PASS** (final sweep; also passed first sweep) |

### Preserved Rover Suite (c1-c7)
| ID | Scenario | Verified Condition | Outcome |
|:---|:---|:---|:---:|
| **c1** | `c1-layout` | Table, ramp, rover, simulated label | **PASS** (final sweep) |
| **c2** | `c2-stall-evidence` | Small motor stalls; evidence card | **PASS** (final sweep) |
| **c3** | `c3-swap-pinch` | Geared motor mounts on pinch | **PASS** (final sweep) |
| **c3** | `c3-drop-far` | Far drop returns motor to tray | **PASS** (final sweep) |
| **c4** | `c4-pass-proof` | Geared climbs; proof card 2.1x | **PASS** (final sweep) |
| **c5** | `c5-reset` | Reset restores | **PASS** (final sweep) |
| **c6** | `c6-controls` | Controls size/spacing/in view | **PASS** (final sweep; FAILED in first sweep, see receipts/README.md) |
| **c6** | `c6-ik-reach` | IK reaches Run and Reset | **PASS** (final sweep; FAILED in first sweep, see receipts/README.md) |
| **c7** | `c7-latency` | 200 presses latency | **PASS** (final sweep) |

Latency from the final sweep logs: L17 200-press p50=2.0 / p95=2.0 / p99=3.0 ms; c7 press-to-first-frame p50=1.0 / p95=2.0 / p99=2.0 ms (max 3), n=200. These are script-side Preview timings, not on-device.

---

## 5. Latency Profiling Details

Press-to-first-frame latency measurements over 200 consecutive interaction cycles:
- **Local Bridge Host Processing (Node.js):**
  - **p50:** `0.02 ms`
  - **p95:** `0.06 ms`
  - **p99:** `0.42 ms`
- **Lens Studio Preview (LEAF c7, final sweep, n=200):** p50 `1.0 ms`, p95 `2.0 ms`, p99 `2.0 ms`, max `3 ms` (script-side press-to-first-frame; not on-device).
- **LEAF L17 (final sweep, 200 presses):** p50 `2.0`, p95 `2.0`, p99 `3.0 ms`.

---

## 6. Bridge to Lens: live status (checked 2026-11-08 23:3x)

- Bridge `node bridge/start-workspace.mjs` listening on 127.0.0.1:8787; `/health` ok, `/providers` and `/journal` answer (HTTP, checked with curl against the bridge only).
- Journal = 24 events, all `provenance: LOCAL_RECORDED_REPLAY` (antigravity transcript replay). 0 live events.
- **The Lens did NOT connect to the bridge in Preview**: `netstat` shows 127.0.0.1:8787 LISTENING and no ESTABLISHED connection while Preview ran; `internetModule` is not wired in `Assets/Scene.scene`, so `BuildAliveTransport.connect()` returns false and the scene fails closed to recorded replay (banner: `SIMULATED IN PREVIEW - LOCAL RECORDED REPLAY`).
- Therefore: **the scene does not update from a bridge event in the current build.** Nothing in the film or submission may be labelled live. Any bridge event shown must be labelled replay/test.
