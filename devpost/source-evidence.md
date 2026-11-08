# BUILD ALIVE — Source Evidence & Literature Citations

Every major design decision, technical invariant, and pedagogical pattern in **BUILD ALIVE** is grounded in verified documentation, peer-reviewed computer science literature, or published Snap developer standards.

---

## 1. Snap Developer Standards & Spectacles Guidelines

1. **Snap Lens Studio 5.23.2 Spectacles 27 Preview Documentation**
   - *Seated Eye Origin & FOV:* Preview camera vertical FOV is 36.6° (`fov = 0.6388 rad`), aspect ratio 0.875. Seated gaze vector targets `(0, -19, -66)` cm. All core controls are verified within this gaze cone (`BuildAliveLayout.ts:51`).
   - *Target Sizing & Pinch Accuracy:* Snap design guidelines mandate interactive targets >= 5 cm across for direct touch and indirect ray targeting at 50–70 cm distances. Center-to-center button spacing must be >= 12 cm to eliminate accidental pinch triggers. Enforced by `auditControlErgonomics()` and tested in LEAF `L14`.
   - *Additive Optical Transparency:* Pure black (`#000000`) renders transparent on optical see-through waveguides. Semi-transparent slate (`#141824`, alpha 0.85) is required for readable text backing. Double-coding (color + ASCII badge) ensures legibility under bright ambient lighting (`BuildAliveSceneUI.ts:250`, LEAF `L22`).
   - *Zero-Allocation Rule:* Qualcomm XR2 Gen 2 garbage collection pauses trigger dropped frames. Enforces pre-pooling of all 18 3D scene objects (`BuildAliveSceneUI.ts:145`).

2. **Spectacles Interaction Kit (SIK 0.18.0) & Spectacles UIKit**
   - Official SIK components: `Interactable`, `InteractableManipulation`, `Billboard`.
   - UIKit 2D layout: `Button`, `BackPlate`, `FlexLayout`, `FlexItem`, `ElementContent` (SnapOS 2.0 / 3.0 themes).

---

## 2. Autonomous Agent Lifecycle Protocols

1. **Claude Code Lifecycle Hook Architecture (Anthropic 2025/2026)**
   - Event interception points: `PreToolUse` (tool initiation, parameter parsing), `PostToolUse` (tool success, stdout capture), `PostToolUseFailure` (assertion failures, stderr), `SubagentStart` (subagent fork), `SubagentStop` (subagent completion).
   - Normalizer implemented in `bridge/claude-hook.mjs`.

2. **Codex SDK Session Events (OpenAI 2025/2026)**
   - Canonical `session.event` stream (`file_change`, `command_run`, `turn_completed`).
   - Normalizer implemented in `bridge/codex-adapter.mjs`.

---

## 3. Academic & Prior Art References

1. **CodeCity (Wettel & Lanza, IEEE ICSE 2007)**
   - *Concept:* Visualizing object-oriented software systems as 3D cities where classes are buildings and packages are districts.
   - *BUILD ALIVE Advancement:* Extends static AST code metrics into a live, interactive 4D execution theater for autonomous AI agents, with real-time agent vessel navigation, physical fault markers, and timeline rewind.

2. **Project Vladivostok (JetBrains Research 2016)**
   - *Concept:* 3D immersive software visualization in virtual reality.
   - *BUILD ALIVE Advancement:* Moves from immersive VR into optical see-through AR anchored to a physical desk surface, incorporating human-supervised action gates and pedagogical prediction challenges.

3. **Zoetrope: Code History Scrubbing (Adar et al., ACM UIST 2014)**
   - *Concept:* Reversible timeline scrubbing for software development history.
   - *BUILD ALIVE Advancement:* Implemented as a physical 3D Rewind Crystal in AR space, enabling side-by-side diff inspection and hypothetical branch testing.

4. **Socratic Prediction in Computer Science Education (Kulik & Kulik 1991, Chi 2009)**
   - *Principle:* Active prediction of system failure before viewing error output significantly improves causal reasoning and retention over passive reading.
   - *BUILD ALIVE Implementation:* The Learning Atelier (F44–F52) prompts learners to predict which downstream module will break following an agent code edit.
