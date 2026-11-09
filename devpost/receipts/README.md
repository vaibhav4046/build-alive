# LEAF run receipts (Lens Studio 5.23.2 Preview, 2026-11-08)

Raw lines are copied verbatim (long path prefix trimmed) from the Lens Studio log
`LensStudioLog-2026-11-08-22-41-36-906-ecd59.txt` by `devpost/tools/leaf-receipts.mjs`.
Scenarios were launched with the lens-studio MCP `run_leaf_scenario` (`onDevice:false`, i.e. Lens Studio Preview).
Each `*.runNNNN.txt` starts at the `RUNS: <scenario>` line; `_summary.json` has the verdict per run.

| Folder | What it is | Result |
|---|---|---|
| `first-pass-parallel-batches/` | First sweep (22:54-23:00). Calls were issued in batches; the log timestamps show the runs were still strictly sequential. Build before any fix. | 26 PASS / 5 FAIL (`L06`, `L16`, `L18`, `c6-controls`, `c6-ik-reach`) |
| `final-sweep/` | Second full sweep (23:15-23:22) after the fixes below. | **31/31 PASS** (L01-L22 + c1, c2, c3 x2, c4, c5, c6 x2, c7) |

Caveats, stated plainly:
- The MCP client call for `c7-latency` timed out client-side in both sweeps (the scenario takes ~52 s); the PASS verdict for c7 comes from the Lens Studio log (`PASSED: c7-latency`), not from the MCP return value.
- `c6-controls` failed once in the first sweep ("Small ... OUT OF VIEW" from the live camera/gaze reading) and passed on every later run. The cause of the one-off was not isolated: treat it as order/state dependent.
- Tests run against the scene in its sample / recorded-replay mode. No live agent event reached the Lens (see `devpost/test-results.md` section 6).

## What the failures were and what changed
| Scenario | Failure | Class | Fix |
|---|---|---|---|
| L06 | expected `[CHG]` on Lobby after stepping to seq 3 | **Test bug**: in the recorded replay seq 2 is the `tool_finished` edit, seq 3 is `subagent_started` | Scenario now steps to seq 2 (`Leaf/L06FileEditPulse.ts`, generator `tools/gen-leaf-files.mjs`) |
| L18 | "redaction token shown" in card row 1 | **Test bug**: sample-mode row 1 shows the engine explanation, not the raw event summary. The "secrets not in UI" assertion already passed | Scenario now asserts the event the UI binds (`engine.activeEvent.summary`) contains `[REDACTED...]` |
| L16 / c6-ik-reach | IK hand could not trigger `BA_StepButton` / Run | **Real product defect**: `Island_*` sat at the same x/y directly in front of the row-1 rail buttons, so the Preview camera's line to the button was blocked (`PreviewInteractTool`: "obstructed by Island_LobbySync") | Islands moved onto the desk (`BuildAliveLayout.ts`, `ISLAND_Y`, y -24.5 -> -27.3). L16 and c6-ik-reach pass afterwards |

L06 and L18 changed the test, not the product; that is recorded here so it is not mistaken for a product fix.

## Polish pass (23:39-23:56): labels, card layout, InternetModule
Changes in `BuildAliveSceneUI.ts`: floating labels no longer inherit their parent box scale (text had been rendering 5-8x oversize and overlapping), module name badges show only on focus/inspect, evidence-card rows use smaller sizes with shrink-to-fit, and re-enabled rows now trigger a FlexLayout re-layout (rows 3-5 were stacking at the card origin). `BuildAliveTransport.ts` prints WebSocket diagnostics. A native `InternetModule` asset (`Assets/BuildAliveInternetModule.internetModule`) was created and assigned to `EarthProofMain.internetModule`.

| Folder | Result |
|---|---|
| `polish-sweep/` | 30 PASS, L17 NO_VERDICT: the next scenario call cancelled it (log: "There is already a scenario running"). L17 takes ~50 s; the MCP call times out client-side |
| `polish-sweep-l17-rerun/` | L17 alone: **PASS** (200-press p50=2.0 / p95=2.0 / p99=3.0 ms) |

Net on the polished build: **31/31 PASS** (30 in the sweep + L17 rerun).

**Live link finding:** with the InternetModule assigned, `createWebSocket("ws://127.0.0.1:8787/build-alive")` throws in Preview: `URL is not secure (Experimental API must be enabled to access insecure URLs)` (log line in `polish-sweep/*.txt`). The Lens fails closed to recorded replay (banner now reads OFFLINE FALLBACK). Enabling Lens Studio Experimental APIs in Project Settings is a user decision (it blocks store publishing) and was NOT changed. Until then no bridge event or real-workspace world reaches the Lens.
