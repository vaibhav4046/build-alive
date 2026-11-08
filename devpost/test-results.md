# Test results: rover core (tag `core-rover-v1`)

Everything below was run on 2026-11-08 and pasted from real output. Three kinds of test are kept apart on purpose:

1. **LEAF scenarios**: run inside Lens Studio's preview through the LEAF plugin (SIK-simulated hands, real scene).
2. **Preview-agent interaction**: the AiPreviewAgent `Drag` action driving SIK in the preview (not LEAF).
3. **Node scenarios**: the pure simulation and state machine run in Node (not Lens Studio, not LEAF).

## Machine and versions
- Machine `VAIBHAV`: 12th Gen Intel Core i5-12450HX, 15.7 GB RAM, Intel UHD Graphics + NVIDIA GeForce RTX 3050 6GB Laptop GPU, Windows 11 (NT 10.0.26200).
- Lens Studio 5.23.2.26081320, target Spectacles, Preview panel device SPECS 27 in Interactive mode. LEAF package 2.0.2 with the LEAF plugin 5.23.0; AiPreviewAgent Inspect/Interact 2.0.1. The runtime SIK print says `SIK Version : 0.18.0`.
- Other apps (browser, the Claude desktop app) were running during the tests, so timings are from a busy laptop.

## Done criteria status (preview only)
| # | Criterion | How it was checked | Result |
|---|---|---|---|
| 1 | Start layout at real size, rover at base, table labelled "Simulated in preview" | LEAF `c1-layout` | **PASS** |
| 2 | Run with Small stalls at the steep section; evidence card within 1 s with "needs 7.9 N.cm" and "has 4.0 N.cm"; beam stall point to motor | LEAF `c2-stall-evidence` | **PASS** (card 741 ms after the press) |
| 3 | Pinching the Geared block mounts it, label "Geared", evidence and beam cleared | LEAF `c3-swap-pinch` | **PASS** (after one fix, see below) |
| 3 | Dragging the Geared block onto the mount snaps it on | Preview-agent SIK `Drag`, observed with the runtime scene query | **PASS**, but **not a LEAF test** (LEAF's simulated drag could not be used, see below) |
| 3 | Guard: a block dropped far from the mount returns to its slot | LEAF `c3-drop-far` | PASS (weak: the simulated drag always ends far away) |
| 4 | Run again reaches the top, proof card shows motor, both numbers and 2.1x | LEAF `c4-pass-proof` | **PASS** (card 5383 ms after the press: the Geared motor is five times slower, as designed) |
| 5 | Reset restores the rover, the Small motor, and hides the cards | LEAF `c5-reset` (from a pass and from a stall) | **PASS** |
| 6 | Every control in view, at least 12 cm apart, at least 5 cm across | LEAF `c6-controls` (geometry + the camera's field of view) and `c6-ik-reach` (IK arm reaches Run and Reset) | **PASS** |
| 7 | 200 presses, p50/p95/p99 | LEAF `c7-latency` | **PASS** (numbers below) |

Real SPECS glasses (comfort, hand tracking, true latency, real field of view) are **unproven**: no hardware was available.

## LEAF output (from the Lens Studio log)
```
[LEAF c1] layout ok: table 100x60, rover 18x12x8 cm, label 'Simulated in preview'
PASSED: c1-layout
[LEAF c2] evidence visible 741 ms after the Run press
[LEAF c2] beam end to motor 0.00 cm, beam end to stall marker 0.00 cm
[LEAF c2] evidence card is 10.8 cm right of the stall marker, at x=14.0
PASSED: c2-stall-evidence
[LEAF c3-tap] swap by pinch ok: label Geared
PASSED: c3-swap-pinch
[LEAF c3-far] far drop returned the block to its slot at x=-20.0 z=-62.0
PASSED: c3-drop-far
[LEAF c4] proof card shown 5383 ms after the Run press
PASSED: c4-pass-proof
[LEAF c5] reset ok from passed and from stalled
PASSED: c5-reset
[LEAF c6] Run: 5 cm across, nearest other control 16.4 cm
[LEAF c6] Reset: 5 cm across, nearest other control 20.0 cm
[LEAF c6] Small: 6 cm across, nearest other control 14.0 cm
[LEAF c6] Geared: 6 cm across, nearest other control 14.0 cm
[LEAF c6] camera fov 36.6 deg vertical, aspect 0.875, gaze at (-4.8, -20.3, -70.8)
[LEAF c6] Run is -3.0 deg right, -4.6 deg up of the gaze: in view
[LEAF c6] Reset is 7.2 deg right, -4.7 deg up of the gaze: in view
[LEAF c6] Small is -13.2 deg right, -3.3 deg up of the gaze: in view
[LEAF c6] Geared is -7.0 deg right, -3.4 deg up of the gaze: in view
[LEAF c6] EvidenceCard centre is 7.8 deg right, 5.8 deg up: in view
[LEAF c6] ProofCard centre is 3.7 deg right, 5.4 deg up: in view
PASSED: c6-controls
[LEAF c6-ik] IK arm reached Run: the rover started and stalled
[LEAF c6-ik] IK left hand reached Reset
PASSED: c6-ik-reach
```
"In view" means: with the user looking at the middle of the task (the average of the controls, the rover's start and top, and the two cards), each control is inside the camera's field of view as the preview reports it (36.6 degrees vertical, aspect 0.875). That is the preview camera, **not** the real glasses' field of view.

## Criterion 7: latency (200 presses, LEAF `c7-latency`)
50 cycles of Run, Reset, tap the Geared block, tap the Small block through real SIK interaction. For each press the script logs `Date.now()` at the press handler's entry and `Date.now()` in the first `LateUpdateEvent` after the response was applied (the last script hook before the frame renders).

```
presses logged: 200 (run 50, reset 50, swap 100)
press-to-first-frame ms: p50=1.0 p95=1.0 p99=2.0 min=0 max=2 n=200
run:   p50=1.0 p95=1.0 p99=2.0 n=50
reset: p50=1.0 p95=1.0 p99=1.5 n=50
swap:  p50=1.0 p95=1.0 p99=2.0 n=100
```
Target (p99 under 100 ms in the preview): **met, p99 = 2.0 ms on `VAIBHAV`**. The average is deliberately not reported.

What this number is and is not:
- It measures script-side latency only: from the press handler to the end of the same frame's script work. It **excludes** the input device and hand-tracking pipeline, GPU present and display latency.
- `Date.now()` has 1 ms resolution, so values are 0, 1 or 2 ms: the result is "about one frame of script work", not a precise sub-millisecond figure.
- It is a preview measurement. **Real-glasses latency is unproven.**

Raw values (ms): `2,1,0,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,1,0,0,0,1,1,0,1,1,1,1,1,1,0,0,0,1,0,1,1,1,1,2,0,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,2,0,1,1,0,1,1,1,0,0,0,1,1,0,1,1,0,0,2,1,1,1,1,1,2,0,1,1,0,1,0,2,0,1,1,1,0,1,0,0,0,1,1,1,1,0,0,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,0,1`

## What failed on the way (kept on purpose)
- **`c3-swap-pinch` failed twice** at first. Cause: LEAF's simulated pinch carries the block about 30 cm with the hand while it holds it (the pinch lasts about 50 ms), so my rule "a release that moved less than 2 cm is a tap" rejected it. Fix: a pinch released within 400 ms also counts as a tap. It passed afterwards.
- **LEAF's simulated drag could not verify the drag-to-mount path.** `c3-swap-drag` failed, and a calibration loop diverged: the block ended 125 cm to 1900 cm away whatever vector was commanded, because the simulated hand moves a SIK-manipulated object by its own motion. That scenario was removed from the index (not hidden: it is described here). The drag path was checked with the preview agent's SIK `Drag` action instead: after the drag the Geared block was a child of `MotorMount`, the Small block was back in the tray, `MountLabel` read `Geared`, and `EvidenceBeam` was disabled. That is one observation, not an automated suite.
- `c3-drop-far` passes, but it is a weak guard: LEAF's drag always ends far from the mount, so it would pass for any drop-far logic.

## Node scenarios (pure sim and state machine; not LEAF, not Lens Studio)
```
sim.check: all assertions passed
small  : {"o":"stall","need":"7.9","has":"4.0","speed":"47.1"}
geared : {"o":"pass","margin":"2.1x","speed":"9.4"}

layout.check: all 37 assertions passed   (controls >= 12 cm apart and >= 5 cm across; cards below eye level, clear of the rover and the ramp)
Run 5 cm across, nearest control 16.4 cm; Reset 5 cm / 20.0 cm; Small 6 cm / 14.0 cm; Geared 6 cm / 14.0 cm
ramp top at x=30.4 y=-13.8; rover left end -34.5, landing end 34.4 (span 68.9 cm)

SWEEP PASSED: 5582 distinct scenarios, 172258 assertions, 0 failed
   (torque x angle grid 1840; mass sweep 60; rolling resistance 273; gear x efficiency 132; stall-threshold boundaries 10 angles x 4 checks;
    300 random ramps; determinism 1000 repeats; exhaustive run/reset/swap/step interleavings up to 4 operations 1554 sequences;
    400 random 30-operation sequences; 4 frame rates x 2 motors; headline numbers)
```
Commands: `node --no-warnings devpost/tests/sim.check.mjs`, then `node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tests/layout.check.mjs` and `.../sweep.mjs`. "Distinct scenarios" are input combinations or sequences; "assertions" are the individual checks made over them. The first sweep run had one failing check family, caused by a wrong assumption in the test (which section decides the outcome changes with mass), not by the simulation; the test was corrected and the full sweep re-run clean.

## Not tested
- Real SPECS hardware: comfort, hand-tracking dropouts, true latency, real field of view.
- Any person other than the author using it.
- The chime on run end (no audio asset was added in this core build).
