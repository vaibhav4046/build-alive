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
LENS STUDIO COMPILATION STATUS:           100% CLEAN (0 ERRORS, 0 WARNINGS)
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

All 31 scenarios are compiled into Lens Studio's `LeafIndex.ts`:

### BUILD ALIVE Suite (L01–L22)
| ID | Scenario | Verified Condition | Outcome |
|:---|:---|:---|:---:|
| **L01** | `L01-scene-boot-provenance` | Scene boots with DeskShelf, root, and honest `LOCAL_RECORDED_REPLAY` banner | **PASS** |
| **L02** | `L02-project-islands-exist` | LobbySync, EdgeGuard, EarthProof islands render at physical coordinates | **PASS** |
| **L03** | `L03-pinch-project-island` | Pinching an island updates active project and loads recorded trace | **PASS** |
| **L04** | `L04-agent-vessel-and-subagent` | Primary agent vessel tracks active module; subagent spawns on step 4 | **PASS** |
| **L05** | `L05-architecture-city-graph` | 6 modules & 5 dependency bridges render with correct role colors | **PASS** |
| **L06** | `L06-file-edit-pulse` | Code edit event triggers `[CHG]` badge and structural pulse | **PASS** |
| **L07** | `L07-test-failure-fault-marker` | Failed test at step 4 spawns `FaultMarker_Room03` & coral failure card | **PASS** |
| **L08** | `L08-pinch-fault-marker-causal-chain` | Inspecting failed test displays causal dependency trail to `server-lobby` | **PASS** |
| **L09** | `L09-rewind-crystal-diff` | Pinching RewindCrystal rewinds timeline and renders inline code diff | **PASS** |
| **L10** | `L10-learning-atelier-prediction` | Learning Atelier prediction challenge accepts correct answer & awards score | **PASS** |
| **L11** | `L11-safe-action-gate-approve-reject` | Safe Action Gate denies on reject and produces cryptographic receipt on approve | **PASS** |
| **L12** | `L12-re-run-tests-after-fix` | Re-running test after guard repair transitions module to `[PASS]` | **PASS** |
| **L13** | `L13-reset-baseline` | Reset button restores scene to deterministic seq 0 baseline | **PASS** |
| **L14** | `L14-control-size-spacing` | All controls >= 5 cm across; center spacing >= 12 cm | **PASS** |
| **L15** | `L15-camera-fov-visibility` | All controls & city modules within 36.6° vertical FOV | **PASS** |
| **L16** | `L16-ik-reachability` | Bitmoji IK avatar reaches Step (right) and Reset (left) | **PASS** |
| **L17** | `L17-latency-benchmark` | 200 interaction presses record p99 < 100 ms | **PASS** |
| **L18** | `L18-secret-redaction` | API keys and host username paths are scrubbed from AR HUD text | **PASS** |
| **L19** | `L19-malformed-event-handling` | Malformed JSON and unauthorized schemas are rejected without crash | **PASS** |
| **L20** | `L20-duplicate-out-of-order` | Out-of-order and duplicate sequence numbers handled deterministically | **PASS** |
| **L21** | `L21-disconnect-fallback` | WebSocket disconnection triggers fail-closed `LOCAL_RECORDED_REPLAY` fallback | **PASS** |
| **L22** | `L22-reduced-motion-colour-safe` | Accessibility mode disables pulse; text badges use non-color glyphs | **PASS** |

### Preserved Rover Suite (c1–c7)
| ID | Scenario | Verified Condition | Outcome |
|:---|:---|:---|:---:|
| **c1** | `c1-layout` | Physical table, ramp, rover, and "Simulated in preview" label | **PASS** |
| **c2** | `c2-stall-evidence` | Small motor stalls at 20 cm; evidence card in 741 ms | **PASS** |
| **c3** | `c3-swap-pinch` | Geared motor mounts on pinch; evidence clears | **PASS** |
| **c3** | `c3-drop-far` | Dropping motor far from mount returns it to parts tray | **PASS** |
| **c4** | `c4-pass-proof` | Geared motor climbs ramp to top; proof card shows 2.1x margin | **PASS** |
| **c5** | `c5-reset` | Reset restores rover to base and Small motor to mount | **PASS** |
| **c6** | `c6-controls` | Controls >= 12 cm apart and >= 5 cm across | **PASS** |
| **c6** | `c6-ik-reach` | Bitmoji IK avatar reaches Run and Reset buttons | **PASS** |
| **c7** | `c7-latency` | 200 physical presses log p50/p95/p99 latency (1.0 / 1.0 / 2.0 ms) | **PASS** |

---

## 5. Latency Profiling Details

Press-to-first-frame latency measurements over 200 consecutive interaction cycles:
- **Local Bridge Host Processing (Node.js):**
  - **p50:** `0.02 ms`
  - **p95:** `0.06 ms`
  - **p99:** `0.42 ms`
- **Lens Studio Preview LateUpdate Flush (LEAF c7/L17):**
  - **p50:** `1.0 ms`
  - **p95:** `1.0 ms`
  - **p99:** `2.0 ms`
  - **Worst-case maximum:** `4.0 ms` (well under the 100 ms target threshold)
