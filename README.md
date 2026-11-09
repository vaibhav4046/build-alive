# BUILD ALIVE

**Learn AI engineering by doing.** BUILD ALIVE is a Snap Spectacles Lens that shows your AI coding agent working on your real project in floating windows around you. Every step and every shell command is explained in one plain sentence, the exact evidence is one pinch deeper, and nothing risky runs until you approve it.

> The Lens Studio project file is `EarthProof.esproj`: EarthProof was this entry's working name during the hackathon, and BUILD ALIVE is the product it became. Same project.

Built for the Snap **Learn AR with SPECS** Devpost hackathon (deadline 9 November 2026, 22:00 GMT) with Lens Studio 5.23.2, CLAD, the Lens Studio MCP and LEAF.

---

## What you see

| Window | What it shows |
|---|---|
| **Session** (centre) | The agent's steps as tiles, one plain sentence each ("Rewrote part of lobby.ts", "The checks ran and one failed, so something is broken"). Repeated steps collapse into one tile with an `x2` badge. |
| **Learn** (left) | The agent loop: Prompt, Plan, Tools, Files, Tests, Result, Loop. The current step's stage lights up, with *what happened*, *why it matters* and *what to try next*. |
| **Project** (right) | The real module folders of a repo you approved, with a type icon per tile (script, material, bridge, docs, folder). |
| **Agent chips** | One chip per supported agent with its honest status: `LIVE`, `REPLAY`, `OFFLINE` or `UNSUPPORTED`. Pinch a chip to switch; a disconnected agent shows how to connect instead of fake events. |
| **Dock** | Rewind, Command explainer, Next step, Explain, Approve. Approve runs only an allowlisted read-only check and leaves a receipt. |

Each window minimises into its tab with the round X, and pinching the tab restores it.

**Plain words, never guesses.** `git status` becomes "Checks which files changed". An unknown command is labelled unknown. The **Prompt Coach** checks a prompt for a goal, a file and a way to check it worked, and gives one tip. All of this is deterministic and rule-based (`Assets/Scripts/BuildAliveExplain.ts`), not AI reasoning, and the Lens never claims to read the agent's private thoughts.

---

## Status (truth in advertising)

| Area | Result | Evidence |
|---|---|---|
| Node checks | core 62/62 + 2,400 generated cases; engine sweep 2,224 assertions, 0 failures; explainer 11/11; layout 37/37; bridge hook 16/16; bridge WS guard 7/7 | `devpost/tests/`, run 2026-11-09 |
| LEAF in Lens Studio Preview | see the latest sweep receipts | `devpost/receipts/` |
| Real workspaces | EarthProof (139 files, 11 modules) and mnemosyne (113 files, 13 modules) scanned by the bridge | `bridge/start-workspace.mjs` → `/workspace` |
| Live agent events in the Lens | Shown as LIVE only when a real event arrives; otherwise REPLAY | provider status in the Lens |
| Physical Spectacles | **Not tested.** Preview only. | |

---

## How to run

### 1. Tests
```bash
node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tests/core.check.mjs
node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tests/explain.check.mjs
node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tests/layout.check.mjs
node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tests/build-alive.sweep.mjs
node --no-warnings devpost/tests/bridge-hook.test.mjs
node --no-warnings devpost/tests/bridge-ws-guard.test.mjs
```

### 2. Bridge (local only, 127.0.0.1:8787)
```bash
node bridge/start-workspace.mjs
```
It scans only folders you approve, redacts secrets and home paths, journals every event, and serves `/health`, `/workspace`, `/providers` and an authenticated `/hook` endpoint for Claude Code hook events (token in `bridge/.hook-token`, which is git-ignored).

### 3. Lens Studio
1. Open `EarthProof.esproj` in Lens Studio 5.23.2.
2. For live events: **Project Settings → Experimental APIs** on (the Lens connects to `ws://127.0.0.1:8787`). Without it the Lens runs the labelled REPLAY.
3. Preview device: Spectacles, Interactive. Pinch tiles, chips and dock icons.

### 4. Film
```bash
node video/tools/build-film.mjs video/film-plan.json
```
Assembles the film from real Preview clips with ffmpeg (captions and provenance tags burned in, original score).

---

## Repository map
- `Assets/Scripts/BuildAlive*.ts`: Lens logic (core engine, layout, explainer, providers, scene UI, transport).
- `Assets/Scripts/Leaf/`: LEAF scenarios run inside the Preview.
- `Assets/Scripts/EarthProof*.ts`: the earlier rover prototype, kept as a fallback.
- `bridge/`: zero-dependency Node bridge (scanner, hook receiver, redactor, journal, WebSocket).
- `demo-repo/`: small sample project used by the REPLAY story.
- `devpost/`: submission text, tests, receipts, screenshots, disclosures.
- `video/`: film tooling.

## Disclosures
- **AI assistance:** built with Claude Code (and earlier Google Antigravity) under the entrant's direction; see `devpost/ai-disclosure.md`.
- **Third-party:** Snap's Spectacles Interaction Kit, Spectacles UIKit and LEAF. Optional Simple Icons marks (CC0; trademarks belong to their owners) are credited in `THIRD_PARTY_NOTICES.md`. The default UI and the film use original monograms.
- **Hardware:** Preview only, not tested on physical Spectacles. `127.0.0.1` refers to the PC; a headset would need a secured network path, which is not built.

## License
MIT (`LICENSE`). Dependency notes in `devpost/licenses.md`.
