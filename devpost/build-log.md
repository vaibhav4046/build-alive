# Build log

Newest at the bottom. Times are local (machine clock).

## 2026-11-08 00:10 to 00:17: environment
- Session started with the project folder as working directory so `.mcp.json` loads.
- `lens-studio` MCP server timed out at connect (`CONNECT_TIMEOUT` after 30000 ms). Cause: Lens Studio process 17708 (the EarthProof window) was not responding. Port 50040 was listening but the app's main thread was blocked.
- A second Lens Studio instance (circuit-coach, a throwaway project) was launched at 00:09:47 and loaded the machine at the same time as Antigravity. Lens Studio EarthProof flipped between responsive and hung in 5 to 10 second bursts and burned about 1.2 cores. No process was killed.
- Wrote the pure simulation module and its node check (outside Lens Studio): `node devpost/tests/sim.check.mjs` passes.
- 00:18 Lens Studio EarthProof became responsive and indexed the new script. The session's `lens-studio` MCP server stayed `failed` ("connection timed out after 30000ms"); the connector re-dial tool refuses project servers and touching `.mcp.json` does not reload it. No scene work was possible through the MCP, so none was done. No raw HTTP was used.
