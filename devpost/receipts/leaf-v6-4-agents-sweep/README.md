# LEAF sweep: v6.4-agents (monogram mode, Learn reacts, legibility pose, agent chips)

Branch `visual-emergency-rebuild`, Lens Studio 5.23.2 Preview, 2026-11-09 10:55-11:45 local log time, normal frame rate (scenarios 1-10 s, c7/L17 ~52 s by design).
Preview camera pose for this sweep and for the film: position (0, -24, 23), pitch +4 deg, so the windows sit against the plain wall above the pegboard.
Scenarios were run one at a time through the Lens Studio MCP; verdicts are copied from the Lens Studio log (`DefaultLeafScenarioManager ... PASSED:/FAILED:`), latest run of each.

Result: **36 of 36 active scenarios PASSED.** (c1, c2, c3-swap, c3-drop, c4, c5, c7; L01-L29.)

| Verdict | Scenario | Time |
|---|---|---|
| PASSED | L01-scene-boot-provenance | 2.909s |
| PASSED | L02-project-islands-exist | 2.894s |
| PASSED | L03-pinch-project-island | 2.047s |
| PASSED | L04-agent-vessel-and-subagent | 1.143s |
| PASSED | L05-architecture-city-graph | 1.170s |
| PASSED | L06-file-edit-pulse | 1.143s |
| PASSED | L07-test-failure-fault-marker | 3.093s |
| PASSED | L08-pinch-fault-marker-causal-chain | 1.410s |
| PASSED | L09-rewind-crystal-diff | 1.445s |
| PASSED | L10-learning-atelier-prediction | 3.807s |
| PASSED | L11-safe-action-gate-approve-reject | 1.407s |
| PASSED | L12-re-run-tests-after-fix | 1.133s |
| PASSED | L13-reset-baseline | 3.533s |
| PASSED | L14-control-size-spacing | 1.147s |
| PASSED | L15-camera-fov-visibility | 1.145s |
| PASSED | L16-ik-reachability | 7.456s |
| PASSED | L17-latency-benchmark | 54.360s |
| PASSED | L18-secret-redaction | 3.165s |
| PASSED | L19-malformed-event-handling | 1.144s |
| PASSED | L20-duplicate-out-of-order | 1.150s |
| PASSED | L21-disconnect-fallback | 1.165s |
| PASSED | L22-reduced-motion-colour-safe | 1.139s |
| PASSED | L23-real-workspace-islands | 1.287s |
| PASSED | L24-pinch-real-module-path | 1.779s |
| PASSED | L25-feedback-and-rewards | 2.453s |
| PASSED | L26-agent-orbs-and-flow-pipeline | 2.128s |
| PASSED | L27-window-minimise-restore | 3.464s |
| PASSED | L28-agent-chips | 3.799s |
| PASSED | L29-learn-reacts | 4.533s |
| PASSED | c1-layout | 1.784s |
| PASSED | c2-stall-evidence | 2.659s |
| PASSED | c3-drop-far | 3.469s |
| PASSED | c3-swap-pinch | 3.013s |
| PASSED | c4-pass-proof | 8.984s |
| PASSED | c5-reset | 10.301s |
| PASSED | c7-latency | 51.610s |

## Legacy (documented, not run)
Rover prototype hidden in v6; its 22.5 deg slot test no longer applies.
- `c6-controls`: the old Rover "Small" slot is 22.5 deg off the gaze, outside the half-FOV the test computes (also failed identically at the default camera).
- `c6-ik-reach`: IK arm pressing the hidden Rover's Run/Reset; passes only at the old Rover camera pose, FAILS at the v6 presentation pose ("timeout waiting for stall after the IK press on Run", 11.2 s). v6 dock reach is covered by L16.
Both are listed in `LEGACY_SCENARIOS` in `Assets/Scripts/Leaf/LeafIndex.ts` and removed from the registered scenarios. The other c-scenarios still pass and still run.

## c3/c4 history
c3-swap-pinch and c4-pass-proof failed earlier while the machine was starved by a game process (frame time 320-430 ms) and pass at normal frame rate. That fits starvation; it is not proof of a code root cause.

## Not covered
No live Claude Code hook event: Experimental APIs is still not effective in Lens Studio (log: "URL is not secure (Experimental API must be enabled to access insecure URLs)"). Provider status stays REPLAY. Nothing ran on glasses.
