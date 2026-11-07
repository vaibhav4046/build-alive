# EarthProof Room Trials: master brief (source of truth)

Competition: Devpost "Learn AR with SPECS". Deadline Mon 9 Nov 2026, 22:00 GMT. Target: submit-ready well before.
Note: the pasted master prompt text was the "Circuit Coach" template. The user confirmed the project is EarthProof Room Trials. Ignore the Circuit Coach concept. The generic rules (sections A-C below) still apply.

## A. Rules that must never be broken (disqualification risk)
- New project only. Every file is created now. Commit early and often so git history proves it.
- Plan with the plan-lens skill. Its output (devpost/design-brief.md etc.) lives in the repo's devpost/ folder.
- Build the Lens THROUGH CLAD (ls-clad plugin) and the Lens Studio MCP. Do not hand-write the Lens outside Lens Studio. Use SIK (Spectacles Interaction Kit) and the SPECS UI Kit, not custom input hacks.
- Must run in the Lens Studio preview. Reviewers will NOT run it; the video must show it working.
- Video: under 3:00, public on YouTube (user uploads). AI-generated or rendered "real life" footage must be labelled "Concept" and be under 15 s. Every feature claim backed by real preview footage. Never fake the Lens working.
- Never invent statistics, quotes or testimonials. Cite sources in devpost/research.md or drop the fact.
- Do not claim: first place, live AI, live camera recognition, physical-glasses validation, or real-room collision, unless evidence proves it.
- No API keys in the repo. `.mcp.json` holds a Lens Studio bearer token and is already gitignored: keep it that way. Scan with `git grep` before any push.
- Only stop for: a login, a payment, something that would delete the user's files.

## B. Memory and eyes
- Keep CLAUDE.md (project root, under 80 lines; Lens Studio generated an AGENTS.md that CLAUDE.md imports: append, do not delete the `@AGENTS.md` line) with goal, rules, concept, current phase.
- Keep devpost/PROGRESS.md: checklist of phases/sub-steps and "Next action" at top. Update after every commit. After compaction/restart read CLAUDE.md and PROGRESS.md first.
- After every visible change: compile, inspect preview, capture a screenshot (Lens Studio MCP screenshot tool first; else OS screenshot into devpost/shots/), read the Lens Studio logs via MCP, fix errors immediately.
- Screen scale gotcha on this machine: OS screenshots are 1536x864 but synthetic mouse coordinates need dividing by 1.25.

## C. EarthProof Room Trials: decisions already made
- A small rover is tested on a spatial course.
- Hero scenario: Ramp Climb. The small motor fails with insufficient torque. The geared motor succeeds.
- Failure evidence appears beside the ramp and points to the motor.
- The user swaps one part and reruns the trial.
- The successful run produces an EarthProof proof card.
- All controls use large pinch targets. Objects remain world-placed and below eye level.
- Preview-only course elements are labelled "Simulated in preview".
- Kodro is a conceptual inspiration only. Disclose it; do not copy.

## D. Execution order (the user's 12 steps)
1. Verify: .esproj in the current folder, Lens Studio open, MCP connected, CLAD available. If anything is missing, stop and report the exact missing item.
2. Run plan-lens with the decisions in section C (answer its interview yourself).
3. Build ONLY the hero flow first: start screen, rover and ramp, motor selection, Run Test, deterministic failure, evidence marker + numeric explanation, swap motor, successful rerun, proof card, reset.
4. After every visible change: compile, inspect preview, screenshot, read Lens Studio logs, fix errors, update devpost/PROGRESS.md and devpost/build-log.md.
5. Write and run LEAF tests (use the live-lens-tester agent / specs-leaf-* skills) for: starting placement, motor selection, ramp failure, evidence marker position, evidence beam targeting the motor, successful rerun, proof card, reset, field-of-view placement, pinch-target separation, camera movement stability. ALL must pass before adding anything else.
6. Add Build Ledger memory only after the hero flow is green: save last run, failure cause, evidence numbers, selected motor. Test restart and reset. If persistence fails in preview, remove the feature and document that decision.
7. Add Trials 1 and 3 only if hero flow + ledger are complete. Cut them if they threaten the deadline.
8. Add sound, glow, failure animation, evidence trails after tests pass. Bright, readable additive-display palette.
9. Final review against four judging criteria: complete product experience; technical quality and real CLAD/MCP/LEAF use; originality vs current SPECS submissions; clear end-to-end presentation. Use review subagents if available, else four self-passes. Save to devpost/review.md.
10. Run the full LEAF suite again from a clean state. Confirm no console errors. Never mark complete while a test, preview check or required file is missing.
11. Prepare: README.md, devpost/design-brief.md, research.md, competition.md, build-log.md, test-results.md, review.md, video-script.md, third-party notices, AI disclosure, Kodro conceptual-inspiration disclosure.
12. Short demo plan under 3 minutes using real preview footage: problem, rover setup, ramp failure, evidence explanation, motor swap, successful rerun, proof card, LEAF tests.

## E. Skills guidance
plan-lens (phase 2, mandatory) · ls-clad (all building, LEAF, debugging) · ponytail (reuse SIK/UI Kit/Asset Library before new code) · caveman (chat only, never for judge-facing files) · hallmark (audit every 2D surface: UI panels, thumbnail, title cards, README hero, Devpost text) · hyperframes (video, only if time) · superpowers verification-before-completion before calling a phase done, systematic-debugging after a CLAD loop fails twice. Load a skill only when its phase starts. Keep long logs in files and grep them.

## F. Time guard
Priority if short on time (cut from the bottom): 1) hero Ramp flow + LEAF green, 2) Build Ledger memory, 3) sound/glow polish, 4) Trials 1 and 3, 5) video. If the hero Ramp flow is not fully working and tested, cut every optional feature and prepare an honest demo of the working core.

## G. Final report format (only this)
Repository URL · Video path · Devpost files created · Passing test count · Remaining actions the user must personally do (YouTube upload, Devpost submit, anything needing their login).
