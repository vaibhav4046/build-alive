# Research: only claims with a source

Every factual claim below has a URL. Anything without a source is labelled as an assumption or a design choice, and is not presented as fact anywhere else in this project.

## Physics behind the teaching model

| Claim | Source |
|---|---|
| Holding or pushing a load up an incline without friction needs a force equal to the load's weight times sin(angle). | https://en.wikipedia.org/wiki/Inclined_plane |
| With friction, uphill motion needs more force; the page gives the mechanical advantage as 1 / (sin θ + μ cos θ), so the demand is proportional to (sin θ + μ cos θ). | https://en.wikipedia.org/wiki/Inclined_plane |
| Rolling resistance force is F = Crr x N, where N is the normal force. | https://en.wikipedia.org/wiki/Rolling_resistance |
| Typical Crr on hard surfaces: car tyres about 0.006 to 0.015, bicycle tyres about 0.002 to 0.005, steel wheel on steel rail about 0.001 to 0.0015. | https://en.wikipedia.org/wiki/Rolling_resistance |
| A gear reduction trades speed for torque: the torque ratio equals the speed ratio, so a higher reduction gives more torque and lower speed. | https://en.wikipedia.org/wiki/Gear_train |

How the model uses them: wheel torque needed on a slope = m x g x (sin a + Crr x cos a) x r. That is the inclined-plane force with a rolling-resistance term, multiplied by the wheel radius to turn force into torque.

### Assumptions that are NOT sourced (they are teaching values)
- Rover mass 0.60 kg, wheel radius 3 cm, two driven wheels, Crr 0.03. The 0.03 is higher than the hard-surface tyre values above on purpose, to stand in for small toy wheels on a table or carpet. It is a design choice, not a measurement.
- Motor torque 2.0 N.cm each at 150 rpm, a 5:1 gearbox at 85 % efficiency. The 85 % figure is an assumed round number; the Gear train page gives no efficiency figure (it assumes no losses).
- The 10 and 25 degree ramp sections were chosen so the Small motor passes one and stalls on the other.

The on-screen cards say "simplified teaching model, not a datasheet". It is not a motor datasheet and makes no claim about any real product.

## Platform facts

| Claim | Source |
|---|---|
| The 2024 Spectacles have a 46 degree diagonal field of view (Snap's claimed spec). The earlier generation was about 26 degrees. | https://www.auganix.org/ar-news-snap-spectacles/ , https://vrarwiki.com/wiki/Snap_Spectacles_2024 |
| A separate source reports 51 degrees for Snap's consumer SPECS glasses, a different product. | https://ppc.land/specs/ |
| LEAF is an automated testing framework for SPECS Lenses; scenarios are TypeScript that simulate user actions and then assert on live scene state; it installs from the Asset Library and depends on the Spectacles Interaction Kit. | https://developers.specs.com/docs/clad/tools/test-your-lens-with-leaf |
| CLAD is the coding-agent toolkit for building SPECS Lenses and includes LEAF commands. | https://developers.specs.com/docs/clad/overview-section/how-clad-works |

Why the field of view matters here: it is why the whole course is laid out side-on and compact (about 69 cm from the rover's rear to the end of the landing), and why this project does not claim the whole scene is visible at once on hardware. Real-glasses framing is unproven.

## Inspiration (disclosure, not a source for any feature)

Kodro, as described on its Product Hunt listing, is a free, offline-first place to design a robot, write Python and watch it attempt a task in a visual world, with guided lessons, from a University of Liverpool MSc project: https://www.producthunt.com/products/kodro . EarthProof takes only the broad idea that a failed attempt in a simulated world teaches more than a diagram. It copies none of its code, assets, lessons or design, and I found no official Kodro site, so the listing above is the only source I read.

## What I could not verify
- The Devpost pages for the hackathon (learn-specs.devpost.com and /resources) returned HTTP 403 to automated fetches on 2026-11-08, so the judging criteria used in `review.md` (Design, Technical Implementation, Innovation, Presentation) are taken from the entrant's own brief, not from a page I read.
- No claim is made about other entries (see `competition.md`).
- No real-glasses behaviour (comfort, hand tracking, true latency) is claimed anywhere.
