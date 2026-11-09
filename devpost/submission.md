# BUILD ALIVE: Devpost submission (paste-ready)

Every field below maps to one Devpost box. Lines tagged `[VERIFY]` still need a real Preview receipt before submission; remove the tag only when the receipt exists, or delete the claim.

---

## Project name
BUILD ALIVE

## Tagline (Devpost limit 200 chars)
Watch your AI coding agent build your real project as a living voxel valley on Snap Spectacles, understand each step in plain words, and approve the fix.

## Video URL
`<YOUTUBE_URL>` (see devpost/YOUTUBE.md)

## Repository URL
`<GITHUB_URL>` (public repo with the full Lens Studio project)

---

## Inspiration
Coding agents now edit many files, run tests and spawn helpers faster than a person can follow. The result is a scrolling terminal that beginners cannot read and experts skim. We wanted a place where you can see what the agent touched, why a check failed, and decide whether to let it fix it, without reading a log.

## What it does
- **Your real repos become islands.** BUILD ALIVE scans folders you approve (this build: EarthProof and mnemosyne). Each repo floats above a valley as an island with one tiny house per real module group.
- **Pinch an island and its village appears.** Every module stands on the plateau as a building whose shape says what it is: a code workshop with a smoking chimney, a watchtower for checks, a barn for files and pictures, a windmill for connections in and out, a granary for stored data, a cottage for screens. Paths appear only between modules where a real import was found.
- **Agents become little workers.** When the agent touches a module, a voxel worker walks to that building's door, carrying a crate when files change. A helper agent appears only when a real helper event exists.
- **Plain words first, exact evidence on request.** Hover a building to see its name. Pinch it for one small card in plain language. Press Details for the exact folder, files, imports and event ID.
- **Failures are visible and honest.** A failing check raises a warning lantern over the watchtower, and the card shows the likely cause clearly marked as a guess, not proof.
- **Explain, then approve.** Explain turns the failure into a short lesson. Approve runs only the allowlisted, read-only check, and every approval or denial leaves a receipt.
- **Call your mentor.** Ask a question out loud; the bridge transcribes it, answers in two plain sentences using only the recorded events (it says when it cannot see something, and never claims to read the agent's thoughts), and speaks the answer. This runs bridge-side, measured at n=5, total p50 1.31 s, p95 1.58 s.
- **Live or replay, always labelled.** The caption under the controls says LIVE only for real agent events; otherwise REPLAY or Sample world.

## How we built it
- **Lens Studio 5.23.2 + TypeScript** for Snap Spectacles, with the Spectacles Interaction Kit (pinch, hover) and Spectacles UIKit (dock buttons, one glass card).
- **An original voxel art pipeline.** The whole valley (terrain, river, waterfall, mountains, trees, six building types, islands, clouds, workers) is generated in code as palette-textured voxel meshes with Lens Studio's MeshBuilder: a few draw calls, deterministic, no third-party art.
- **CLAD + the Lens Studio MCP** to build, inspect and drive the scene from an agent, and **LEAF** for scenario tests run inside the Lens Studio Preview.
- **A zero-dependency Node bridge** (`bridge/`): scans approved repos into real module maps, receives Claude Code hook events over an authenticated loopback endpoint, redacts secrets and home paths, journals every event, and streams them to the Lens over a local WebSocket.
- **Mentor voice:** Groq Whisper (speech to text) and gpt-oss-20b (answer), grounded only on journal events; the offline Windows voice speaks the answer.

## Challenges we ran into
- **Black is invisible on Spectacles.** Additive displays show dark as transparent, so the first design (dark panels, a big desk slab) looked like a ghostly box. We rebuilt the world from bright, sunlit fills with text only on demand.
- **A button was stealing pinches.** In Preview, pinching a building failed with "Blocked by Collider": a control button sat on the sight line. All controls moved to a small dock below the world. [VERIFY: pinch on island + building in Preview after the fix]
- **Honesty under pressure.** Hook events tell us which tool ran, not always which file. The mentor says "I can't see that in the events" instead of guessing.
- **Security.** An audit found that the local WebSocket accepted pages from other localhost ports and that one message type approved itself. We added Host and exact-origin checks, required the shared secret on every event endpoint, and limited the one-step approval to the read-only check.

## Accomplishments that we're proud of
- Real repositories, not a mock city: module buildings, counts and paths come from an actual scan.
- Real live agent events: this project's own Claude Code session streamed LIVE_VERIFIED tool events into the bridge journal (`devpost/receipts/g2-live/journal.jsonl`). [VERIFY: event visibly reaching a building in Preview]
- Test receipts: Node engine sweep 2,224 assertions with 0 failures; core checks 62/62 plus 2,400 generated cases; bridge security tests 16/16 and 7/7. [VERIFY: LEAF L01-L24 + c1-c7 executed in Preview for this build]

## What we learned
Showing less text made the product more truthful, not less: when the world carries the story, the words that remain can be exact. And on an additive display, light is the only ink.

## What's next for BUILD ALIVE
- Test on physical Spectacles hardware (not tested yet; see disclosure).
- File-level events from more agent tools (OpenCode, Codex) through their documented event APIs.
- A shared valley for two people pairing on the same project.

## Built with
lens-studio, snap-spectacles, spectacles-interaction-kit, spectacles-uikit, typescript, leaf, clad, mcp, node.js, websocket, groq, whisper, claude-code, hyperframes, ffmpeg

---

## AI disclosure
This project was built with AI coding assistants (Claude Code, and earlier Google Antigravity) under the entrant's direction. The assistants wrote and refactored code, tests, documentation and the film tooling, and drove Lens Studio through its official MCP server. Every reported result comes from a command or Preview run whose output is saved in `devpost/receipts/` or `devpost/evidence/`. The in-Lens mentor uses Groq-hosted models at runtime and is grounded only on recorded events.

## Hardware note
Tested in the Lens Studio 5.23.2 Preview (SPECS 27 device simulation) only. Not yet tested on physical Spectacles. The local bridge address 127.0.0.1 refers to the PC; on glasses the bridge would need a secured network path, which is not built yet.

## Third-party assets
No third-party 3D art, textures, music or sounds. Voxel art, palette and score are original and generated in this repo. Libraries: Snap's Spectacles Interaction Kit, Spectacles UIKit and LEAF packages.
