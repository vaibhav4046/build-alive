# Demo film plan (wordless, under 2:45)

Output: `video/out/earthproof-demo.mp4` (1920x1080, 30 fps) and a 1280x720 thumbnail. No speech. Soft ambient bed generated locally by `devpost/tools/gen-ambient.mjs` (sine pads, no samples, no network). Captions only where honesty requires them.

## Rules the film follows
- **Never fake the Lens working.** Every shot of the Lens is real Lens Studio preview footage recorded with `ffmpeg gdigrab` while the Lens ran. The pixel-art scenes are *illustrations* and are captioned as such.
- Any simulated element in the footage keeps its "Simulated in preview" label on screen.
- No photoreal shot: there is no video-model key (`VIDEO_API_KEY`) in this project, so the one "what it could feel like" shot is a **stylised pixel render, captioned "Concept: stylised, not product footage"**, 7 s, never presented as the product.
- Claims limited to what was run: "Shown working in the Lens Studio preview only. Not yet tested on glasses."

## Shots (seconds on the final timeline)
| Time | Shot | Read from actions alone |
|---|---|---|
| 0:00-0:03 | Night sky, a tiny pair of glasses fades in | Calm opening, no words |
| 0:03-0:20 | **Teen (robot club).** Rover drives up a ramp, stalls on the steep part, red "!" bubble. Phone: camera view, "?" bubble. Laptop: flat chart, "?" bubble. Glasses go on: red beam from the stall marker to the motor block, two bars (need long, has short). A bigger cyan block flies from the tray onto the rover. The rover climbs. Tick badge "2.1x". Cheer. | Phone and laptop only look at the problem; the glasses point at the cause |
| 0:20-0:37 | **Millennial (home).** Plant on a shelf sags on a thin bracket, "!" bubble. Phone, laptop, glasses as above. Beam from the sag to the bracket. Thick cyan bracket flies up, the shelf levels, tick badge. | A choice proven in the room |
| 0:37-0:54 | **Older adult (garden).** Motorised cart with a heavy pot stalls on the ramp to the shed. Same three devices. Beam to the motor, swap, the cart climbs, tick badge. | Same idea, different person and place |
| 0:54-2:14 | **Real Lens footage.** The pixel scene dissolves through three pixelation levels into the real preview: layout (table, ramp, rover, tray, "Simulated in preview"), Run with Small, stall, evidence card and beam, drag the Geared block onto the mount, Run again, proof card, Reset. Caption: "Real Lens Studio preview footage". | The product, working |
| 2:14-2:21 | **Concept** (stylised visor view of the stalled course). Caption: "Concept: stylised, not product footage". | Clearly labelled, not footage |
| 2:21-2:34 | End card: three characters with tick badges, "EarthProof", tagline, "Shown working in the Lens Studio preview only. Not yet tested on glasses." | Honest close |

Total 2:34, under the 2:45 limit and the Devpost 3:00 limit.

## Production notes
- Built with HyperFrames (HTML/canvas, 320x180 internal canvas scaled 6x with nearest-neighbour). Scenes are pure functions of time, so every render is identical.
- The real footage is pre-processed with ffmpeg into three pixelation levels (nearest-neighbour downscale then upscale) that cross-fade into the clean footage; the originals are not retouched.
- Checks before delivery: `npx hyperframes check`, length under 3:00, `ffmpeg blackdetect`, audio levels with `ffmpeg loudnorm` (measured, not heard).
- YouTube upload and the public link are the entrant's step.
