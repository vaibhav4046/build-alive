# Tandem: product definition and plan-lens interview answers

Decided by Claude on the entrant's instruction (the entrant asked for research, a decision and a full build; they did not type these answers). plan-lens is learner-led, so the README discloses that the interview answers below were supplied by Claude on the entrant's delegation.

## One-sentence promise
A tiny coworker sits at your desk and works while you work, so starting is easier and staying is calmer.

## Who wants it
Students, remote workers and people who focus better with company (including many people with ADHD who use "body doubling"), working alone and without a person to sit with. Not a medical product and no claim to treat anything.

## Interview answers for plan-lens (answer from these; do not invent more)
1. The idea: a seated work-session companion for glasses: a miniature coworker who works beside you during focus blocks, with a physical start ritual and a visible record of your work.
2. The spatial moment: you sit at your desk. At the far right corner, beside your work area, a 12 cm coworker sits on a stool at a tiny desk with a notebook. In front of you, below eye level, glows a 14 cm hourglass. You pinch it and it flips; sand starts to run; the coworker opens the notebook and starts writing. Every so often they turn a page or sip from a cup; a soft pen-scratch sound plays at their position. When the sand ends, a chime plays, the coworker stretches and raises a hand; you pinch their hand for a high-five and a small spark; a new tiny object appears on their desk (a plant, a lamp, a mug). Break: both rest. Next block.
3. Product or overlay: product. The virtual companion, hourglass and desk are the experience. A real version would sit on your real desk; in the preview a virtual desk stands in, labelled "Simulated in preview". No recognition is claimed. No camera, voice, network or AI is used or claimed.
4. Where things live: eye height about 115 cm, desk top 40 cm below the eyes. Work area (the real keyboard or laptop) is the central 50 cm of the desk and stays empty. Hourglass at x=-15 cm, 45 cm in front, 20 cm below eye level. Coworker desk at x=+38 cm, z=-65 cm, in the right edge of the view. Three duration coasters (15, 25, 50 min), each 7 cm across, plus the Calm toggle and Reset, on the front edge of the desk; exact x positions are chosen at build time under three hard rules: every control at least 12 cm centre to centre from every other, everything inside the usable view at that distance (about 38 cm wide at 55 cm), nothing head-locked or behind the shoulder. If it does not fit, shrink spacing last and move controls closer to the user before shrinking size below 5 cm.
5. Hands: pinch the hourglass to start, pause or resume; pinch a coaster to choose the length; pinch the coworker's raised hand for the high-five; pinch a small Calm toggle (reduces animation to a slow breath and pen scratch); pinch Reset. No voice. No dragging is required.
6. When things show: coworker is always present but idle-calm; evidence of time is the sand; the stretch and raised hand appear only at the end of a block; the suggested coaster glows only after at least three completed blocks; the desk items appear only after high-fives.
7. Done criteria: see below.
Consent and privacy: no cameras, no people recorded, no data leaves the device. Seated only; no movement required.

## Behaviour and memory (all deterministic, no AI claim)
- Session state machine: IDLE, FOCUS, PAUSED, BLOCK_DONE (awaiting high-five), BREAK, back to IDLE. Time scale hook for tests (clearly named, off by default).
- MemoryStore (one small module, swappable): completed blocks, total focus minutes, last block length, average completed length, unlocked desk items. Stored with the Lens persistent storage API. No names, no personal data.
- Adaptation (objectively testable pure function): suggestedLength = clamp(round(avgCompleted x 1.1 to the nearest 5), 15, 50) after at least 3 completed blocks; never suggests more than 10 minutes above the last completed block; shown as a glowing coaster. Property tests: bounded, monotone in the average, deterministic, stable under repeated calls.
- Desk growth: milestones by cumulative focused minutes (for example 25, 75, 150, 300, 600 min) unlock one tiny object each; gentle, no streak punishment, no guilt copy.

## Design rules to hold
Calm bright additive palette: cyan, amber, white; no dark UI; text at most a few words ("25", "Nice"), no paragraphs. Companion built from primitives (capsule, spheres, boxes), declared as primitive placeholders, animated by code (breath, pen scribble, page turn, sip, stretch, wave). Spatial sound: soft pen scratch, page turn, chime (generated locally, no copyrighted music). Reduce-motion Calm toggle.

## Done criteria (each checkable in the preview)
1. Start: desk, coworker, hourglass, three coasters, Calm toggle and Reset are in view at real size, the central 50 cm of the desk is empty, the desk is labelled "Simulated in preview".
2. Pinching the hourglass starts a FOCUS block within one frame: the sand starts running, the coworker starts writing.
3. Pinching a coaster changes the block length (15, 25, 50) and the hourglass scale; pinching during FOCUS pauses and resumes (coworker puts the pen down and picks it up).
4. At the end of a block (using the test time hook) a chime plays, the coworker stretches and raises a hand within 1 s; the high-five pinch triggers a spark and unlocks the next desk item when a milestone is reached.
5. BREAK then IDLE: the cycle completes and the next block can start.
6. After 3 completed blocks of 25 the suggested coaster glows and the suggestion matches the pure function; Reset clears the session but keeps memory unless "forget" is used (a clearly labelled Forget pinch clears memory).
7. Calm toggle reduces coworker motion amplitude and removes the sip and page-turn actions.
8. Controls: all inside the view when seated, at least 5 cm across, at least 12 cm apart; one IK-arm reach check on the hourglass.
9. Latency: for 200 scripted interactions, time from the input event to the first frame showing the response; report p50, p95, p99 (not the average), name the machine, state it excludes GPU present and display latency; target p99 under 100 ms in the preview only; real-glasses feel unproven.
10. Node: 1000+ generated scenarios against the session state machine, adaptation function and memory serialisation (random sequences of start, pause, resume, complete, high-five, reset, forget, restart; boundary values; determinism repeats). Real counts reported; these are not LEAF tests.
11. Persistence: show whether the Lens storage survives a preview restart and report exactly what was observed; if it does not, say so and keep the memory feature labelled accordingly.

## Out of scope and not claimed
Efficacy, medical benefit, real-glasses comfort, peripheral-vision behaviour, camera or voice input, AI responses, multiplayer, any claim the product helps ADHD.

## Film (wordless, calm, pixel art, three generations, real preview footage)
Three vignettes in one visual language: a teen at a dorm desk, a millennial working from a kitchen table, an older adult writing letters at a roll-top desk. Each starts distracted, each puts on glasses (a quiet moment), a tiny coworker appears and works, each settles into focus; a high-five; the desk grows; time passes by light changing at the window. Phone and laptop appear naturally in each scene. Then the pixel art dissolves into REAL Lens Studio preview footage of the working Lens (the majority of the runtime): hourglass flip, coworker writing, stretch, high-five, new desk item, memory suggestion. Labels: "Simulated in preview" and "Simulated head and hands: mouse". No speech, ambient generated music, no third-party trademarks. Photoreal shot only if a video-model key exists (none found): otherwise a stylised render labelled "Concept", under 15 s, never presented as the product. Under 3:00.
