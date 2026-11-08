# EarthProof Ramp Climb: progress

**Next action:** confirm the `lens-studio` MCP tools load (ToolSearch "lens-studio" must return `mcp__lens-studio__*`), then build the scene (phase 3). Lens Studio 17708 is responsive and owns port 50040. Root cause of the latest miss: the retry session started with cwd `D:\`, so the project-scoped `.mcp.json` in this folder was never read (the server was not even listed as failed). The session was moved to this folder with the directory tool; the new cwd takes effect on the next turn. A session must start with cwd = `D:\earthproof\lens\EarthProof`.

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
