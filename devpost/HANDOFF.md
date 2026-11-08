# HANDOFF: two agents, one project (written 2026-11-08 23:00 UTC)

Submission period ends Mon 9 Nov 2026 22:00 GMT (5:00 pm ET, per the official rules). Aim to hand over by 17:00 UTC Monday. Product: BUILD ALIVE (the entrant's decision; the Tandem and rover docs are history).
Branch: `visual-emergency-rebuild`. Fallback tags: `core-rover-v1`, `build-alive-v1.0`, `pre-v3-checkpoint`.

## Ground truth at 23:00 UTC (from audit-before-v3.md and re-runs)
- Verified by running: `node devpost/tests/build-alive.sweep.mjs` = 2,223 assertions, 0 failures (re-run by Claude, 22:58 UTC); sim.check passes; bridge `start-workspace.mjs` serves two distinct real worlds (EarthProof and mnemosyne).
- NOT done: LEAF L01 to L22 were compiled but never executed in Preview (no receipts); no Lens Studio Preview screenshot or recording exists; no live agent event has reached the Lens; `video/out/build-alive-demo.mp4` is an HTML-rendered animation, NOT Preview footage, and must not be submitted as footage of the Lens.
- The official rules require the video to show the Project working and to be a screen recording of the Lens Studio preview. So Preview footage is the one thing that cannot be faked or skipped.

## Single-writer rule
Only one agent edits a given file. Ownership:
| Area | Owner | Notes |
|---|---|---|
| `bridge/**`, `devpost/tests/**` (node), provider registry, scanner, session coordinator, connect command | Antigravity | stay out of `Assets/**` unless Claude asks |
| `Assets/Scripts/BuildAlive*.ts`, `EarthProofMain.ts`, scene wiring | Antigravity edits source; Claude only via the MCP and only for scene wiring needed by a failing LEAF scenario, after pulling the latest commit and announcing it in this file | one writer at a time: write a line under "Lock log" before and after |
| Lens Studio MCP actions, LEAF execution, Preview screenshots, frame capture | Claude (the session whose working folder is this project) | read-only on source |
| `devpost/evidence/**`, `devpost/leaf-receipts/**`, `video/**` (film) | Claude | |
| `README.md`, `devpost/submission.md`, `feature-matrix.md`, `review.md`, `test-results.md` | whoever finishes last, after reading the current file and the evidence folder; never overwrite without reading |
Commit only your own files with explicit paths (`git add <paths>`, never `git add -A`). Conventional commit messages, no Claude/Anthropic attribution (the user's hook blocks it), never `--no-verify`.

## Gates and cutoffs (UTC)
| Gate | Real proof required | Cutoff |
|---|---|---|
| A Evidence baseline | LEAF L01 to L22 EXECUTED in Preview with a run receipt per scenario (pass or fail, pasted); 3 real MCP Preview screenshots (project world, active agent scene, fault/inspect scene) in `devpost/evidence/` | Mon 02:00 |
| B One real live event | An actual Claude Code (or Codex) event, from a hook or `exec --json` on this PC, shows up in the bridge journal with provenance LIVE_CONNECTED and moves the matching object in the Preview; eventId and timestamps recorded; replay events stay labelled REPLAY | Mon 06:00 |
| C Real workspace in the Lens | The two real worlds (EarthProof, mnemosyne) selectable in the Lens, different maps, inspect shows the true file path | Mon 08:00 |
| D Film footage | Preview frames captured through MCP screenshots while LEAF or the preview agent drives the interactions; no desktop screen recorder unless the user confirms the PC is idle | Mon 10:00 |
| E Film render | Wordless pixel-art opening dissolving into REAL Preview footage; under 3:00; blackdetect; audio levels; thumbnail | Mon 14:00 |
| F Package | README, submission.md, feature-matrix.md (every Fxxx WORKING/PARTIAL/PLANNED/UNSUPPORTED with proof), test-results.md with separate sections for LEAF executed / compiled / node, review.md (own persona scores, labelled), secrets scan, repo ready | Mon 17:00 |
If gate B is not green by Mon 06:00 UTC, stop and ship the strongest working Lens: the real-workspace worlds and replay with every replay label visible, and say so plainly. Never present replay as live.

## Easy connect (the user's latest requirement): no API keys, no logins to build
The user asked that any user can connect Claude, Codex, Hermes and OpenClaw by login or by their app, not by API keys. Honest design, per provider:
- Nothing in BUILD ALIVE ever asks for or stores a provider password or API key. The user is already logged in inside their own CLI or app; BUILD ALIVE only listens to events that app emits locally. No provider offers "log in with Claude/ChatGPT and read my sessions", and we do not scrape or impersonate apps.
- One command: `node bridge/connect.mjs` (to be written by the bridge owner). It detects installed tools (`claude`, `codex`, `opencode`, `hermes`, `openclaw`, Antigravity) and prints a status table: LIVE_CONNECTED / REPLAY_IMPORTED / OFFLINE / UNSUPPORTED / AUTH_REQUIRED. For each detected tool it explains in one line what it would change and asks yes/no before changing anything.
  - Claude Code: with consent, merge a hook entry for PreToolUse/PostToolUse/SessionStart into the user's `~/.claude/settings.json` (back the file up first, preserve existing hooks, add a clear marker so one command removes it: `node bridge/connect.mjs --remove claude`). Hook payloads go to the local bridge only.
  - Codex: no global change; offer `node bridge/run-codex.mjs "<task>"` which runs `codex exec --json` under the user's existing login and streams its structured events to the bridge. This does not attach to an already-running GUI session; say so.
  - OpenCode: with consent write a small plugin file into the project's plugin folder; detect the installed version first.
  - Hermes and OpenClaw: only if their official ACP/gateway endpoint is detected locally and the user pastes or approves it; otherwise show UNSUPPORTED or AUTH_REQUIRED honestly. Verify against their docs before coding.
  - Antigravity: local transcript tailing is REPLAY_IMPORTED unless the file is actively growing during the session, then it can be labelled "near-live, transcript tailing" with the lag shown; never "LIVE_CONNECTED" from an old file.
- Read-only by default. Writes (launching a task) need a separate explicit confirmation in the Lens, an allowlisted command, and the result receipt shown. A SHA-256 nonce only prevents replay; it is not proof of consent.
- For a physical headset 127.0.0.1 is the headset itself, so the local bridge is for the Preview only; hardware needs a separately secured transport and is out of scope; say so in the README.

## Lock log (append a line before and after any shared-file edit)
- 2026-11-08 23:00 UTC Claude: created this file; no source edits.
