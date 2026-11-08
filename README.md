# EarthProof: Ramp Climb

**Will it climb? Prove it in your space before you build or buy.**

Slope and load decide whether a robot, a stroller, a hand truck or a porch ramp works, and people mostly guess ([sources and limits](devpost/research.md)). EarthProof puts the test in your own space at real size and points at the part that fails. **What is built and tested here is one trial, the rover Ramp Climb.** The stroller, hand-truck and porch-ramp cases are the same maths with different numbers, planned as a stretch ("Phase 2"); see the status table for whether they exist. Nothing here claims daily use, hardware testing or a competition result.

A Lens for SPECS (built for the Devpost "Learn AR with SPECS" challenge). A small rover sits at the foot of a two-section ramp at real size on a virtual table. You pinch **Run**. With the Small motor it climbs the shallow section and stalls on the steep one, wheels still spinning. A red beam runs from the stall point to the motor, with two numbers beside the ramp: what the climb **needs** and what the motor **has**. You grab the Geared motor from the parts tray and drop it on the rover's mount. You pinch **Run** again. It climbs, slowly, and a proof card appears at the top with your motor, both numbers and the safety margin.

The course is virtual and labelled **"Simulated in preview"** on the table edge. Nothing here recognises a real table or a real robot kit.

## Status (read this first)

This repository is an honest work in progress snapshot. The detailed, current numbers are in [`devpost/test-results.md`](devpost/test-results.md) and the self-reviews in [`devpost/review.md`](devpost/review.md). In short:

| Thing | State |
|---|---|
| Pure simulation (`EarthProofSim.ts`) and run state machine (`EarthProofFlow.ts`) | Logic proven by node tests: 5582 distinct scenarios, 172258 assertions, 0 failed (not LEAF tests, not run in Lens Studio) |
| Layout geometry (done criteria 1 and 6, from the numbers the scene is generated from) | Node check passes (34 assertions) |
| Scene, UI, flow running in the Lens Studio preview, LEAF scenarios, latency percentiles | See `devpost/test-results.md` for what has actually been run |
| Phase 2 stretch (load picker for hand truck / stroller, drag handle that changes the slope, ratio next to the 1:12 reference) | **Not built** unless `devpost/test-results.md` says otherwise. Any such estimate would be "for learning, not a safety certification" |
| Real SPECS glasses (comfort, hand tracking, true latency) | **Unproven.** No hardware was available |

## Run it

1. Open `EarthProof.esproj` in Lens Studio 5.23.2 or newer. Project target is Spectacles; the Preview panel uses the SPECS 27 device in Interactive mode.
2. Press the preview. WASD moves, Q and E go down and up, right-drag looks around; a click acts as a pinch.
3. Pinch **Run**. Pinch **Reset** to restore the Small motor and the rover to the base. Drag the Geared block onto the mount, or just pinch it.

Controls are 8 x 5 cm UIKit buttons on the table's front edge (20 cm apart) and two 6 cm motor blocks in the tray (at least 12 cm from every other control). Nothing is head-locked. Nothing depends on voice or the network.

## How it works

| File | Job |
|---|---|
| `Assets/Scripts/EarthProofSim.ts` | Pure physics: torque needed on a slope, torque available, outcome, stall position, margin, speeds. Every number on screen comes from here. |
| `Assets/Scripts/EarthProofFlow.ts` | Pure run state machine (idle, running, stalled, passed) with the 0.3 s evidence delay. |
| `Assets/Scripts/EarthProofLayout.ts` | World layout constants in cm; the scene generator, scripts and tests share them. |
| `Assets/Scripts/EarthProofMain.ts` | Lens Studio adapter: moves the rover, spins wheels, shows cards and beam, block drag/tap, press-to-frame latency log. |
| `Assets/Scripts/EarthProofControlsUI.ts`, `EarthProofCardsUI.ts` | UIKit Run/Reset buttons; evidence and proof cards. |
| `devpost/tools/gen-scene.mjs` | Generates the VirtualScene instructions for the course from the layout and sim. |

The physics is a **simplified teaching model**, not a motor datasheet: wheel torque needed = m g (sin a + 0.03 cos a) r for a 0.60 kg rover with 3 cm wheels; the Small motor gives 4.0 N.cm in total, the Geared motor 17.0 N.cm (5:1, 85 % efficient) but is five times slower. Sources and unsourced assumptions: [`devpost/research.md`](devpost/research.md).

## Tests

```bash
node --no-warnings devpost/tests/sim.check.mjs
node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tests/layout.check.mjs
node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tests/sweep.mjs
```

LEAF scenarios (in Lens Studio) and the latency loop are described in [`devpost/test-results.md`](devpost/test-results.md).

## Documents

[`design-brief`](devpost/design-brief.md) · [`research`](devpost/research.md) · [`competition`](devpost/competition.md) · [`test-results`](devpost/test-results.md) · [`review`](devpost/review.md) · [`video-script`](devpost/video-script.md) · [`submission`](devpost/submission.md) · [`build-log`](devpost/build-log.md) · [`THIRD_PARTY_NOTICES`](THIRD_PARTY_NOTICES.md)

## Disclosures

- **AI assistance:** built with Claude Code (Anthropic) through the CLAD workflow and the Lens Studio MCP, directed and submitted by the entrant. The demo film's pixel art and its ambient sound are generated by scripts in this repository.
- **Kodro:** a conceptual inspiration only (the idea that a failed attempt in a simulated world teaches). No code, assets or lessons were used. See `devpost/research.md`.
- **Placeholders:** all meshes are Lens Studio built-in primitives standing in for real models.
- **No keys:** no API keys or tokens are in this repository (`.mcp.json` is git-ignored).

## Film

`video/` is a HyperFrames project (HTML/canvas, deterministic). Regenerate the ambient bed with `node devpost/tools/gen-ambient.mjs 154 video/assets/ambient.wav`. The demo film is wordless pixel art that dissolves into real Lens Studio preview footage; the real footage is labelled and the pixel scenes are illustrations. See `devpost/video-script.md`.
