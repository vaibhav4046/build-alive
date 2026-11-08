# Third-Party Notices & Open Source Licenses

The BUILD ALIVE project is open-source software licensed under the **MIT License**.

All third-party libraries, toolkits, and assets utilized in this project are listed below along with their licenses and attributions.

---

## 1. Snap Inc. Spectacles Packages (Lens Studio 5.23.2)

- **Spectacles Interaction Kit (SIK)**
  - Source: `SpectaclesInteractionKit.lspkg` (v0.18.0)
  - License: Snap Inc. Lens Studio License Agreement
  - Usage: Hand tracking, direct pinch, ray targeting, Billboard, and Interactable components.

- **Spectacles UIKit**
  - Source: `SpectaclesUIKit.lspkg`
  - License: Snap Inc. Lens Studio License Agreement
  - Usage: Button, BackPlate, FlexLayout, FlexItem, ElementContent (Snap OS 2.0 / 3.0 Themes).

- **Lens Execution & Automation Framework (LEAF)**
  - Source: `Leaf.lspkg` (v2.0.2)
  - License: Snap Inc. Lens Studio License Agreement
  - Usage: Automated headless & preview scenario runner, DefaultLeafInteractor, Bitmoji IK reachability.

---

## 2. Runtime & Development Dependencies

- **Node.js (v24.12.0)**
  - Source: https://nodejs.org/
  - License: MIT License
  - Usage: Test execution (`--experimental-strip-types`), native WebSocket client, stdlib HTTP bridge. Zero external npm runtime dependencies used in `bridge/` or `demo-repo/`.

- **FFmpeg & FFprobe (v8.1.1-full_build)**
  - Source: https://ffmpeg.org/
  - License: GNU General Public License (GPL) / LGPL
  - Usage: Video assembly, encoding, stream analysis, and audio loudness verification.

- **GSAP (GreenSock Animation Platform v3.15.0)**
  - Source: https://greensock.com/
  - License: Standard GreenSock License (public web showcase use)
  - Usage: Timeline keyframing in video overlay preview.

---

## 3. Audio & Music

- **Original Ambient Synthesizer Track (`video/assets/ambient.wav`)**
  - Synthesized via algorithmic WebAudio sine/triangle oscillators (`devpost/tools/gen-ambient.mjs`).
  - License: Dedicated to Public Domain (CC0 1.0 Universal).

---

## 4. Zero Additional Spending Confirmation

BUILD ALIVE was built entirely with:
- Free, official Snap Lens Studio 5.23.2 tooling and base template packages.
- Zero paid assets, zero paid API keys, and zero commercial plug-in purchases.
- Total additional project financial cost: **£0.00 / $0.00**.
