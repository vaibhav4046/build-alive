# EarthProof progress

**STATE (2026-11-08 ~02:20 UTC):** Rover core is GREEN and tagged `core-rover-v1` (commit ad6962f); results in `devpost/test-results.md` (LEAF c1,c2,c3-pinch,c3-far,c4,c5,c6,c6-ik,c7 pass; latency p50/p95/p99 = 1.0/1.0/2.0 ms script-side; drag-to-mount verified by preview agent, not LEAF). Direction change from the user (via the parent session): build **EarthProof Home Check** (wheelchair door fit + ramp push) per `PIVOT_DECISIONS.md` (criteria 1-9, model, time guard) and `winners-analysis.md`. **Next, in order:** (1) run the `plan-lens` skill if it exists (answer ONLY from the interview section of PIVOT_DECISIONS.md; copy old brief to `design-brief-rover-v1.md` first; note in README that answers were supplied by Claude on the entrant's delegation); (2) build door station then ramp station (new pure model + node sweep >= 1000 cases; SIK drag handles; keep `EarthProofSim` as rover fallback); (3) LEAF scenarios + latency loop for the new criteria; (4) if criteria 1-6 not green by Mon 06:00 UTC revert pitch to the rover core; (5) docs, judge passes, wordless pixel-art film with real preview footage, repo publish (gh is logged in as vaibhav4046; `git grep` for secrets first). **Rules:** no desktop automation while the user is using the PC (an earlier synthetic drag/Esc landed in their browser and Claude app); Lens Studio MCP tools work again after the 01:48 restart; no attribution lines in commits; never --no-verify; cite every claim in research.md.

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



