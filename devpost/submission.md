# BUILD ALIVE: Devpost submission (paste-ready)

Every field below maps to one Devpost box. Lines tagged `[VERIFY]` need a real Preview receipt before submission; remove the tag only when the receipt exists, or delete the claim.

---

## Project name
BUILD ALIVE

## Tagline (Devpost limit 200 chars)
Learn AI engineering by doing: watch your coding agent work on your real repo in floating Spectacles windows, every step and command explained in plain words, and you approve what runs.

## Video URL
`<YOUTUBE_URL>`

## Repository URL
`<GITHUB_URL>` (public repo with the full Lens Studio project, `EarthProof.esproj`)

---

## Inspiration
Millions of people now "vibe code": they ask an AI agent for a feature and watch a terminal scroll past. The agent reads files, runs commands, fails a test, spawns a helper, and the person learns nothing, because nothing on screen is written for them. We wanted the opposite: a place where you see what your agent is doing to your real project, understand every step well enough to explain it to a five-year-old, and get a little better at prompting and debugging each time. Learning by doing first; reading and videos optional.

## What it does
**One moment, start to finish.** Ada asks her agent "make the lobby better". In BUILD ALIVE she watches it happen beside her laptop: *Opened lobby.ts like a recipe book*, *Rewrote part of lobby.ts* (x2), *A helper joined to do one small job*, then a coral tile: *The checks ran and one failed, so something is broken.* The Learn window lights **Tests** and tells her why that matters and what to try: *"Ask the AI: show me the failing line and the test output before you change anything."* The Prompt Coach notices her prompt had no file and no way to check it, so her next prompt becomes *"Fix the room capacity bug in server/lobby.ts so the capacity test passes."* She approves only the read-only test run, and the receipt is saved. She didn't read a log, and she still learned how an engineer debugs.

- **Your agent session, as a floating window.** A Session window shows each agent step as one tile with one plain sentence ("Rewrote part of lobby.ts", "The checks ran and one failed, so something is broken"). Repeated steps collapse into one tile with an x2 badge.
- **Every command explained.** Shell commands become plain words ("git status" -> "Checks which files changed"). Unknown commands are labelled unknown, never guessed. The exact command and output stay one tap deeper.
- **Learn while you build.** A Learn window walks the agent loop (Prompt, Plan, Tools, Files, Tests, Result, Loop) and lights up the stage the current step belongs to. Each step carries *what happened*, *why it matters* and *what to try next*.
- **Prompt Coach.** It checks your prompt for three things (a goal, a file, a way to check it worked) and gives one concrete tip. Rule-based and labelled as a tip, not AI reasoning.
- **Your real project, not a mock.** A Project window shows the real module folders of a repo you approved (this build: EarthProof and mnemosyne, scanned by the local bridge), each tile with a type icon.
- **One window per agent, honest status.** A chip row shows each supported agent with its real status: LIVE, REPLAY, OFFLINE or UNSUPPORTED. Nothing is ever shown as LIVE unless a real event arrived. [VERIFY: v64-agents shot]
- **You stay in charge.** Explain, Approve and Deny live on one small icon dock. Approve only runs an allowlisted read-only check, and every decision leaves a receipt.
- **Hands-first.** Pinch tiles and chips, minimise a window into its tab with the round X and pinch the tab to bring it back.

## How we built it
- **Lens Studio 5.23.2 + TypeScript** for Snap Spectacles, with the Spectacles Interaction Kit (pinch, hover) and Spectacles UIKit. Planned with the Learn skill pack's `plan-lens`, built and inspected through **CLAD + the Lens Studio MCP**, and tested with **LEAF** scenarios run inside the Lens Studio Preview.
- **Spatial UI designed for an additive display.** Pure black is invisible on Spectacles, so windows use dark graphite tiles with white type and one accent strip per app, and we checked contrast in Preview.
- **A deterministic plain-language layer** (`BuildAliveExplain.ts`): command explainer, step explainer and Prompt Coach are pure functions with their own Node checks.
- **A zero-dependency Node bridge** (`bridge/`): scans approved repos into module maps, receives Claude Code hook events on an authenticated loopback endpoint (token, 64 KB cap, root scoping), redacts secrets and home paths, journals every event and streams it to the Lens over a local WebSocket.

## Challenges we ran into
- **Black is transparent.** Our first dark panels vanished on the additive display. We rebuilt three times (voxel world, holograms, glass windows) before landing on graphite tiles that read.
- **Honesty under pressure.** Hook events say which tool ran, not always which file, and they never show the model's private reasoning. BUILD ALIVE says "unknown" instead of guessing and never claims to read the agent's thoughts.
- **Timing-sensitive tests.** Pinch-vs-tap gestures are classified by release time; when the machine was starved of memory the Preview dropped to 3 fps and our gesture tests failed for the wrong reason. We re-ran them at normal frame rate before trusting any result.
- **Security.** An audit found the local WebSocket accepted other localhost origins and that one message type approved itself. We added Host and exact-origin checks, a shared secret on every event endpoint, and limited one-step approval to the read-only check.

## Accomplishments that we're proud of
- Real repositories and real agent events, always labelled LIVE / REPLAY.
- Test receipts: core checks 62/62 plus 2,400 generated cases; engine sweep 2,224 assertions with 0 failures; explainer checks 11/11; bridge security tests 16/16 and 7/7. [VERIFY: final LEAF sweep receipts for this build in `devpost/receipts/`]

## What we learned
Showing less text made the product more truthful. When each step is one honest sentence with the evidence one tap away, beginners follow along and experts still trust it.

## What's next for BUILD ALIVE
- Test on physical Spectacles (not tested yet; see the hardware note).
- Live events from more agents (Codex, OpenCode) through their documented event APIs.
- Voice: ask "what just happened?" and hear the answer.
- A port to other glasses platforms later.

## Built with
lens-studio, snap-spectacles, spectacles-interaction-kit, spectacles-uikit, typescript, leaf, clad, mcp, node.js, websocket, claude-code, ffmpeg

---

## AI disclosure
Built with AI coding assistants (Claude Code, and earlier Google Antigravity) under the entrant's direction. The assistants wrote and refactored code, tests, documentation and film tooling, and drove Lens Studio through its official MCP server. Every reported result comes from a command or Preview run whose output is saved in `devpost/receipts/` or `devpost/evidence/`.

## Hardware note
Tested in the Lens Studio 5.23.2 Preview (Spectacles device simulation) only, not yet on physical Spectacles. The bridge address 127.0.0.1 refers to the PC; on glasses the bridge would need a secured network path, which is not built yet.

## Third-party assets
No third-party 3D art, music or sounds. App names are used descriptively only. The film shows original monogram badges, not third-party logos. The repo includes optional Simple Icons marks (CC0; trademarks belong to their owners), credited in `THIRD_PARTY_NOTICES.md`. Libraries: Snap's Spectacles Interaction Kit, Spectacles UIKit and LEAF packages.
