# Ideation audit (2026-11-08, written ~03:00 UTC)

Scores are my own judgement against the anchors below, not measured data and not judges' views. The point is a transparent elimination, not false precision.

## Filters (from the entrant, all mandatory)
1 Not replaceable by ChatGPT/Gemini/phone photo. 2 Hook in 5 seconds, almost no reading. 3 Physical, visual, satisfying; no dashboards or chat UI. 4 Credible repeat-use loop (hypothesis kept apart from measured demand). 5 Real unmet need or exceptional fun. 6 Safe in cluttered homes (seated or bounded tabletop, no running or dodging, no safety-certification claims). 7 Socially normal. 8 Differentiated, with prior art stated honestly. 9 Full-feeling and polished, real working Lens. 10 Achievable with the SPECS SDK in the remaining hours.

## Scoring anchors (0 to 5 each, 9 dimensions, max 45)
- Demand: 0 none found, 3 credible anecdotes or surveys, 5 large independent measured demand.
- Irreplaceable spatial value: 0 a phone does it equally, 3 phone does it worse, 5 impossible without world-anchored hands-free presence.
- Originality after prior-art check: 0 many direct clones, 3 category exists but this implementation or niche is thin, 5 no comparator found after real search.
- Safety and social: 5 seated, no body risk, subtle; 0 fast movement or awkward in public.
- First-five-seconds delight, Repeat use: 5 strongest recurring driver.
- Testability: 5 deterministic core plus LEAF-drivable interactions.
- Feasibility in about 40 hours with primitives and no network: 5 certain.
- Official-criteria fit: average of Design, Technical, Innovation, Presentation expectation.

## Twelve concepts and the verdict
| # | Concept | D | S | O | Sa | H | R | T | F | C | Sum | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Tandem**: a miniature coworker sits and works on your desk during focus blocks | 4 | 3 | 3 | 5 | 4 | 4 | 4 | 4 | 4 | **35** | **Chosen** |
| 2 | Daily tactile 3D puzzle (Wordle-style seed) | 3 | 2 | 2 | 5 | 4 | 5 | 4 | 4 | 3 | 32 | Fails filter 1 spirit: a phone puzzle does the same; puzzle winners abound |
| 3 | Head-tracked strength coach | 4 | 3 | 2 | 2 | 4 | 4 | 4 | 4 | 3 | 30 | Fails filters 6 and 7 (body movement in cluttered homes, awkward in public); fitness Lenses already placed |
| 4 | Visual timer on the desk | 3 | 2 | 1 | 5 | 3 | 4 | 5 | 5 | 2 | 30 | Time Timer app and clones: phone substitutes fully; folded into Tandem as the hourglass |
| 5 | Per-pan cooking timers and steps | 5 | 4 | 1 | 4 | 3 | 4 | 3 | 3 | 3 | 30 | The concept video's own worked example: certain to be crowded |
| 6 | Fidget tray (silent tactile toys) | 3 | 2 | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 29 | Efficacy unproven, pinching air looks odd in public |
| 7 | Zen sand garden for wind-down | 3 | 2 | 2 | 5 | 4 | 3 | 3 | 4 | 3 | 29 | Wellness Lenses exist (a wellness Lens placed in challenge #10); phone substitutes |
| 8 | Memory palace spatial flashcards | 3 | 4 | 3 | 5 | 3 | 4 | 2 | 2 | 3 | 29 | Needs persistent spatial anchors, which the preview cannot show |
| 9 | EarthProof Home Check (door and ramp) | 2 | 4 | 3 | 4 | 3 | 1 | 4 | 4 | 3 | 28 | Rejected by the entrant: people measure and ask general AI; one-off use; safety claims |
| 10 | Task tokens on the desk | 3 | 2 | 1 | 5 | 3 | 4 | 4 | 4 | 2 | 28 | To-do apps substitute |
| 11 | Flat-pack assembly guide | 4 | 4 | 2 | 4 | 3 | 1 | 3 | 2 | 3 | 26 | Needs recognising real parts; not daily |
| 12 | Origami fold guide | 3 | 3 | 2 | 5 | 3 | 2 | 3 | 2 | 3 | 26 | Needs recognising real paper; not daily |
Also already rejected by the entrant before this audit: Circuit Coach, EarthProof rover Ramp Climb (kept only as the tagged fallback), RELAY, UNKNOWABLE/GroundTruth, ROOMSHIFT.

## The replacement test for Tandem (filter 1)
The strongest substitutes are a "study with me" video on a second screen, a human session on Focusmate, and a chatbot telling you to start. Tandem is not claiming to beat a human partner. What the substitutes cost: a video occupies screen space and attention and has ads; Focusmate needs scheduling and being on camera; a chatbot offers advice, not a presence. Tandem costs no screen space, starts in one pinch, has no camera and no scheduling, and carries your own progress. If someone needs a real person, Focusmate is better, and the README says so.

## Red-team pass (attempt to disprove Tandem)
- "It is a pet like Peridot." Peridot Beyond is an outdoor AI companion and guide on Spectacles (Niantic). Tandem is a seated work-session companion with no AI claim. Closest precedent is real; the difference is purpose and the work-rhythm loop. See PRIOR_ART.md.
- "Does a simulated person even help?" Evidence is thin: a small VR preprint (12 participants) found faster task completion with a body double and an AI double about as good in one summary; a vendor survey is promotional; a 2026 roadmap paper says mixed-reality body doubling has few prototypes and needs studies. Tandem makes no efficacy claim. It is a hypothesis to test, not a treatment.
- "Peripheral presence cannot be shown in a video." True. The film shows the work loop, the pinch interactions and the desk growing, and it states plainly that real-glasses peripheral feel is unproven.
- "The narrow field of view." SPECS view is about 46 degrees diagonal (claimed); the companion sits at the edge of the view beside the work area, never in front of it. Unproven on hardware.
- "It might distract." Calm mode reduces animation to a slow breath and a pen scratch; one pinch hides the companion.
- "Preview limits." No camera, voice, network or AI is used or claimed. Persistence across sessions is implemented with Lens storage and tested in Node; whether the preview keeps it across restarts is verified and reported, not assumed.
- "Judges see calm products as low wow." Mitigation: tactile hourglass flip, satisfying high-five, desk that visibly grows, and a wordless film that sells the feeling. Risk remains.

## What I could not do
- The files named in the entrant's prompt (RELAY, UNKNOWABLE and the pasted-text files) were not found on this PC; see SOURCE_INVENTORY.md.
- I did not read the Devpost gallery (unpublished) or the concept video transcript.
