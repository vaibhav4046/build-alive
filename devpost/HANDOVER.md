# EarthProof build handover (build session, 2026-11-08 00:20)

## State
- Repo D:\earthproof\lens\EarthProof, branch master, last commit 9fbc41c "feat: add pure Ramp Climb simulation module with node check and progress docs".
- Done and verified: `Assets/Scripts/EarthProofSim.ts` (pure sim) + `devpost/tests/sim.check.mjs`. Real output of `node --no-warnings devpost/tests/sim.check.mjs`:
  `sim.check: all assertions passed`, small: stall, need 7.9, has 4.0, speed 47.1; geared: pass, margin 2.1x, speed 9.4.
- Untracked, commit next: `Assets/Scripts/EarthProofSim.ts.meta` (Lens Studio created it, so LS indexed the file).
- Lens Studio 17708 ("EarthProof - Lens Studio v5.23.2", title shows `EarthProof*`) is now Responding=True. It was hung about 00:10 to 00:18 while a second instance (circuit-coach) loaded; no process was killed. Port 50040 LISTENING.

## BLOCKER (needs one action)
This session's `lens-studio` MCP server is stuck in status `failed`: `MCP server "lens-studio" connection timed out after 30000ms`. It timed out at session start while LS was hung. Nothing in the session can re-dial it:
- `reconnect_session_connector` refuses: "lens-studio is not a connector, so it is not reconnected here. Ask the user to type /mcp in this session to open its MCP servers, and reconnect it there."
- touching `.mcp.json` does not hot reload (tried, ToolSearch still empty).
Fix, either one:
1. In the build session, open /mcp and press Reconnect on `lens-studio` (LS is responsive now), then tell the build session to continue; or
2. Start a fresh session with cwd D:\earthproof\lens\EarthProof (LS must be responsive at that moment, so do it now), brief = the original task + this note.
Do not use curl or raw HTTP against the MCP server.

## Environment gotchas found
- GateGuard hook: the first Write of each new file and the first Bash command are denied until the reply states callers, duplicates check, data files, and the user's instruction verbatim; then retry. PowerShell tool works without that gate. `ECC_GATEGUARD=off` disables it.
- Commit hook: no Claude/Anthropic attribution lines. Never --no-verify. `.claude/`, `CLAUDE.md`, `.agents/` are excluded locally via .git/info/exclude (so CLAUDE.md edits cannot be committed).
- Lens Studio regenerated `.gitignore` (Cache, Support, Workspaces, spk_debug_key.pem, *.lock) and `.gitattributes`; both committed in 9fbc41c.
- Second Lens Studio instance 23604 (circuit-coach, throwaway) is open and loads the machine; closing it would free CPU but it has unsaved changes, so it was left alone.
- Scene.scene is template content only; Packages has SpectaclesInteractionKit.lspkg and SpectaclesUIKit.lspkg; no Leaf.lspkg yet (install via the specs-leaf-install-packages skill).

## Build plan (decisions already made, so the next session can go straight to MCP work)
Skills already read: lens-studio-router, specs-leaf-write-scenarios (+ leaf-reference), specs-interaction-recipes, scene-construction, specs-build-ui, lens-studio-field-notes, specs-experience-builder agent (first 408 lines). Preflight: ToolSearch select ListAllPanels + ExecuteEditorCode, sign-in gate (`Editor.IAuthorization.isAuthorized`) per the router skill, then `/specs-project-init`.
Tier: interactive. Mesh stand-ins: built-in primitives (boxes, cylinders), declared as primitive placeholders; no Blender or FAST3D needed.

World frame (cm, eye at origin, looks -Z). Seated user: a 75 cm table with a seated eye height of about 115 cm puts the table top about 40 cm below the eyes. Note this in the design review as the reading of the brief's "75 cm above the floor".
- Table centre (0, -30, -75), 100 x 3 x 60, top y=-30, front edge z=-45. Label "Simulated in preview" on the table edge.
- Course plane z=-80. Ramp polyline: shallow 10 deg x 20 cm, steep 25 deg x 30 cm (horizontal extent 46.9 cm, rise 16.15 cm), plus a 6 cm flat landing at the top for the proof card. Aim for rover rear to ramp top spanning about -33..+33 cm (63 cm usable width at 90 cm). Use `roverPose(sFront)` from EarthProofSim for rover position and pitch (front wheel contact starts at s=-2, stall at s=20, pass ends at s=50).
- Rover 18 x 12 x 8 cm body, 4 wheels radius 3 (cylinders, axle along z, a spoke mark so spin is visible), motor mount marked on top with a label showing the installed motor ("Small" / "Geared").
- Parts tray front-left: MotorBlock_Small x=-44, MotorBlock_Geared x=-30 (6 cm blocks, light labels), z=-62.
- Controls on the front edge z=-48: RunButton x=-10, ResetButton x=+10 (8 x 5 cm UIKit Buttons, 20 cm apart). All controls (Run, Reset, both blocks) at least 12 cm centre to centre, inside the view, none head-locked.
- Evidence card pinned beside the stall point (junction at ramp distance 20), not centred. Red beam (thin box) from the stall-point marker to the motor on the rover; red only for evidence. Proof card at the top of the ramp, facing the user.
- Additive display: bright cyan/amber/white, no dark UI.

Authored hierarchy (names LEAF looks up): EarthProof (script EarthProofMain) > Course > Table, TableLabel, Ramp (RampShallow, RampSteep, RampTop, StallMarker), Rover (RoverBody, Wheel_FL/FR/RL/RR, MotorMount), PartsTray (MotorBlock_Small, MotorBlock_Geared), EvidenceBeam; UI modules via /specs-build-ui: EarthProofControlsUI (RunButton, ResetButton), EarthProofCardsUI (EvidenceCard, ProofCard, mount label, table label).

State machine (EarthProofMain): IDLE (rover at base) -> RUN (sF advances at flatSpeedCmS) -> STALLED (sF stops at stallPositionCm, wheels keep spinning; evidence card + beam 0.4 s later, inside the 1 s criterion) or PASSED (sF=50, proof card, chime). Run in STALLED or PASSED snaps the rover to base and runs. Reset and motor swap snap the rover to base instantly and hide evidence/proof. Swap: SIK Interactable + InteractableManipulation on the blocks; on release within SNAP_RADIUS_CM (6) of the mount the block mounts and the other returns to its tray slot; a tap (moved < 2 cm) also mounts. Everything pre-created; no instantiate during a run; no network.

Latency (criterion 7): stamp `Date.now()` at press handler entry (button press event, block tap or drop), stamp again in the first LateUpdateEvent after the response was applied (last script hook before render). Log both into an array on EarthProofMain. LEAF scenario: 50 cycles of Run, Reset, Swap Geared, Swap Small = 200 presses; report p50/p95/p99 via `percentile()` from EarthProofSim, name the machine (Win 11 Home, `$env:COMPUTERNAME`, CPU from `Get-CimInstance Win32_Processor`), and state that this excludes GPU present and display latency.

LEAF scenarios (one per done criterion, relative assertions, object names only after scene-graphql confirms them): c1 layout + label; c2 run Small -> stall, evidence text "needs 7.9 N.cm" and "has 4.0 N.cm" within 1 s, beam end near MotorMount; c3 swap Geared -> mount label "Geared", evidence hidden; c4 rerun passes, proof card shows 2.1x; c5 reset; c6 control separation and size from world positions, plus an IK scenario (createIKInteractor) on Run as the reachability check; c7 latency loop.

## Order of work
1 MCP up -> preflight -> project-init. 2 VirtualScene Phase A (structure) -> recompile -> Phase B (wiring). 3 screenshot + logs, commit. 4 flow works, commit. 5 install Leaf.lspkg, write and run scenarios, paste real output into devpost/test-results.md, commit. 6 polish (chime via /build-sfx if it works, beam pulse, attempt history only if core green). 7 README and review; update PROGRESS.md and build-log.md after each commit.
