# LEAF sweep on the v5 holographic mission-control build (Lens Studio 5.23.2 Preview, 2026-11-09 05:3x-05:5x GMT)

Raw lines are verbatim from the Lens Studio log `LensStudioLog-2026-11-09-04-40-27-235-639cb.txt` (final sweep from log line 11222; an earlier 33-scenario sweep from line 8330 passed 32/33) via
`devpost/tools/leaf-receipts.mjs`; `_summary.json` has each verdict. Launched with the lens-studio MCP `run_leaf_scenario`
(`onDevice:false`, Preview, device SPECS 27).

Final sweep (log line 11222 onward) includes two new scenarios written for this build: **L25 feedback-and-rewards** (release pop, one reward per
real action: opening a building's evidence or a correct predict-what-breaks answer, no farming, lanterns persisted in local storage) and
**L26 agent-orbs-and-flow-pipeline** (10 agent stations with honest badges, Prompt->Loop stage follows the replayed event).

**Result: 34 of 35 PASS. L01-L26 all PASS; c1, c2, c3 x2, c4, c5, c6-ik-reach, c7 PASS; `c6-controls` FAILS (same cause as in
`../leaf-v4-sweep/README.md`: legacy Rover fallback field-of-view, Preview camera at z 23 vs the z 14 the layout assumes). Not fixed.**

The art was replaced (voxel valley -> holographic platform, role-shaped wireframe buildings, glowing data arcs, drones, agent orbs,
Prompt->Loop flow pipeline, chip-style islands); every LEAF-referenced object name and position was kept, so no scenario had to change.
L17 / c7 MCP calls time out client-side (about 50 s); their PASS verdicts are from the log (`PASSED: L17-latency-benchmark`,
p50 2.0 / p95 3.0 / p99 5.0 ms over 200 presses; `PASSED: c7-latency`).

Honest limits: the Lens still runs in replay / real-scan mode. The bridge websocket throws
`URL is not secure (Experimental API must be enabled to access insecure URLs)` in Preview (the Experimental APIs toggle is a Project
Settings UI switch with no editor-API handle), so no live event reached the Lens in this sweep. The agent orbs show a bundled snapshot of the bridge's
`/providers` response (taken 05:30 GMT); only the Claude Code orb can ever read LIVE, and only while this Lens has a live bridge connection.
