# Competition notes

**No comparison with live entries is possible.** When this was written (2026-11-08) the hackathon's Devpost gallery was unpublished, and the Devpost pages returned HTTP 403 to automated fetches (see `research.md`). So this file makes no claim about what other teams built, whether anyone else has a similar idea, or how EarthProof ranks. It does not claim originality against any specific entry, and it does not claim a place.

## What can honestly be said about the entry itself

- **One spatial moment, done end to end.** A small rover at real size climbs a two-section ramp. The Small motor stalls on the steep section; the failure is explained in the world; one part swap fixes it; a proof card records why it works.
- **The explanation is attached to the thing that failed.** The red beam runs from the stall point to the motor block on the rover, and the two numbers (needs, has) come from the same function that decided the outcome (`EarthProofSim.ts`), so the card cannot disagree with what happened.
- **Why glasses, not a phone:** the test happens at table scale in the room, hands carry the parts, eyes stay on the rover. On a phone the same content is a chart in a second place you have to look. This is the design argument in `design-brief.md`; it has not been tested with people.
- **Built through CLAD and the Lens Studio MCP, tested with LEAF and with node sweeps**, with the test numbers reported as they came out (`test-results.md`).

## What it does not have (so a reader is not misled)

- No hardware run. Real-glasses comfort, hand-tracking dropouts and true latency are **unproven**.
- No recognition of a real table or a real robot kit; the course is virtual and labelled "Simulated in preview".
- No voice, no network, no cloud AI, no live camera, no saved history across sessions.
- One trial only (the ramp). It is a teaching model, not a motor datasheet.

## Where a judge might compare it

The four Devpost criteria the entrant asked to be scored against are Design, Technical Implementation, Innovation and Presentation. Honest self-scores, with evidence and gaps, are in `review.md`. They are the author's own persona reviews, not an independent evaluation.
