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
