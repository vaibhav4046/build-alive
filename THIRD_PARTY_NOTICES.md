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

## Project-made assets
- All meshes are Lens Studio built-in primitives (boxes, cylinders) used as **placeholders**; no third-party 3D models.
- Materials, labels and layout were made for this project.
- The sound and music in the demo film are generated locally by a script in this repository (no sampled or downloaded audio). The film's pixel art is drawn in code.

## Inspiration (not a dependency)
Kodro (https://www.producthunt.com/products/kodro) is a conceptual inspiration only: the idea that a failed attempt in a simulated world teaches. No Kodro code, lessons, assets or design were used. See `devpost/research.md`.

## AI disclosure
Built with AI assistance. The Lens scripts, scene generator, tests and documents were written by Claude Code (Anthropic) working through the CLAD workflow and the Lens Studio MCP, directed by the entrant, who reviews and submits. The AI wrote code and text; it did not run on hardware, and no claim here depends on an AI having "seen" the product work on real glasses. Test numbers in `devpost/test-results.md` are pasted from real runs.
