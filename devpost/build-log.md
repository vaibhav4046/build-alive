# Build log

Newest at the bottom. Times are local (machine clock).

## 2026-11-08 00:10 to 00:17: environment
- Session started with the project folder as working directory so `.mcp.json` loads.
- `lens-studio` MCP server timed out at connect (`CONNECT_TIMEOUT` after 30000 ms). Cause: Lens Studio process 17708 (the EarthProof window) was not responding. Port 50040 was listening but the app's main thread was blocked.
- A second Lens Studio instance (circuit-coach, a throwaway project) was launched at 00:09:47 and loaded the machine at the same time as Antigravity. Lens Studio EarthProof flipped between responsive and hung in 5 to 10 second bursts and burned about 1.2 cores. No process was killed.
- Wrote the pure simulation module and its node check (outside Lens Studio): `node devpost/tests/sim.check.mjs` passes.
- 00:18 Lens Studio EarthProof became responsive and indexed the new script. The session's `lens-studio` MCP server stayed `failed` ("connection timed out after 30000ms"); the connector re-dial tool refuses project servers and touching `.mcp.json` does not reload it. No scene work was possible through the MCP, so none was done. No raw HTTP was used.

## 2026-11-08 00:50 to 01:30: final-build session (cwd = project folder, MCP connected)
- 00:50 STEP 0 gate passed: `lens-studio` MCP tools resolved; `ListAllPanels` returned 8 panels. `Editor.IAuthorization.isAuthorized` is false; nothing built so far needed a login. Project target was already Spectacles; Preview is SPECS 27 / Interactive; Camera is Perspective with DeviceTracking World; SIK is in the scene.
- 00:52 Probe apply confirmed the box mesh is a 1 cm cube and the cylinder has 1 cm diameter and height (axis Y). Course applied through VirtualScene from `devpost/tools/gen-scene.mjs` (137 operations, 0 errors).
- First preview capture: the preview panel is portrait and shows about 36 degrees horizontally at the ramp distance, so the layout was tightened (ramp plane moved to z=-90, landing 4 cm, base x -16.5 so rover rear to landing end spans 68.9 cm).
- 00:57 Installed AiPreviewAgentInspect, AiPreviewAgentInteract (they add demo objects Guide / ExampleCarousel / demos, to delete) and Leaf (the install call timed out but the package is installed; duplicate `... 2.lspkg` folders appeared).
- 00:58 Lens Studio started rejecting every structural edit ("Invalid transition from Immutable to Mutable") and recompiles time out. Cause found: a modal "Loading LEAF Plugin" window asking permission for filesystem, asset_library and push_to_device. Not clicked (plugin permission grant is the user's decision); asked via the parent session.
- While blocked, offline work: pure `EarthProofFlow.ts` (run state machine) split out of the adapter, `sweep.mjs` (5582 distinct scenarios, 172258 assertions, 0 failed), `layout.check.mjs` (34 assertions), research/competition/notices drafts, the film's pixel-art engine and ambient generator, README/submission/video-script drafts.
- Sweep run 1 had one failing check family (A2 mass sweep) caused by a wrong test assumption (the decisive section changes with mass), not by the sim; the test was corrected and the full sweep re-run clean.
