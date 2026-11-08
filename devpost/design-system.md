# Spatial UX & Glass Design System — BUILD ALIVE (2026-11-08)

## 1. Optical Additive Display Discipline (Snap SPECS)
On waveguide/additive AR displays, pure black (`#000000`) renders as **transparent**, and low-luminance dark grays wash out against bright rooms. Conversely, huge opaque white slabs cause eye strain and occlude the physical desk.

BUILD ALIVE uses an original **Translucent Prism-Glass** visual language built from `SpectaclesUIKit` (`BackPlate`, `FlexLayout`, `Button`) and lit 3D primitives (`SimplePBRMaterialPreset` and `UnlitMaterialPreset`), adhering strictly to three rules:
1. **No Apple VisionOS trade-dress copying, proprietary icons, or 2D web windows.**
2. **Double-coded semantic states:** Every status uses **both** a high-contrast additive color **and** an explicit ASCII/geometric prefix badge (`[PASS]`, `[CHG]`, `[FAIL]`, `[AGT]`, `[SIM]`, `[?UNK]`) plus a distinct spatial chime frequency (`F62`).
3. **Zero per-frame overdraw spikes:** Cards are pre-allocated at `onAwake()`, settled for `0.8 s` at scale `0`, and toggled via `.enabled` (`O(1)` visibility flips, `<= 18` active 3D meshes in Architecture City).

## 2. Semantic Color Tokens (`ThemeTokens` in `BuildAliveCore.ts`)

| Token Role | Semantic Meaning | Prefix Badge | Prism Theme (`vec4` RGBA) | Midnight Theme (`vec4` RGBA) | Minimal Focus / High-Contrast (`vec4` RGBA) |
|---|---|---|---|---|---|
| `TEAL_VERIFIED` | Verified test pass / healthy bridge | `[PASS]` | `(0.20, 0.95, 0.85, 1.0)` | `(0.15, 0.88, 0.78, 1.0)` | `(0.35, 1.00, 0.90, 1.0)` |
| `AMBER_CHANGED` | File edited / pending propagation | `[CHG]` | `(1.00, 0.78, 0.22, 1.0)` | `(0.95, 0.72, 0.18, 1.0)` | `(1.00, 0.88, 0.30, 1.0)` |
| `CORAL_FAILED` | Actual failed test / fracture beam | `[FAIL]` | `(1.00, 0.38, 0.34, 1.0)` | `(0.98, 0.32, 0.30, 1.0)` | `(1.00, 0.45, 0.40, 1.0)` |
| `VIOLET_AGENT` | Active coding agent / subagent vessel | `[AGT]` | `(0.72, 0.48, 1.00, 1.0)` | `(0.64, 0.42, 0.95, 1.0)` | `(0.85, 0.65, 1.00, 1.0)` |
| `SLATE_UNKNOWN` | Unverified / unknown dependency edge | `[?UNK]` | `(0.62, 0.68, 0.75, 0.75)` | `(0.52, 0.58, 0.65, 0.75)` | `(0.80, 0.85, 0.90, 0.90)` |
| `GLASS_NAVY_BASE` | Desk shelf / island plinth base | — | `(0.14, 0.24, 0.36, 0.92)` | `(0.08, 0.14, 0.24, 0.95)` | `(0.18, 0.28, 0.40, 1.0)` |
| `TEXT_PRIMARY` | Card titles & key evidence lines | — | `(1.00, 1.00, 1.00, 1.0)` | `(0.96, 0.98, 1.00, 1.0)` | `(1.00, 1.00, 1.00, 1.0)` |
| `TEXT_SECONDARY` | File paths, timestamps & captions | — | `(0.82, 0.92, 1.00, 0.82)` | `(0.75, 0.86, 0.98, 0.80)` | `(0.95, 0.98, 1.00, 0.95)` |

## 3. Spatial Layout Zones (Centimeters, Seated Eye Origin `(0, 0, 0)` Facing `-Z`)

```text
                       [User Eye Origin (0, 0, 0) looking -Z]
                                         |
         +-------------------------------+-------------------------------+
         | Front Control Rail (z = -48 cm, y = -25 cm, 12 cm spacing)    |
         | [Step -24]  [Inspect -12]  [Learn 0]  [Approve +12]  [Reset +24]
         +-------------------------------+-------------------------------+
         | Left: Project Archipelago     | Center: Architecture City     | Right: Evidence Cards
         | (x = -34..-10, z = -58 cm)    | (x = -16..+18, z = -66..-78)  | (x = +16, z = -68 cm)
         |  - Island_LobbySync (-34)     |  - Module_Client (-16,-18,-68)|  - BuildAliveCard
         |  - Island_EdgeGuard (-22)     |  - Module_Lobby  (-4,-16,-70) |    (UIKit BackPlate +
         |  - Island_EarthProof (-10)    |  - Module_WS     (+8,-18,-68) |     FlexLayout, 26 cm W,
         |                               |  - Module_State  (-4,-22,-78) |     +0.6 cm Z-lift)
         |  - RewindCrystal (-18,-10,-64)|  - Module_DB     (+10,-22,-78)|
         |  - AgentVessels (y = -9 cm)   |  - Module_Tests  (+18,-15,-66)|
         +-------------------------------+-------------------------------+
```

### Ergonomic & Field-of-View Verification (`BuildAliveLayout.ts` & LEAF `L02`/`L21`/`L22`)
- **Preview Camera FOV:** `36.6°` vertical, aspect `0.875` (`~32.2°` horizontal).
- **Primary Interactive Span:** Controls sit at `x ∈ [-24, +24] cm` (`z = -48` to `-68 cm`), and Architecture City modules sit at `x ∈ [-16, +18] cm` (`z = -66` to `-78 cm`), keeping all primary targets inside the seated gaze cone and within comfortable arm reach (`48–78 cm`).
- **Target Size & Separation Floor:** Every interactive button and module node is `>= 5.0 cm` across (`5.0–8.0 cm`), with `>= 12.0 cm` center-to-center spacing on the control rail and island shelf.
- **Z-Fighting Prevention:** All UIKit cards place `Content` (`FlexLayout`) at `localPosition.z = +0.6 cm` in front of `BackPlate` and maintain hierarchy DFS order (`BackPlate` first, `Content` second), with `text.depthTest = true`.

## 4. Typography Scale (Calibrated for SPECS Focal Distance)
- `Title1` (`size: 70`): Card header (`[FAIL] TEST-ROOM-03`, `[PASS] BRIDGE REPAIRED`, `[LEARN] PREDICT IMPACT`)
- `Body` (`size: 54`): Concise 1-line module/diff/action evidence (`server/lobby.ts: maxPlayers=4 guard`)
- `Caption` (`size: 40`): Provenance & receipt footer (`LOCAL_RECORDED_REPLAY • seq #3 • sha256:8f4a...`)
- **Line-length cap:** Every row is `<= 48` characters so text never overflows or requires scrolling.

## 5. Audio & Motion Profiles (`F55`–`F58`, `F64`)
- **Balanced (Default):** Smoothlerp node pulse (`0.25 s`), bridge fracture pulse (`7 rad/s`, amplitude `0.15 cm`), procedural spatial synth pad + state chimes (`video/assets/ambient.wav` generated by `devpost/tools/gen-ambient.mjs`).
- **Comfort / Reduced Motion (`F58`):** Disables continuous vessel bobbing and fracture oscillation (`pulseAmplitude = 0`); transitions snap cleanly in `1` frame.
- **Quiet Observatory (`F58`):** Mutes audio cues and hides non-selected labels until pinched.
