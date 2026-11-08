# BUILD ALIVE art bible: the Pixel World (2026-11-08)

Direction from the user: one pixel-art game world, used like a Jarvis, where any agent session is visible, understandable at five-year-old level, and can be attended, explored deeply, conducted and finished end to end, in AR. This replaces the voxel/Minecraft look. It was written against the Hallmark floor, Impeccable's absolute bans and the frontend-design brief; the audit that motivated it is in `hallmark-audit.md`.

## Scene sentence (who, where, which light)
A developer sits at a desk in a normal room, glasses on, a real agent session running in a terminal they can barely read. In the glasses, beside the keyboard, a small sunny harbor island shows what the agent is doing: little workers walking, tools lifting, a lighthouse checking. A child sitting next to them could follow it. Ambient light is a real room, so the display is additive: black is invisible, so the world is built from bright fills and never from dark panels.

## What makes it ours (the one memorable thing)
The agent is a person you can watch. Pip the builder walks along a winding Journey Path from the Wish flag to the Done flag; every real event is something Pip visibly does at the matching building. The path is the end-to-end session: Wish, Plan, Work, Check, Done. Hollow dotted stretches mean "not happened yet" or "unknown". Nothing moves unless a real event (or a labelled replay) moved it.

## Colour strategy: committed, bright, no dark
One saturated colour (harbor blue) carries the water and every panel; accents are signals, each with a shape so colour is never alone (colour-blind safe). No cream, sand, parchment, terracotta, acid-green-on-black, glass, gradients or glow-as-decoration. Pure white is never used.
| Token | Hex | Role |
|---|---|---|
| `--harbor` | #2863CC | water and every panel fill (white-ish text on it is 5.2:1) |
| `--harbor-lit` | #6FB3FF | water highlights, selection ring |
| `--ink` | #F2F8FF | all text |
| `--ink-dim` | #B9D4F5 | secondary text, dotted "unknown" outlines (check contrast in the Preview before use) |
| `--leaf` | #43C96E | land |
| `--leaf-deep` | #2F9E55 | land edges, paths |
| `--pip` | #FFC72C | main agent (Pip) |
| `--mo` | #FF7BBF | helper agents (Mo) |
| `--owl` | #A98BFF | checker (Owl, test lighthouse) |
| `--pass` | #5CF2A4 | success, always with a star shape |
| `--fail` | #FF5A52 | failure, always with a crack shape |
| `--wait` | #8EE6FF | running or pending, always with a moving dot |
| `--replay` | #3DDBD0 | replay, always with a rewind arrow |
| `--boss` | #FF9A3D | the approval lever and gate (you) |
Declare each once in one place (Lens: one material table; HTML: `:root`; film: one JS object). No colour literal anywhere else.

## Pixel rules
- Base sprite 16 by 16, building 32 by 32; textures use nearest-neighbour sampling, no smoothing, no mipmap blur. In the Lens one art pixel is 0.5 cm at the seated viewing distance (a default: confirm in the Preview and write the final number in the build log).
- Two light steps per colour, a 1-pixel outline in the deeper tone of the fill (outlines vanish on additive glass, so shape must still read from fills alone).
- Original art only: no Minecraft textures, UI, models, logos or sounds; no provider logos (providers appear as a plain letter badge and their name in text).

## World structure: three scales, one anchor, seated
1. Harbor (default, desk scale about 45 cm across): one island per real approved project, labelled with its real repo name, floating in the water. Pinch one to dive in.
2. Town: the project's real modules as small houses, real imports as roads, real test suites as lighthouses. Houses differ by kind: module house, library (docs), crane (build scripts), vault (data), shop (UI), lighthouse (tests). Labels only when focused.
3. Inside: a single building opens like a dollhouse to show the real file (diff, command or test) on a bright panel.
No walking, no room-scale: zoom and focus only. Everything stays inside the glasses' view while seated; no permanent panel covers the world.

## The four verbs (the Jarvis)
- Look: the world alone tells the story (little text).
- Ask: pinch Pip, a building or the Owl. One simple sentence (from `simple-language.json`), then one pinch for the exact evidence.
- Attend: follow a session end to end on the Journey Path; step, pause and rewind with a physical Rewind Crystal (replay is always marked).
- Conduct: pick a preset job (Run the tests, Explain this file, Fix the failing test), see the plan on the gate, and only the Boss lever approves. Read-only is the default; nothing writes without a separate approval and a shown receipt.

## Three voices, one truth
Little (five-year-old): the `kid` line, a picture, a sound. Maker (default): the `maker` line. Engineer: the exact path, command, exit code, diff, duration and event id. The kid and maker lines translate evidence and never replace it; every line comes from `simple-language.json` and only exists if its event exists. No line ever says a model thinks, wants or decided.

## Type
- Lens: text uses a clean Lens Studio font chosen with the font-selector skill, in light ink on a harbor panel; pixel lettering only for a few large titles drawn as texture. Sizes are set by looking at a Preview screenshot at the seated distance, not by number; defaults to start from: 1.2 cm x-height for body, 2 cm for labels (defaults, to be confirmed).
- Companion view and film title cards: one original 5 by 7 bitmap font drawn on canvas at an integer scale of 3 or more (no download, nothing to license); sentence case, untracked, never all capitals for labels.

## Motion and sound
- Calm by default: a narrated step holds until the user advances it or at least six seconds; no auto-advancing walls of text. Pip walks at a pace a child can follow.
- Reduced-motion mode swaps walking for a two-frame hop and holds still otherwise. Every animation has this fallback.
- Sound: short original tones generated locally (pen, brick, latch, chime), one per event kind (see `sound` in the JSON). A Quiet mode silences all of it. No music under the narration.

## Accessibility
High-contrast, reduced-motion, quiet and colour-blind-safe modes. Every signal pairs colour with a shape (star, crack, moving dot, rewind arrow). Targets at least 5 cm across and at least 12 cm apart (the SIK rule). Nothing essential is hidden or needs voice; voice is optional and always has a button.

## Honesty rules the art must keep
- Live, replay and sample are visibly different on every scene (moving dot, rewind arrow, dotted outline). A replay is never styled as live.
- An unresolved detail is a hollow dotted outline and the word "unknown", never an invented class, edge, agent or failure.
- A concept shot in the film is labelled "Concept". Only a real Lens Studio Preview frame may be labelled or used as Preview footage.

## Hallmark floor, applied to anything on a web page (companion view, film cards, README hero)
Tokens at `:root` only; no transition on all, none on width/height/top/left; `:focus-visible` on every control; `prefers-reduced-motion` fallback; `overflow-x: clip` on html and body; no emoji as icons, no eyebrows, no tracked capitals, no middle-dot meta strings, no arrows glued to link text, no status dots as decoration, no nested cards, no gradients, no invented numbers; the Hallmark stamp is line 1 of the CSS; run `node .claude/skills/hallmark/scripts/sloplint.mjs <file> --render` and fix every FAIL.
