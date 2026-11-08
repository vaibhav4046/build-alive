# Devpost Submission Package — BUILD ALIVE

*Copy-paste ready submission text for the Snap "Learn AR with SPECS" hackathon.*

---

## 1. Project Information

- **Project Name:** BUILD ALIVE — Walk inside what AI is building
- **Tagline (under 50 chars):** Walk inside what AI is building on your desk.
- **Target Platform:** Snap Spectacles (Lens Studio 5.23.2, Spectacles Interaction Kit 0.18, Spectacles UIKit, LEAF 2.0.2)

---

## 2. Devpost Story / Description

### Inspiration
Millions of developers now build software alongside autonomous AI coding agents (Claude Code, OpenAI Codex, Cursor). Yet when an agent edits code across six files and twenty tests, developers are trapped staring at rapid terminal text scroll or flat git diffs. When a test breaks, understanding *why* an agent made that change, *how* it broke an architectural contract three layers down, and *how* to safely approve a fix requires immense mental gymnastics.

Flat screens separate code from physical reality. We asked:
**What if your desk became an architectural observatory where you can literally walk inside what AI is building?**

What if agent swarms appeared as glowing vessels navigating physical districts, code fractures formed real 3D fault markers above failing tests, and you could physically rewind time to inspect diffs and safely approve repairs with a pinch?

### What BUILD ALIVE Does
BUILD ALIVE turns your desk into a physical spatial workbench for AI software engineering:
1. **The Project Archipelago:** Three desk-anchored project islands (`LobbySync`, `EdgeGuard`, and the preserved `EarthProof Rover` hardware climb trial). Pinching an island transitions you into that project's spatial architecture.
2. **Architecture City & Dependency Bridges:** Visualizes system modules as 3D architectural districts (UI, Logic, API, Data, Tests) connected by emissive dependency bridges that distinguish compiler-verified imports from unverified heuristic links.
3. **Execution Theater:** Watch autonomous agent vessels physically travel between modules during execution. When a subagent spawns to run verification tests, a violet subagent vessel appears alongside the primary planner.
4. **Spatial Fault Markers & Causal Trails:** When an agent edit in `server/lobby.ts` drops a room capacity guard, a coral fracture marker appears above `test-room-03` in the test district. Pinching the marker draws a physical causal beam showing the exact propagation path from edit to failure.
5. **Timeline Rewind Crystal:** A floating crystal allows developers to scrub 4D time backward and inspect side-by-side color-coded git diffs on a floating optical glass card with +0.6 cm Z-lift.
6. **Learning Atelier:** Interactive Socratic challenges where developers predict which downstream module will break before looking at the error logs, cultivating genuine architectural mastery.
7. **Safe Action Gate & Physical Approval Dock:** Human-in-the-loop safety enforced by design. High-stakes actions (like applying patches or running tests) are staged in a physical approval dock requiring an explicit pinch confirmation and generating cryptographic SHA-256 audit receipts. No arbitrary shell commands can ever run.

### How We Built It
- **Lens Studio 5.23.2 & TypeScript:** Built with clean, type-safe TypeScript using the Spectacles Interaction Kit (SIK) and Spectacles UIKit. Per-frame scratch vectors are reused (no allocation profiling was done).
- **CLAD & LEAF Automated Testing:** Authored 22 LEAF scenarios (`L01`–`L22`) covering UI boot, spatial ergonomics, IK avatar reachability, secret scrubbing, and latency, alongside the 9 preserved `c1`–`c7` rover scenarios. **Executed in Lens Studio Preview on 2026-11-08: final sweep 31/31 PASS** (first sweep 26/31; the failures exposed two wrong test expectations and one real defect, islands occluding the control rail, which we fixed). Raw receipts are in the repo under `devpost/receipts/`.
- **Deterministic Test Sweep:** A pure Node.js engine test sweep (2,223 assertions, 0 failures, re-run 2026-11-08) plus the preserved rover physics sweep. The feature-matrix statuses (F01–F72) have not been re-audited against the running Lens.
- **Zero-Dependency Native Bridge:** A local WebSocket bridge (`ws://127.0.0.1:8787/build-alive`) built with pure Node.js stdlib that can ingest Claude Code lifecycle hooks and recorded agent-session replays, scrubs secrets, and journals events. **Status: the bridge serves HTTP (/health, /workspace, /providers) and holds 24 recorded-replay events; the Lens did not open a WebSocket to it in Preview, so the scene plays recorded replay and no live agent event has driven it.**
- **Optical Glass Design System:** Tailored for Snap's optical see-through waveguides using additive color palettes, non-color semantic double-coding (`[PASS]`, `[FAIL]`, `[CHG]`, `[AGT]`), and seated FOV ergonomics (>5 cm target size, >12 cm center separation).

### Challenges We Overcame
1. **Preventing Secret Leakage:** Autonomous agents frequently print logs with API keys and host user paths. We engineered an aggressive multi-pattern redactor that scrubs Anthropic, GitHub, Slack, AWS, and Google keys, and neutralizes path traversal before payloads reach AR.
2. **Optical Transparency in Waveguides:** Black is transparent on Spectacles. We designed navy/slate backplates (`#141824`) and high-contrast double-coded badges that remain legible across diverse real-world lighting environments.
3. **Ergonomic Safety:** Strict adherence to Snap's seated FOV constraints: placing controls on the front desk rail (`z = -62 cm`, `y = -24.5 / -12.5 cm`) to prevent the dreaded "gorilla arm" fatigue.

### What We Learned
Spatial computing transforms abstract distributed software architectures into intuitive spatial landscapes. When developers can point at a glowing red fault marker and trace a physical bridge to the exact line of code that caused it, software comprehension shifts from an exhausting mental simulation into immediate spatial intuition.

### What's Next for BUILD ALIVE
- Live multi-user collaborative pair-debugging where two Spectacles wearers share the same Architecture City workbench.
- Dynamic codebase AST parsing via local LSP (Language Server Protocol) integration for any arbitrary Git repository.
- Physical glasses hardware validation in a field study with university computer science students.

---

## 3. Built With
- Snap Lens Studio 5.23.2
- Spectacles Interaction Kit (SIK 0.18)
- Spectacles UIKit (Snap OS 2.0 / 3.0 Themes)
- LEAF (Lens Execution & Automation Framework 2.0.2)
- TypeScript & Node.js v24 (Zero external npm dependencies)
- RFC 6455 Native WebSocket & HTTP Bridge
- HyperFrames & FFmpeg / FFprobe (Short film generation)

---

## 4. Honest Disclosures
- **Working Prototype Status:** **Preview-only.** The Lens was exercised in Lens Studio 5.23.2 (SPECS 27 Interactive Preview): 31/31 LEAF scenarios in the final sweep, plus three real Preview screenshots and a Preview frame capture used in the film. The scene runs recorded replay data; live agent-to-Lens streaming is **not** demonstrated. Pinch inputs in the footage were injected by the Lens Studio Preview tooling, not a physical hand. There was **no physical Spectacles test**: on-glasses legibility, comfort, battery, and optics are unproven. Known defect: text labels are large and overlap in the free Preview camera view.
- **AI Usage:** Code, tests, and documentation were pair-programmed with AI coding assistants (Google Antigravity / Claude Code) following strict verification and zero-fabrication guidelines.
- **Zero Additional Spending:** Built with £0 / $0 additional expenditure, utilizing open-source tools, native platform primitives, and existing machine capabilities.
