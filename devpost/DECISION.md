# Decision (2026-11-08 ~03:00 UTC)

**Chosen: Tandem**, "a tiny coworker sits at your desk and works while you work". Evidence in IDEATION_AUDIT.md (matrix, red team), PRIOR_ART.md and SOURCE_INVENTORY.md.

## The gap, stated precisely
- The need is real and measurable on screens: YouTube reported more than 520M views of "study with me" videos in 2023 (https://blog.youtube/culture-and-trends/study-with-me/); body doubling is widely used by people with ADHD, though independent evidence is thin (a small VR preprint, vendor surveys).
- The need is served by flat videos (screen space, ads, no interaction with you) and by scheduled human sessions (Focusmate, camera on). In AR/MR it is poorly served: research prototypes and an outdoor pet companion (Peridot Beyond), no seated work-session companion found. "Not found" is not "does not exist".
- Tandem is therefore NOT claimed as new in the world. The claim is a new implementation for this slot: world-anchored, zero screen space, instant, private, calm, with a physical start ritual and a visible record of your work.

## Why not the others
See IDEATION_AUDIT.md. Short version: the rover and Home Check were rejected by the entrant (toy, and pre-purchase checks are done on phones); the strength coach breaks the safe-in-cluttered-homes and socially-normal filters; the daily puzzle and visual timer are fully replaceable by a phone.

## Honest weaknesses we accept
- No efficacy claim: we do not claim Tandem improves focus. It is a hypothesis; the README says what a real study would need.
- Peripheral presence and comfort are real-glasses questions: unproven. The preview shows the loop, not the feel.
- A calm product has less instant wow than a game; the tactile hourglass, the high-five and the growing desk plus a wordless film carry the first five seconds.
- A human partner is stronger socially. Tandem is for when no person is available or you want no camera.

## Fallback and time guard (UTC; submission period ends Mon 9 Nov 22:00; aim to hand over by 17:00)
- Rover core is tagged `core-rover-v1` (green) in git. It is the fallback submission.
- Sun 8 Nov 03:00 to 10:00: scene, state machine, hourglass, companion, high-five; LEAF scenarios; tag `tandem-v0`.
- Sun 10:00 to Mon 02:00: memory and adaptation, sound, calm mode, 1000+ node scenarios, latency loop, judge pass 1.
- Mon 02:00 to 12:00: wordless film with real preview footage, README and docs, final clean-state runs, judge pass 2.
- Mon 12:00 to 17:00: buffer, secrets scan, submission.md, final report. The user uploads to YouTube and submits on Devpost.
- If Tandem criteria 1 to 6 are not green by Sun 22:00 UTC, stop and submit the rover fallback with the reframed pitch. Say so in the README.
