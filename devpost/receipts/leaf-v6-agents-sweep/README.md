# LEAF sweep: v6 glass + tiles + icons + Claude mark + agent chip row

Run on branch `visual-emergency-rebuild` at 978aaa4 (+ notices/receipt), Lens Studio 5.23.2 Preview, 2026-11-09 09:56-10:25 local log time.
Scenarios were run one at a time through the Lens Studio MCP (`run_leaf_scenario`); verdicts below are copied from the Lens Studio log
(`DefaultLeafScenarioManager ... PASSED:/FAILED:`), latest run of each scenario. Frame time was healthy (scenarios 4-9 s) because the game process that starved the machine earlier was no longer running.

Result: **36 of 37 PASSED, 1 FAILED.**

| Verdict | Scenario | Time |
|---|---|---|
| PASSED | L01-scene-boot-provenance | 2.508s |
| PASSED | L02-project-islands-exist | 2.513s |
| PASSED | L03-pinch-project-island | 3.521s |
| PASSED | L04-agent-vessel-and-subagent | 1.161s |
| PASSED | L05-architecture-city-graph | 1.160s |
| PASSED | L06-file-edit-pulse | 2.566s |
| PASSED | L07-test-failure-fault-marker | 2.568s |
| PASSED | L08-pinch-fault-marker-causal-chain | 1.405s |
| PASSED | L09-rewind-crystal-diff | 2.972s |
| PASSED | L10-learning-atelier-prediction | 1.624s |
| PASSED | L11-safe-action-gate-approve-reject | 1.391s |
| PASSED | L12-re-run-tests-after-fix | 1.164s |
| PASSED | L13-reset-baseline | 3.093s |
| PASSED | L14-control-size-spacing | 1.147s |
| PASSED | L15-camera-fov-visibility | 1.147s |
| PASSED | L16-ik-reachability | 8.504s |
| PASSED | L17-latency-benchmark | 53.083s |
| PASSED | L18-secret-redaction | 2.647s |
| PASSED | L19-malformed-event-handling | 1.134s |
| PASSED | L20-duplicate-out-of-order | 1.148s |
| PASSED | L21-disconnect-fallback | 2.652s |
| PASSED | L22-reduced-motion-colour-safe | 1.142s |
| PASSED | L23-real-workspace-islands | 2.836s |
| PASSED | L24-pinch-real-module-path | 1.794s |
| PASSED | L25-feedback-and-rewards | 4.046s |
| PASSED | L26-agent-orbs-and-flow-pipeline | 3.563s |
| PASSED | L27-window-minimise-restore | 5.126s |
| PASSED | c1-layout | 1.799s |
| PASSED | c2-stall-evidence | 2.656s |
| PASSED | c3-drop-far | 3.462s |
| PASSED | c3-swap-pinch | 4.013s |
| PASSED | c4-pass-proof | 9.174s |
| PASSED | c5-reset | 9.088s |
| FAILED | c6-controls | 1.784s |
| PASSED | c6-ik-reach | 7.301s |
| PASSED | c7-latency | 51.805s |
| PASSED | L28-agent-chips | (run after the table was cut; passed 3x, last ~4 s) |

## The one failure
`c6-controls` (legacy Rover task, not the Build Alive UI): the old "Small" motor-block slot is 22.5 deg right of the gaze, outside the +-16 deg horizontal field of view the test computes.
It fails identically with the Preview camera reset to default, so it is not caused by the Build Alive camera pose; it is a layout check for the original Rover lens that Build Alive does not use. Not fixed.

## c3-swap-pinch and c4-pass-proof
Both failed earlier on this branch while the machine was starved (frame time 320-430 ms). Both PASS here at normal frame rate (4.0 s and 9.2 s), which is evidence for the starvation explanation. It is not proof of a code root cause.

## Not covered
No live Claude Code hook event was proven (Experimental APIs still not effective in Lens Studio). Provider status stays REPLAY. Nothing here ran on glasses.
