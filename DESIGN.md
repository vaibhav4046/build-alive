---
name: BUILD ALIVE
description: Watch your AI build software as a living voxel valley on Snap Spectacles, then understand and approve it.
colors:
  grass-meadow: "#70bc54"
  grass-bright: "#80ca5c"
  grass-shade: "#62ac4c"
  earth-dirt: "#9c6e46"
  earth-dirt-deep: "#7c563a"
  stone: "#9c9ca6"
  stone-deep: "#767684"
  sand-bank: "#e8d098"
  river-water: "#54acec"
  river-foam: "#96d6fa"
  peak-snow: "#f2f6fc"
  timber: "#ac7a4c"
  timber-deep: "#7c5636"
  leaf: "#489e4a"
  leaf-bright: "#64b856"
  roof-workshop-red: "#d65c48"
  roof-cottage-blue: "#5484cc"
  roof-barn-teal: "#40aca0"
  plaster: "#f0e4cc"
  brick: "#c07252"
  granary-gold: "#f8c84c"
  window-glow: "#ffdc80"
  builder-cyan: "#60def2"
  status-broken: "#ff7062"
  helper-violet: "#b088f2"
  status-ok: "#74e8ac"
  cloud: "#fcfcff"
  flower-pink: "#fa98c0"
  flower-yellow: "#ffe868"
  skin: "#f2c698"
  ink-shadow: "#424656"
  pine: "#327c54"
  ui-text: "#fffaf0"
  ui-caption: "#dbe6f5"
  ui-changed: "#ffcc59"
typography:
  card-title:
    fontFamily: "Lens Studio default sans (Text component)"
    fontSize: "38 Text size units"
    fontWeight: 600
    lineHeight: 1.1
  card-body:
    fontFamily: "Lens Studio default sans (Text component)"
    fontSize: "28 Text size units"
    fontWeight: 400
    lineHeight: 1.25
  label:
    fontFamily: "Lens Studio default sans (Text component)"
    fontSize: "30 Text size units, billboarded"
    fontWeight: 600
  caption:
    fontFamily: "Lens Studio default sans (Text component)"
    fontSize: "18-22 Text size units"
    fontWeight: 400
  film-pixel:
    fontFamily: "monospace, drawn on a 480x270 pixel canvas at 4x"
    fontSize: "8 px glyph cell"
rounded:
  dock-pill: "full (UIKit Pill shape)"
  card: "UIKit BackPlate default"
spacing:
  voxel-terrain: "2cm"
  voxel-prop: "0.5cm"
  voxel-worker: "0.25cm"
  card-pad: "0.8cm"
  card-row-gap: "0.2cm"
  dock-pitch: "6.2cm"
components:
  dock-pill:
    backgroundColor: "UIKit SnapOS2 PrimaryNeutral"
    textColor: "{colors.ui-text}"
    rounded: "{rounded.dock-pill}"
    size: "5.4cm x 2.8cm"
  dock-pill-primary:
    backgroundColor: "UIKit SnapOS2 Primary"
    textColor: "{colors.ui-text}"
    rounded: "{rounded.dock-pill}"
  glass-card:
    textColor: "{colors.ui-text}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
    width: "17cm"
  hover-label:
    textColor: "{colors.ui-text}"
  status-word-changed:
    textColor: "{colors.ui-changed}"
  status-word-broken:
    textColor: "{colors.status-broken}"
---

# Design System: BUILD ALIVE

## 1. Overview

**Creative North Star: "A valley you can read"**

BUILD ALIVE is a calm, warm miniature valley that sits in front of you on Snap Spectacles. Your real repositories float above it as islands; each module of the chosen repo stands on the village plateau as a building whose shape says what kind of code it is. Small voxel workers walk to the building an agent event touched. The world carries the story; words appear only when you look at something or ask.

The display is additive: black is transparent and dark tints vanish, so the system is built from bright, sunlit fills and light text, never dark panels. Depth comes from layers in space (a near ledge with a waterfall, the village, rolling hills, snowy peaks, drifting clouds), not from shadows or glass.

It must not feel like a debug dashboard, a neon hacker screen, a Minecraft look-alike, a toy that hides facts, or a slide deck floating in the air.

**Key Characteristics:**
- One original voxel language, three scales (terrain 2 cm, buildings and props 0.5 cm, workers 0.25 cm).
- A single palette texture: every surface takes its colour from the same 32 swatches, lit by the scene lights.
- Text on demand: names on hover, one small glass card on pinch, engineer detail only behind "Details".
- Honest motion: every movement comes from a real event, or the caption says REPLAY or Sample world.

## 2. Colors: The Sunlit Valley Palette

A full palette of 32 swatches held in one texture (`PALETTE` in `Assets/Scripts/BuildAliveVoxel.ts` is the source of truth; the frontmatter mirrors it). Colour carries meaning first, decoration second.

### Primary
- **Grass Meadow** (#70bc54) with **Grass Bright** and **Grass Shade**: the ground the eye rests on. Varied per voxel so large areas never look flat.
- **River Water** (#54acec) and **River Foam** (#96d6fa): the only moving blue, used for the river, the waterfall and island streams.

### Secondary
- **Role roofs**: Workshop Red (#d65c48) = code, Cottage Blue (#5484cc) = screens, Barn Teal (#40aca0) = files and pictures, Granary Gold (#f8c84c) = stored data. The watchtower (checks) and windmill (connections) are stone and plaster and read by silhouette.
- **Window Glow** (#ffdc80): warm light in every doorway and window; the village always looks inhabited.

### Tertiary
- **Builder Cyan** (#60def2) and **Helper Violet** (#b088f2): the two kinds of worker (main agent, helper agent). Also told apart by hat (gold hard hat vs white cap), never by colour alone.

### Neutral
- **Stone / Stone Deep / Earth Dirt / Timber / Plaster / Cloud**: cliffs, foundations, frames, clouds. Snow (#f2f6fc) caps the far peaks.

### Named Rules
**The Additive Rule.** Nothing that matters may be dark. Ink Shadow (#424656) is only for eyes and legs at 0.25 cm scale.
**The Status Rule.** Status is always a word first (OK, Changed, Working on it, Broken), then a colour (Changed amber #ffcc59, Broken coral #ff7062, OK mint #74e8ac).

## 3. Typography

**Display Font:** Lens Studio default sans (Text component)
**Body Font:** the same, by weight
**Label/Mono Font:** none in the Lens; the film's pixel titles use a monospace glyph grid.

One family, contrast by size and weight. Sentence case everywhere. No all-caps sentences, no emoji.

### Hierarchy
- **Card title** (600, size 38): one line, the thing you pinched in plain words ("Scripts · code workshop · EarthProof").
- **Card body** (400, size 28): one or two sentences in the simple voice.
- **Card detail** (400, size 22-26, caption colour): the maker voice, still plain.
- **Engineer rows** (400, size 18-22): paths, event IDs, diffs, provenance. Only after "Details".
- **Hover label** (600, size 30, billboarded): a name and its role, never a sentence.

### Named Rules
**The One-Card Rule.** At most one card in view. Never a permanent panel, never nested cards.

## 4. Elevation

Flat in the material sense: no drop shadows, no glass used as decoration. Depth is spatial: ledge, village, hills, peaks, sky. The only glass is the single UIKit BackPlate card, shown on pinch.

### Named Rules
**The Layers-Not-Shadows Rule.** If something needs to feel closer, move it closer in space.

## 5. Components

### Dock pills
- **Shape:** UIKit SnapOS2 Pill, 5.4 x 2.8 cm, centres 6.2 cm apart, tilted up toward the eye, in a dock below the world (y = -32 cm, z = -42 cm).
- **Labels:** plain words: Start over, Details, Next, Explain, Approve. "Next" and "Approve" are the primary style.
- **Placement rule:** no control may sit on a sight line between the eye and a building or island.

### Glass card
- **Shape:** one UIKit BackPlate, 17 cm wide, upper left of the village, billboarded.
- **Rows:** title, plain sentence, plain detail; then engineer rows only after "Details".

### Hover labels and status words
- Billboarded, hidden by default, shown on hover, when selected, or when the state is Changed or Broken.

### Buildings (one per real module, by role)
- Code workshop (brick, red roof, smoking chimney), watchtower (stone, lamp), barn (timber, teal roof), windmill (spinning sails), granary (banded silo, gold cone), cottage (plaster, blue roof, flower boxes). Height grows with the module's real file count.

### Islands
- Floating rock with a grass top, one tiny house per real module cluster, a stream and waterfall. The made-up Sample World has a violet crystal spire and no houses.

## 6. Do's and Don'ts

### Do:
- **Do** let the valley fill the view; the world's edges should run past the edges of the glasses.
- **Do** say LIVE only for a real agent event; otherwise say REPLAY or Sample world.
- **Do** label a guessed cause as a guess ("Likely cause (a guess, not proof)").
- **Do** keep every pinch target at least 5 cm across.

### Don't:
- **Don't** use dark panels, black slabs or dark text: the additive display shows them as nothing.
- **Don't** show debug tags like [CHG], LOCAL_RECORDED_REPLAY or "FAILURE ALERT" in the simple voice.
- **Don't** copy Minecraft textures, blocks, characters or UI; the voxel style here is original and palette-driven.
- **Don't** put Meta or Ray-Ban glasses in any film or image; the hardware is Snap Spectacles.
- **Don't** use gradient text, glassmorphism as decoration, side-stripe borders, identical card grids, or uppercase eyebrows on Devpost or README surfaces.
