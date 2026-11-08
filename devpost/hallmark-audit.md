# Hallmark and Impeccable audit of the existing 2D surfaces (2026-11-08)

Run on the user's request ("use hallmark to de-slop, and impeccable and frontend design for the best world"). Tool output below is real.

## bridge/workbench-ui.html (1,653 lines, the browser companion view)
`node D:\earthproof\lens\.claude\skills\hallmark\scripts\sloplint.mjs bridge\workbench-ui.html --genre playful` printed FAILs (first 45 shown, more exist). Failing rules and what they mean here:
- 7a pure `#fff` on 14 selectors (lines 93, 104, 192, 234, 361, 389, 486 to 488, 493, 603, 689, 697, 782).
- 10a transition on `width` (line 228, the boss meter fill).
- 19 a dash in copy (line 6).
- 20 no Hallmark stamp on the first CSS line.
- 26a no `:focus-visible` anywhere; 27 motion with no `prefers-reduced-motion` block (greps: 0 and 0).
- 30a emoji used as icons and labels on lines 800, 812, 817, 826, 831, 834, 842, 858, 863, 868, 1010, 1011.
- 33 a `<canvas>` with no aria-hidden or aria-label (line 795).
- 34 `overflow-x: hidden` on html and body (line 41).
- 48 colour literals outside tokens: 409 hex or rgb literals in the file; the font-family is declared 7 times.
Also present by grep: 8 gradients, 1 uppercase transform, 6 letter-spacing rules, a Minecraft look the new direction drops.
Impeccable's absolute bans it also breaks: side-stripe border (1), decorative gradients, and a text-wall HUD feel.
Verdict: not worth patching. Rebuild from `ART_BIBLE.md` with a single token block, or leave it out of the submission. The Lens in the Preview is the product the judges score; this page is a design reference and must be labelled one if it is ever shown.

## video/out/thumbnail-1280x720.png (viewed)
- It is an HTML mock labelled "SPECTACLES AR PREVIEW", not a Lens Studio frame. Using it as Preview imagery would be a false claim. Replace it with a real MCP Preview frame.
- Dark navy ground: black is transparent on the additive display, so it misrepresents how the product looks on glasses.
- Bracketed tags ([PASS], [FAIL], [AGT], [CHG]) and tracked capitals read as a debug log, and labels overlap in the lower left of the scene.
- A text-heavy right-hand card (about 60 words) competes with the world, against the "no permanent panel covering the world" rule.
- A hash "81a68b" shown as proof is decoration; no meaning for a viewer.
- Three type styles and two accent borders per card; the nested box-in-box is a card inside a card.

## README hero, Devpost copy, title cards
Not yet audited. After the art bible is applied and real Preview frames exist: audit them with Hallmark's floor (no invented metrics, no eyebrows, no tracked capitals, about 80 words a screen) and Impeccable's copy rules (no em dashes, no buzzwords, verb plus object on buttons).

## Decisions
1. The look changes to the Pixel World in `ART_BIBLE.md`; tokens, shapes and the three voices are defined there and in `simple-language.json`.
2. The workbench HTML is retired from the submission unless rebuilt against the floor.
3. The thumbnail and all film imagery must come from real Preview frames, with pixel-art title cards drawn from the same tokens.
4. Re-run sloplint with `--render` on anything that stays, until it prints no FAIL.
