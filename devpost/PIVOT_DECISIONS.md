# EarthProof Home Check: pivot decisions (2026-11-08 02:00 UTC)

Decided by Claude on the entrant's instruction ("research the winners, then decide: keep or start from scratch; the only goal is first place"). plan-lens is learner-led, so the entrant's delegation is disclosed in the README: the interview answers below were supplied by Claude, not typed by the entrant.

## Why the rover ramp trial is not enough
The entrant's judgement, which I share: a rover climbing a ramp reads as a physics toy. The concept video's own warning is "make it a real app people would use, not a tech demo". Winners research (devpost/winners-analysis.md) shows polished, tactile, clearly-themed experiences place first; teaching tools place when they solve a recognisable real problem.

## The product
EarthProof Home Check: "See it at real size before you build or buy." A family preparing a home for a relative who uses a wheelchair (or a stroller or cart) checks two things in their own entrance, at real size, before spending money: does it fit through the door, and is the ramp too steep for the person pushing. It shows WHY, pointing at the exact part that fails. Real problem, sourced in devpost/research.md: 77% of adults 50+ want to stay in their homes (AARP 2021), ramps above 1:12 and doors under 32 in clear break the ADA reference limits, and steeper ramps raise push effort (2018 and Korean studies).
Target users: adult children and caregivers planning a porch ramp or door change, parents with strollers, anyone moving a heavy cart; a teacher or club can use it to teach the same slope and width maths. Honest limits: planning aid for learning, not a code-compliance check or a safety certification; no claim of daily use that data does not show.

## Interview answers for plan-lens (answer it with these; do not invent more)
1. The idea: a Lens that checks a home entrance at real size for a wheelchair: door width and ramp slope, before the family builds or buys.
2. The spatial moment: standing at the front door, you see a real-size wheelchair footprint and the doorway. You drag the door-frame handles to your measured width. You press Run and the chair rolls toward the door. If the opening is too narrow it stops, the clipping edge glows red and a beam from the edge to a small card says "needs 81 cm, you have 71 cm: 10 cm short". Then you look down at the step, drag the rise handle to your step height and the ramp foot to the space you have; the ramp appears at real size with its slope as a ratio. Press Run: if the push needed is more than the helper can give, the chair stalls on the steepest part with the same red pointing evidence and the fix: "1:12 needs 240 cm of run".
3. Product or overlay: product. The virtual chair, door and ramp are the experience. Real version would use your real door; in the preview a virtual entrance (wall, doorway, one step) stands in, labelled "Simulated in preview". No recognition is claimed.
4. Where things live: eye height about 115 cm (seated or standing at the door), entrance 90 to 150 cm away, slightly below eye level for the step and ramp. Doorway 100 cm wide wall section with adjustable opening 65 to 95 cm; chair footprint 76 cm wide x 105 cm long (the ADA 1991 commentary says wheelchairs are typically about 30 in wide); step rise adjustable 5 to 40 cm; available run adjustable 60 to 400 cm. Controls on a low strip in front of the user, never head-locked, none behind the shoulder. Evidence cards pinned beside the failing part, not in the middle of the view.
5. Hands: pinch big Run and Reset buttons; grab and drag the door-frame handles, the rise handle and the ramp-foot handle (SIK interactables); preset buttons for common widths (71, 81, 91 cm) as the same job without dragging. No voice, no camera, no network.
6. When things show: gauge and handles always during setup; evidence card and beam only after a failed run; summary card only after both tests have run; everything fades on Reset. A soft chime from the chair when a run ends, so a glance away still lands.
7. Done (each checkable in the preview): see "Done criteria" below.
Consent: no people are recorded, identified or followed; the occupant is an abstract silhouette.

## Model (pure function, node-tested, same numbers drive the screen and the tests)
- Door: needs = chairWidth + 2 x clearance = 76.2 + 2 x 2.54 = 81.28 cm (the "inch of leeway on each side" from the ADA 1991 commentary; equals the ADA 32 in clear width, 81.28 cm). Pass if clear opening >= needs. Report the shortfall in cm.
- Ramp: angle = atan(rise / run); ratio = run / rise; push needed F = m g (sin angle + c cos angle) with total mass m = 100 kg (chair plus occupant, an assumption), rolling resistance c = 0.02 (an assumption). Worked values: 1:12 -> 101 N, 1:10 -> 117 N, 1:7.5 -> 149 N, 1:6 -> 181 N.
- Helper effort selector (assumption, labelled): Light 90 N, Medium 120 N, Strong 150 N. Pass if F <= helper effort; the chair stalls at the first point where it does not.
- Two separate checks on the card: the push test and the code reference (ratio no steeper than 1:12, rise per run no more than 30 in = 76.2 cm). A ramp can pass the push test and still miss 1:12 (for example 1:10 with Medium); the card says so.
- Everything on screen says "simplified teaching model". Compare with the sources only for direction (steeper = more effort), never as validation.

## Done criteria (replace the rover criteria)
1. Start: virtual entrance in view at real size, labelled "Simulated in preview", wheelchair footprint 76 cm wide parked 150 cm from the door, all controls in view.
2. Door gauge: dragging a frame handle or pressing a preset changes the opening live; the gauge shows the width, the 81 cm marker, and turns red below it within one frame.
3. Door test, 71 cm: chair stops at the door, the clipping edge glows red, within 1 s a card shows "needs 81 cm" and "you have 71 cm" and "10 cm short" with a beam to the edge. Door test, 91 cm: chair passes through and the door card shows OK.
4. Ramp setup: dragging the rise handle and the ramp-foot handle updates the ramp, the ratio and the run needed for 1:12 live.
5. Ramp test, short run (rise 20 cm, run 150 cm, Medium): chair stalls on the steep part, card shows "needs 149 N", "helper gives 120 N", "1:7.5, needs 240 cm of run for 1:12" with a beam. Ramp test, run 240 cm: passes (101 N), card says OK.
6. Summary card shows both results with numbers and the code-reference lines; Reset restores the start state and hides cards.
7. Controls: every control inside the view from the standing position, at least 5 cm across, at least 12 cm apart; one reach check with the IK arm on Run.
8. Latency: for 200 scripted interactions (drag step, preset, Run, Reset), time from the input event to the first frame showing the response; report p50, p95, p99 (never the average), name the machine, state it excludes GPU present and display latency; target p99 under 100 ms in the preview only; real-glasses feel unproven.
9. Node scenarios: 1000+ generated cases against the pure model (width sweep around the 81.28 cm boundary, rise/run sweeps around 1:12, mass and effort sweeps, determinism repeats, run/reset/change interleavings). Report real counts; these are not LEAF tests.

## Time guard (UTC; deadline Mon 9 Nov 22:00 GMT, aim to hand over before 18:00)
- Now to Sun 08:00: finish and tag the current rover core `core-rover-v1` (LEAF green, committed). It is the fallback and CLAD/LEAF evidence. Do not polish it further.
- Sun 08:00 to Mon 06:00: build Home Check (door station first, then ramp station) with LEAF + node tests, commit often.
- Mon 06:00: if Home Check criteria 1 to 6 are not green, STOP the pivot, revert the pitch to the rover core (the 9c04fe2 framing) and spend the remaining time on tests, docs and film. Say so in the README.
- Mon 06:00 to 14:00: judge passes, docs, wordless film (hyperframes) with real preview footage, render and checks.
- Mon 14:00 to 18:00: final LEAF/node runs from clean state, repo scan for secrets, submission.md, report. The user uploads to YouTube and Devpost.
- Optional stretch only if everything above is green: turning-space check (verify the 60 in figure from the Access Board first).

## Film (wordless, calm, pixel art, three generations)
Three vignettes, one story: an older adult is coming home (a hospital visit implied by a small bag and a cane/wheelchair; nothing grim), the adult child measures the door with a tape and a phone and still doubts, the teen puts on the glasses. Each of the three also uses a phone, a laptop and the glasses at some point. Pixel-art plays as a game: small wins (door glows green, ramp goes from red to green), ambient calm music, no speech, minimal captions only where honesty requires. Then it dissolves into real Lens Studio preview footage of the working Lens (most important part). Photoreal shot optional, labelled "Concept", under 15 s, only with a video-model key; otherwise a stylised render. Never fake the Lens working.
