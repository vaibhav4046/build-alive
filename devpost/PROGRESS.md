# EarthProof Ramp Climb: progress

**Next action (2026-11-08 01:55):** Lens Studio was closed gracefully at 01:48 (both instances; not by this session) and was relaunched on EarthProof (pid 21296). Core flow already verified in the preview earlier: Run -> stall -> evidence card + beam -> swap -> Run -> proof card -> Reset (commit a10e400). Do next, in order: (1) `mcp__lens-studio__*` tools may need the user to reconnect via /mcp after the restart; if ListAllPanels fails, stop and say so. (2) `RecompileTypeScriptTool`; set TableLabel text to exactly `Simulated in preview` (VirtualScene modify on @sceneObject:TableLabel components.Text.text). (3) Add a `LeafIndex` scene object with `Assets/Scripts/Leaf/LeafIndex.ts` (scripts C1..C7 already written, not yet compiled or run). (4) `run_leaf_scenario` each id (c1-layout ... c7-latency), paste real output into `devpost/test-results.md`. (5) Judge passes -> `devpost/review.md`. (6) Reframe film vignettes B (stroller/hand truck) and C (porch ramp) per `FINAL_BRIEF.md` UPDATE block, record real preview footage, render. (7) Publish repo with gh after `git grep` for secrets. Phase 2 (load picker, slope handle) only if core is green and time allows; otherwise say it was cut. Do not click or send keys into other apps: the user works on this PC (an earlier synthetic drag landed in their browser and Claude app).

Scope: `design-brief.md` wins (no voice, no network, no cross-session memory, no Circuit Coach). Repo and honesty rules: `MASTER_BRIEF.md`.

## Phases
- [x] 0. Brief approved and committed (4cd1ebe)
- [x] 1. Pure simulation module `Assets/Scripts/EarthProofSim.ts` + node check `devpost/tests/sim.check.mjs` (passes)
- [ ] 2. Connect Lens Studio MCP (blocked on a hung Lens Studio; see build-log)
- [ ] 3. Scene: table, ramp (10 deg + 25 deg), rover, parts tray, controls, labelled "Simulated in preview"
- [ ] 4. Flow: Run, stall, evidence card and beam, swap motor, rerun, proof card, Reset
- [ ] 5. LEAF scenarios for done criteria 1 to 7, run in preview
- [ ] 6. Polish: chime on run end, beam pulse, optional in-session attempt history
- [ ] 7. Docs: test-results.md, README, review

## Done criteria status (brief section "Done criteria")
| # | Criterion | Built | LEAF test | Result |
|---|-----------|-------|-----------|--------|
| 1 | Start layout, labelled "Simulated in preview" | no | no | not run |
| 2 | Run with Small stalls, evidence card within 1 s, beam | no | no | not run |
| 3 | Geared snaps on, label changes, evidence clears | no | no | not run |
| 4 | Rerun passes, proof card with 2.1x | no | no | not run |
| 5 | Reset restores everything | no | no | not run |
| 6 | Controls in view, >= 12 cm apart, >= 5 cm across | no | no | not run |
| 7 | 200 presses, p50/p95/p99 latency | no | no | not run |

Simulation numbers (node check, real output): needs 7.9 N.cm on the steep section, Small has 4.0, Geared has 17.0, margin 2.1x, flat speeds 47.1 and 9.4 cm/s.


