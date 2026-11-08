---
status: approved
approval: Entrant delegated all interview decisions to Claude on 2026-11-08 ("make the decisions, make it win"). Scope narrowed from the earlier EarthProof / Circuit Coach drafts to one spatial moment, per plan-lens "Sizing the idea".
---

# Design brief: EarthProof Ramp Climb

Tagline: Test your robot in your room. Fail on purpose. See exactly why.

## The one spatial moment
You stand at a table with a small rover at the foot of a ramp, at real size. You pinch Run. The rover has the small motor, so it drives up the shallow section, then stalls at the steep section with its wheels spinning. A red evidence beam runs from the stall point to the motor, with two numbers beside the ramp: what the climb needs and what the motor has. You grab the geared motor from the parts tray and drop it on the rover's motor mount. You pinch Run again. It climbs slowly, reaches the top, and a proof card appears there showing your motor choice, the numbers, and the safety margin.

## Why it belongs on glasses
- Uses: draws in the world (the whole test happens at real size on your table), leaves your body free (hands carry the parts, eyes stay on the rover).
- Why it's better than the phone or laptop version: the evidence points at the actual part on the actual rover in the actual place where it stalled. On a screen it is a chart; here it is a pointing finger in the world. You never look away from the thing that failed.

## Why people would use it (framing, added 2026-11-08 after research)
Slope and load decide whether things climb, and people guess. A teacher picks motors for a robotics club. A parent wonders if a stroller will manage the new ramp. A family plans a porch ramp for a grandparent. All of them ask the same question: will it climb, and if not, why? EarthProof answers it in your own space at real size, before you build or buy, and shows the reason pointing at the part that fails.
- Core (must ship, criteria 1-7): the rover Ramp Climb trial.
- Phase 2 (only if the core is green and tested): a load picker that reuses the same pure function with different numbers: Rover (motor), Hand truck or cart (person pushes), Stroller (parent pushes). A drag handle on the ramp top changes the slope, and the card shows the slope as a ratio with the 1:12 reference. Teaching-only wording: "estimate for learning, not a safety certification".
- Honest limits: no cross-session history (cannot be shown in the preview), no claim that it replaces engineering or accessibility code review.
- Sources are in devpost/research.md.

## Product or overlay
- Type: product. The virtual rover, ramp and motors are the experience.
- What the real version would sense: your real table and your real robot kit.
- Stand-in for the preview: a virtual table and course, labelled "Simulated in preview" on the table edge. No recognition is claimed anywhere.

## Where things live
- Where the user is looking during the main task: down at the table, about 90 cm away, slightly below eye level.
- Table (virtual): 100 x 60 cm, top at about 75 cm above the floor, in front of the user at start. Labelled "Simulated in preview".
- Ramp: 50 cm long, runs left to right across the user's view (side-on), so the whole climb fits the glasses' view at 90 cm (about 63 cm usable width). Two sections: shallow 10 degrees for the first 20 cm, steep 25 degrees for the last 30 cm.
- Rover: about 18 x 12 x 8 cm, wheels radius 3 cm, starts at the ramp base. Motor mount is clearly marked on top.
- Parts tray: front-left of the table, two motor blocks (Small, Geared), each about 6 cm, labelled in large light text.
- Controls: Run and Reset are 8 x 5 cm pinch buttons on the front edge of the table, 20 cm apart, within arm reach and below the rover. Never stuck to the face, never head-locked.
- Evidence card: pinned beside the stall point on the ramp, not in the middle of the view. Beam runs from the stall point to the motor.
- Proof card: appears at the top of the ramp, facing the user.

## Hands and input
- Run: pinch the big Run button.
- Reset: pinch the big Reset button.
- Swap motor: grab a motor block and drop it on the mount; it snaps if within 6 cm. A pinch on the block also swaps it (the same job without dragging, so it works for LEAF and for shaky hands).
- Targets are big and highlight when aimed at.
- Voice: none. Nothing depends on voice or on the network.

## When things show
- Evidence card and beam: show only after a stall, fade when the motor is swapped or on Reset.
- Proof card: shows only after a successful climb, until Reset.
- Parts tray: always visible while the rover is idle, dims while it runs.
- Out of view: a short chime plays from the rover when a run ends (pass or fail), so a glance away still lands. No arrows needed.

## The physics (simplified teaching model, shown on screen as such)
Rover mass 0.60 kg, driven wheels 2, wheel radius 3 cm, rolling resistance 0.03.
Wheel torque needed on a slope = m x g x (sin angle + 0.03 x cos angle) x radius.
- Shallow 10 degrees needs about 3.6 N.cm total. Steep 25 degrees needs about 7.9 N.cm total.
- Small motor: 2.0 N.cm each, 4.0 N.cm total, 150 rpm. Passes 10 degrees, stalls at 25 degrees. Fails by 3.9 N.cm.
- Geared motor (5:1, 85% efficient): 8.5 N.cm each, 17.0 N.cm total, 30 rpm. Passes both sections with a 2.1x margin on the steep one (17.0 / 7.94), but is five times slower (9.4 cm/s against 47.1 cm/s on the flat).
- All numbers on screen are computed by the same function that decides the outcome, so the explanation can never disagree with what happened. The run is deterministic: same inputs, same result, every time.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. On start, the table, ramp, rover and parts tray are in view at real size, the rover sits at the ramp base, and the table is labelled "Simulated in preview".
2. Pinching Run with the Small motor drives the rover up the shallow section and stalls it at the start of the steep section; within 1 second an evidence card appears beside the stall point showing "needs 7.9 N.cm" and "has 4.0 N.cm", and a beam runs from the stall point to the motor.
3. Dragging (or pinching) the Geared motor onto the mount snaps it on, changes the mount label to "Geared", and clears the evidence card and beam.
4. Pinching Run again drives the rover to the top of the ramp, and a proof card appears showing the motor, both numbers and the 2.1x margin.
5. Pinching Reset returns the rover to the base, the Small motor to the mount, and hides the evidence and proof cards.
6. Every control is inside the view from the standing position, at least 12 cm from the nearest other control, and at least 5 cm across.
7. Interaction latency: for 200 scripted presses of Run, Reset and swap, the time from the press event to the first frame showing a response is logged. Report p50, p95 and p99 (not the average) with the machine it ran on. Target: p99 under 100 ms in the preview.

## Out of scope
- Voice, cloud AI, live camera, recognising real objects, other people, multiplayer.
- Memory across sessions and other trials (obstacle, payload). A short in-session run history ("Attempt 1: stalled, Attempt 2: passed") is allowed if the core is green.
- Real-room collision or a real table.

## Risks and open questions
- Feel on real glasses (comfort, hand-tracking dropouts, true latency) is unproven. Only preview logic is proven.
- The physics is a simplified teaching model, not a motor datasheet. The on-screen label says so.
- The ramp at real size is wide for the glasses' narrow view; the side-on layout is the mitigation, to be checked by walking around it in the preview.
- Persistence across sessions cannot be shown in the preview, so it is not claimed.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands. Bright palette: cyan, amber, white; red only for evidence.
- Get the basic flow working first, then add detail.
- Keep the simulation a pure function (inputs: motor, section angles, mass; outputs: outcome, stall position, numbers) in one small module, so the on-screen numbers, the outcome and the LEAF assertions all use the same code.
- Latency discipline: the press handler starts the response on the same frame; pre-create every object (no instantiate or allocation during a run); no network calls anywhere; log press and first-response timestamps for criterion 7.
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
