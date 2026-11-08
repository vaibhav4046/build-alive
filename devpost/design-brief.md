---
status: approved
approval: Entrant delegated all interview decisions to Antigravity on 2026-11-08 ("execute all... complete all make this winner for sure") under the authoritative specification OMNIRUSH_BUILD_ALIVE_ULTIMATE_SPECS_MASTER_PROMPT_2026-11-08.md. Prior EarthProof Ramp Climb brief is preserved at devpost/design-brief-rover-v1.md and tagged in Git as core-rover-v1.
---

# Design brief: BUILD ALIVE — Spatial AI Engineering Observatory

Tagline: Step inside what your coding agents build.

## The one spatial moment
You sit at your desk while an AI coding agent edits a multiplayer game codebase (`LobbySync`). Above your desk, at comfortable arm's length, floats a compact crystalline **Architecture City** with six color-coded districts (UI, Logic, API, Data, Tests, Assets) connected by illuminated dependency bridges. An agent vessel lands on `server/lobby.ts` (`PostToolUse`), sending an amber pulse across the parser-known bridge to `shared/state.ts`, and `tests/room-capacity.test.ts` fractures coral-red (`test-room-03` failed: room allows 5th player when max is 4). You pinch the red fault marker to open a concise evidence card (`server/lobby.ts` → removed `players.length >= maxPlayers` guard → `AssertionError: expected 4, got 5`), pinch the **Learning Atelier** path to predict which downstream module broke, pinch the **Rewind Crystal** to compare before/after diffs, and pinch **Approve Safe Retry** on the **Approval Dock** after the guard is restored—watching the bridge heal teal-green with a signed audit receipt.

## Why it belongs on glasses
- Uses: **draws in the world** (projects sit as miniature islands on a desk shelf; dependency propagation and fault bridges occupy 3D space at real centimeter scale) and **leaves your body free** (hands pinch and isolate 3D branches directly without alt-tabbing across terminal logs, diffs, and test runners).
- Why it's better than the phone or laptop version: terminal streams and flat 2D agent logs bury causality in hundreds of scrolling lines. In spatial 3D on your desk, module topology stays anchored in peripheral-friendly desk space while event pulses travel along actual dependency edges from edited file to failing test.

## Product or overlay
- Type: **product** — a desk-scale spatial software observatory, interactive architecture workbench, and evidence-linked learning environment.
- What the real version would sense: your desk surface and live local WebSocket event stream from local coding-agent hooks (`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `SubagentStart`, `SubagentStop`).
- Stand-in for the preview:
  - A virtual desk shelf (`100 × 60 cm`, top at `y = -30 cm`, labelled `"SIMULATED IN PREVIEW"`).
  - Deterministic **LOCAL RECORDED REPLAY** of an authentic, sanitized coding-agent session on the included `demo-repo/` (`LobbySync` multiplayer game) so every interaction works 100% offline in Lens Studio Preview, paired with a real local Node.js capture + redaction + WebSocket bridge (`bridge/`) for live local verification.
  - Preserved **EarthProof Rover** island (`Island_EarthProof`) allowing instant switching to the physical Ramp Climb simulation fallback inside the same `.esproj`.

## Where things live
- Where the user is looking during the main task: seated at a desk (eye height ~115 cm, origin `(0, 0, 0)` looking toward `-Z`), gazing slightly downward (~15°–20°) at the desk center `z = -65` to `-85 cm`, well inside the SPECS ~36.6° vertical preview field of view.
- **Virtual Desk Shelf (`DeskShelf`):** `100 × 3 × 60 cm` centered at `(0, -30, -75)`, top surface at `y = -28.5 cm`, front edge at `z = -45 cm`. Labelled `"SIMULATED IN PREVIEW • RECORDED SESSION REPLAY"`.
- **Project Archipelago (`ProjectHub`):** left-front shelf zone (`x = -34 to -10 cm, y = -24 cm, z = -58 cm`) with three selectable project islands (`>= 6 cm` diameter, `>= 12 cm` center-to-center):
  1. `Island_LobbySync` (`x = -34, y = -24, z = -58`, 6 cm): multiplayer game repo (primary story).
  2. `Island_EdgeGuard` (`x = -22, y = -24, z = -58`, 6 cm): API rate-limiter repo.
  3. `Island_EarthProof` (`x = -10, y = -24, z = -58`, 6 cm): preserved rover physics simulation.
- **Architecture City (`ArchitectureCity`):** central desk zone (`x = -18 to +18 cm, y = -22 to -12 cm, z = -72 cm`), spanning `36 cm` horizontally (comfortably within the `~50 cm` usable horizontal FOV at `z = -72 cm`):
  - `Module_Client` (UI, `x = -16, y = -18, z = -68`, `5.5 × 5.5 × 5.5 cm`)
  - `Module_Lobby` (Logic, `x = -4, y = -16, z = -70`, `6.0 × 6.0 × 6.0 cm`)
  - `Module_WSServer` (API, `x = +8, y = -18, z = -68`, `5.5 × 5.5 × 5.5 cm`)
  - `Module_SharedState` (Logic/Data, `x = -4, y = -22, z = -78`, `5.5 × 5.5 × 5.5 cm`)
  - `Module_DBMock` (Data, `x = +10, y = -22, z = -78`, `5.0 × 5.0 × 5.0 cm`)
  - `Module_TestSuite` (Tests, `x = +18, y = -15, z = -66`, `6.0 × 6.0 × 6.0 cm`)
  - Illuminated dependency bridges (`Bridge_Client_Lobby`, `Bridge_Lobby_State`, `Bridge_Lobby_WS`, `Bridge_State_DB`, `Bridge_Lobby_Tests`) connecting parser-verified module pairs.
- **Execution Theater & Rewind Crystal:** above the city (`y = -9 cm, z = -70 cm`), showing active agent vessels (`AgentVessel_Primary`, `AgentVessel_Sub01`) and `RewindCrystal` (`x = -18, y = -10, z = -64`, `5.5 cm`).
- **Front Control Rail (`Controls`):** front desk edge at `z = -48 cm, y = -25 cm`, all buttons `>= 6 × 5 cm` and `>= 12 cm` center-to-center apart, never head-locked:
  - `StepButton` (`x = -24, y = -25, z = -48`): step/scrub replay timeline (`IDLE → EDIT → FAIL → PREDICT → DIFF → APPROVE → PASS`).
  - `InspectButton` (`x = -12, y = -25, z = -48`): toggle Diff / Evidence / Explain / Provenance cards.
  - `LearnButton` (`x = 0, y = -25, z = -48`): trigger Learning Atelier prediction & verification.
  - `ApproveButton` (`x = +12, y = -25, z = -48`): approve allowlisted safe test retry (`run_known_test`) with audit receipt.
  - `ResetButton` (`x = +24, y = -25, z = -48`): deterministic reset to clean start state (`seq = 0`).
- **Evidence / Diff / Learning / Provenance Cards (`Cards`):** right-side collapsible billboarded UIKit `BackPlate` + `FlexLayout` panels at `(16, -10, -68)`, `26 cm` wide, below eye level, high-contrast additive typography (`Title1`/`Headline1`/`Body`/`Caption`).

## Hands and input
- **Select project island:** pinch `Island_LobbySync`, `Island_EdgeGuard`, or `Island_EarthProof` (or press `StepButton` to advance).
- **Select / isolate module or fault:** pinch any module node (`Module_Lobby`, `Module_TestSuite`, etc.) or the coral-red `FaultMarker_Room03` to highlight its known dependency bridges, de-emphasize unrelated branches, and open its file/diff/test evidence card.
- **Timeline scrub & rewind:** pinch `StepButton` or `RewindCrystal` to step forward/backward, pause, resume, or compare before/after file snapshots.
- **Learning Atelier prediction:** in Learning mode (`LearnButton`), physically pinch the module you predict caused or suffered the fault; receive immediate trace-grounded feedback and update local mastery counters.
- **Human-supervised approval:** pinch `ApproveButton` on the Approval Dock to authorize the allowlisted `run_known_test` action (or deny/cancel), generating a verifiable receipt and repairing the fractured test bridge on pass.
- **Voice:** optional state machine only; 100% of interactions are hand-pinch first and mouse-clickable in Interactive Preview.

## When things show
- **Architecture City & Front Control Rail:** visible on start at desk scale, with calm low-motion idle state.
- **Fault fracture & Evidence Card:** appear only when a failure event (`seq = 3`, `PostToolUseFailure` on `test-room-03`) is reached or selected; cleared when repaired (`seq = 6`, `passed`) or reset.
- **Diff & Explain Cards:** progressive disclosure—shown only when the user pinches a changed module, `InspectButton`, or `RewindCrystal`, then tucked away to keep the central view unobstructed.
- **Out of view / audio cues:** original procedural sine/glass chimes (`ambient.wav` / synthesized cues) signal state transitions; visual badges use both color AND shape/text prefix (`[PASS]`, `[WARN]`, `[FAIL]`, `[AGENT]`, `[SIM]`) so color is never the sole channel.

## Done criteria
Each criterion is verifiable in Lens Studio's preview and covered by automated LEAF scenarios (`L01`–`L22`) plus deterministic Node checks:
1. **Start & desk placement (`L01`, `L02`):** Virtual desk, Project Archipelago, Architecture City, Provenance Banner (`"SIMULATED IN PREVIEW • LOCAL RECORDED REPLAY"`), and Front Control Rail render in view at real centimeter scale (`>= 5 cm` targets, `>= 12 cm` spacing).
2. **Project Hub navigation (`L03`, `L04`, `L05`):** Selecting between project islands (`LobbySync`, `EdgeGuard`, `EarthProof`) transitions the architecture graph cleanly and returns to the hub while preserving session state.
3. **Architecture & dependency inspection (`L06`, `L07`, `L08`):** Pinching `Module_Lobby` highlights its parser-known downstream bridges (`Module_SharedState`, `Module_TestSuite`), de-emphasizes unlinked modules, and reveals real file evidence (`server/lobby.ts`).
4. **Timeline & recorded agent replay (`L09`, `L10`, `L11`):** Stepping/scrubbing the timeline advances through authentic recorded agent events (`PreToolUse` → `PostToolUse` on `server/lobby.ts`), updating the active agent vessel and module state deterministically.
5. **Failure Forge & before/after diff (`L12`, `L13`, `L14`, `L15`):** Advancing to the failed test event (`test-room-03`) illuminates the coral-red fault marker and fracture bridge; pinching it displays the redacted test output, before/after diff (`maxPlayers = 4` guard), and deterministic template explanation.
6. **Learning Atelier & Approval Dock repair (`L16`, `L17`, `L18`):** Selecting the predicted broken path in Learning mode gives instant trace-grounded feedback; approving the allowlisted retry transitions the test bridge to teal `PASSED` with an audit receipt; `Reset` restores the exact initial state deterministically.
7. **Comfort, accessibility, reachability & latency (`L19`, `L20`, `L21`, `L22`):** Offline/replay provenance status is explicit; reduced-motion/high-contrast theme toggles work; all controls pass `>= 5 cm` size, `>= 12 cm` spacing, and SIK IK-arm reachability; 200 scripted interactions log `p50`, `p95`, and `p99` frame latency (`p99 < 100 ms` in Preview).

## Out of scope
- Universal unauthorized scraping of consumer ChatGPT/Claude/Grok web sessions.
- Displaying hidden LLM chain-of-thought (only observable tool calls, diffs, and test outputs are shown).
- Arbitrary shell execution from glasses (only strictly allowlisted read/test actions with explicit user approval).
- Unverified hardware comfort or motion-to-photon claims on physical SPECS glasses (all metrics are explicitly labelled as Lens Studio Preview measurements on host `VAIBHAV`).

## Risks and open questions
- Feel on physical SPECS glasses (comfort over long coding sessions, optical additive contrast in bright rooms, real hand-tracking jitter) is **unproven** (`feel unproven`); logic, layout geometry, and event determinism are **proven in Preview and Node** (`logic proven`).
- Dense codebases with hundreds of files would clutter a narrow ~37° FOV if shown flat; mitigated by clustering every project into 6 bounded architectural districts (`<= 18` pooled meshes active at once).
- Cross-session persistence in Preview depends on Lens Studio's `persistentStorageSystem`; tested with a deterministic in-memory fallback and schema-version migration check.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
