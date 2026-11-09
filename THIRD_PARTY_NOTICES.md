# Third-party notices

EarthProof is a Lens Studio project. It uses the following components that it did not write. None of them is modified, and none is presented as original work.

| Component | Where it comes from | How it is used | License |
|---|---|---|---|
| Lens Studio 5.23.2 (editor, preview, MCP server) | Snap Inc. | Authoring, preview, recording | Snap's Lens Studio terms (not reproduced here) |
| Spectacles Interaction Kit (`SpectaclesInteractionKit.lspkg`) | Snap Inc., from the SPECS Base Template | Pinch/drag interaction (`Interactable`, `InteractableManipulation`), `Billboard` | Shipped inside the package; no separate license file is present in this project, so check Snap's terms |
| Spectacles UI Kit (`SpectaclesUIKit.lspkg`) and its Motion dependency | Snap Inc., from the template | Run / Reset buttons, card backplates, flex layout | As above |
| LEAF (`Leaf.lspkg`) | Snap Inc., Lens Studio Asset Library | Integration tests in the preview | As above |
| AI Preview Agent Inspect / Interact (`AiPreviewAgent*.lspkg`) | Snap Inc., Lens Studio Asset Library | Lets the agent query and drive the running preview | As above |
| CLAD plugin skills (`ls-clad`) | Specs Inc., headers state Apache-2.0 | Followed as the build workflow; no CLAD source is copied into this repo | Apache-2.0 per the file headers |

I could not find a license file inside the `.lspkg` packages, so I am not stating a license for them. They are installed from Snap's own distribution channels for this project, under Snap's terms.

## Brand marks shown in the Lens (nominative use only)
The Lens shows a small logo next to an agent's name so people can recognise which app a session belongs to. This is identification only: it does not mean any of these companies sponsors, endorses or is affiliated with BUILD ALIVE. **All trademarks and logos belong to their respective owners.** Marks are drawn from the `simple-icons` package (version 16.37.0, https://simpleicons.org, package released under CC0-1.0); `simple-icons` states that its CC0 release does not by itself license the individual brand marks, and it carries no licence data for the two below, so they are used as trademarks only. Each mark keeps its official colour (never recoloured) and is placed on a white badge so it stays visible on an additive display.

| Mark | Source | Official colour | Where used |
|---|---|---|---|
| Claude (Anthropic), for the Claude Code session | `simple-icons` `siClaude`, source https://claude.ai | `#D97757` | Session window header (when Claude Code is selected), Claude Code chip in the agent row |
| OpenCode, for the OpenCode station | `simple-icons` `siOpencode`, source github.com/anomalyco/opencode (`packages/identity/mark.svg`) | `#000000` (white badge) | OpenCode chip in the agent row, Session header when OpenCode is selected |

**Product names and logos are trademarks of their respective owners, used only to identify compatible tools; no affiliation or endorsement.** A third mode, `LOGO_MODE = "brand-tinted"`, draws the unmodified `simple-icons` mark geometry (Claude, OpenCode only), re-coloured in a vivid tint on a frosted-glass face (`devpost/tools/render-tinted-logos.cjs`); providers without a `simple-icons` mark keep their vivid letter badge. Recolouring is the only change; no shape is redrawn or distorted.

**Default is monogram mode** (`LOGO_MODE = "monogram"` in `BuildAliveSceneUI.ts`): every chip and the Session header show a one- or two-letter monogram (CC, Cx, AG, OC...) in a generic accent colour, so no third-party mark appears in the submitted video or default build. The real marks below are only drawn when a user sets `LOGO_MODE = "brand"` locally; none of the film footage or submission screenshots use them.

The agent row under the Session window has one chip per provider the local bridge reports (`GET /providers`). A chip's small dot is its honest status (green LIVE, amber REPLAY, grey OFFLINE, grey with a slash UNSUPPORTED); a chip is a selector only and never means the company endorses or is connected to this Lens.

Apps without a `simple-icons` entry (Codex, Antigravity, OpenClaw, ChatGPT app, Grok bots, Instinct, Muse) and Hermes (the `simple-icons` "Hermes" is a different company) get a neutral generated monogram badge (graphite square, two white letters) rendered by a script in this repository (`devpost/tools/render-logos.cjs`). No logo was scraped, redrawn or guessed.

## Project-made assets
- All meshes are Lens Studio built-in primitives (boxes, cylinders) used as **placeholders**; no third-party 3D models.
- Materials, labels and layout were made for this project.
- The sound and music in the demo film are generated locally by a script in this repository (no sampled or downloaded audio). The film's pixel art is drawn in code.

## Inspiration (not a dependency)
Kodro (https://www.producthunt.com/products/kodro) is a conceptual inspiration only: the idea that a failed attempt in a simulated world teaches. No Kodro code, lessons, assets or design were used. See `devpost/research.md`.

## AI disclosure
Built with AI assistance. The Lens scripts, scene generator, tests and documents were written by Claude Code (Anthropic) working through the CLAD workflow and the Lens Studio MCP, directed by the entrant, who reviews and submits. The AI wrote code and text; it did not run on hardware, and no claim here depends on an AI having "seen" the product work on real glasses. Test numbers in `devpost/test-results.md` are pasted from real runs.
