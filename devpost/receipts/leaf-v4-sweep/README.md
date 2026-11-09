# LEAF sweep on the v4 voxel-valley build (Lens Studio 5.23.2 Preview, 2026-11-09 04:54-05:05 GMT)

Raw lines come verbatim from the Lens Studio log `LensStudioLog-2026-11-09-04-40-27-235-639cb.txt`
(from log line 4799) via `devpost/tools/leaf-receipts.mjs`; `_summary.json` has the verdict per run.
Scenarios were launched with the lens-studio MCP `run_leaf_scenario` (`onDevice:false`, Lens Studio Preview, device SPECS 27).

**Result: 31 of 32 scenarios PASS (L01-L24 all PASS; c1, c2, c3 x2, c4, c5, c6-ik-reach, c7 PASS). c6-controls FAILS (two runs).**

## What failed, what changed (before this sweep: L02 and L16 failed on the first pass)
| Scenario | Failure | Class | Change |
|---|---|---|---|
| L02 | `Island_EdgeGuard y: got -0.55, want -1 +/- 0.1` | Test bug: islands bob by design (+/-0.45 cm in `BuildAliveSceneUI`) | Tolerance 0.1 -> 0.55 cm in `Leaf/L02ProjectIslands.ts` and `devpost/tools/gen-leaf-files.mjs` |
| L16 | `IK left hand triggered BA_ResetButton` failed twice | Real product defect: dock at y -32 / z -42 was out of a seated avatar's reach | Dock raised/closer: y -29.5, z -40 (`BuildAliveLayout.ts`); L16 then PASSED, L14/L15 still PASS |

## c6-controls FAIL (not fixed, not hidden)
`[c6] Small is -18.2 deg right, -4.7 deg up of the gaze: OUT OF VIEW` (half horizontal FOV is about 16.1 deg). This scenario audits the legacy Rover
fallback (RunButton/ResetButton/motor blocks), not the BUILD ALIVE world. The Preview `Camera Object` reads (0, -2, 23) pitched -14 deg in this
session; `BuildAliveLayout.PREVIEW_EYE` still says z 14. The earlier receipts record one unexplained c6-controls failure too. Unresolved.

## Other caveats
- The MCP calls for `L17-latency-benchmark` and `c7-latency` timed out client-side (about 50 s each); the PASS verdicts come from the Lens Studio log
  (`PASSED: L17-latency-benchmark`, p50=2.0 / p95=3.0 / p99=6.0 ms over 200 presses; `PASSED: c7-latency`).
- The Lens runs in recorded-replay / real-scan mode. The bridge websocket still throws `URL is not secure (Experimental API must be enabled to access
  insecure URLs)` in Preview, so no live agent event reached the Lens in this sweep.
- After a c-scenario the Rover fallback objects stay enabled in Preview until the next Lens reset; that is test-state leftover, not the boot state.
