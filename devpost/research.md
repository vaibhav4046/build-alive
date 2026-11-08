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

## The everyday problem (why the same maths matters outside a robotics club)

| Claim | Source |
|---|---|
| Steeper ramps raise the effort to push or propel a wheelchair, for users and caregivers. A 2018 bus-ramp study reported peak pushrim force rising from 107 N at 3.5 degrees to 230 N at 15 degrees. Small samples, lab settings. | https://informahealthcare.com/doi/full/10.1080/17483107.2018.1465602 |
| A Korean study of healthy adults found pulse rate and push time rose as slope went from 1:12 to 1:6. Samples of 7 to 30, mostly healthy adults. | https://pmc.ncbi.nlm.nih.gov/articles/PMC4305601 |
| The 2010 ADA Standards cap an accessible ramp's running slope at 1:12 (8.33%), with limited exceptions for existing facilities. Third-party copies were read; verify against the official text. | https://www.access-board.gov/ada/guides/chapter-4-ramps-and-curb-ramps/ |

Our model's numbers are not those studies' numbers: it is a simplified teaching model, and the pushrim figures above include dynamic effects ours does not. We use these sources only for the direction (effort rises steeply with slope) and the 1:12 reference. Phase 2 wording on screen: "estimate for learning, not a safety certification".

## What exists already (so we claim no novelty we lack)

| Claim | Source |
|---|---|
| PianoVision (Meta Quest) and Simply Piano (Apple Vision Pro) already overlay guidance on real pianos in headsets, so a piano-coach Lens would not be new. | https://www.uploadvr.com/pianovision-app-lab-release/ , https://apps.apple.com/us/app/6503691129 |
| A survey of AR and VR piano systems reports key-highlight guidance was hard for learners who must anticipate notes. | https://www.frontiersin.org/articles/10.3389/frvir.2023.1207397/pdf |
| Reported past Spectacles community winners include skill-teaching Lenses (an EpiPen training Lens, a barcode nutrition app). Search summaries; verify before quoting. | https://developers.snap.com/spectacles/spectacles-community/hackathon-showcase , https://voicesofvr.com/1675-2nd-place-spectacles-lensathon-team-cartdb-barcode-scanning-nutrition-app |
| Evidence that sports overlays on glasses improve outcomes is mostly vendor marketing; one December 2025 preprint (not peer-reviewed) supports usability value across training, sport, accessibility and consumer domains. | https://www.preprints.org/manuscript/202512.2306/v1 |

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
- The Devpost pages returned HTTP 403 to plain fetches on 2026-11-08, but the overview, Resources and Project gallery pages were read in a browser pane the same day. The four judging criteria (Design, Technical Implementation, Innovation/Idea, Presentation) are as printed on https://learn-specs.devpost.com/ . The project gallery was unpublished that day, so there is no comparison with live entries. The concept video (https://youtu.be/S6w4aRVGQxs) was not watched or transcribed; its design rules are mirrored in the plan-lens skill references.
- No list of CLAD-built winning Lenses was found.
- No claim is made about other entries (see `competition.md`).
- No real-glasses behaviour (comfort, hand tracking, true latency) is claimed anywhere.
