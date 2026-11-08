# BUILD ALIVE — AI Assistance Disclosure & Methodology

In adherence to the Devpost and Snap "Learn AR with SPECS" hackathon guidelines, this document provides complete, transparent disclosure of the artificial intelligence systems, methodologies, and human oversight involved in building BUILD ALIVE.

---

## 1. AI Systems Utilized

- **Primary Architecture & Coding Agent:** Google Antigravity paired with Claude Code models.
- **Workflow Harness:** CLAD (Command-Line Agentic Development) loop integrated with the Lens Studio MCP (Model Context Protocol) and native TypeScript compilation (`lensifyts.exe`).
- **Zero Hallucination / Fable Protocol Enforcement:** Strict behavioral discipline requiring:
  1. *Read before write:* Never editing a file without reading current disk state.
  2. *Verification before done:* Never reporting a feature or bug fix without running real executable tests and reporting actual machine stdout.
  3. *Adversarial refutation:* Running multi-perspective adversarial checks across design, technical architecture, security, and presentation before finalizing claims.

---

## 2. Human Direction & Quality Oversight

The human developer acted as Principal Engineer, Creative Director, and Sole Authorized Committer:
- Set product vision, architectural requirements, and safety constraints.
- Defined the desk-scale centimeter layout coordinates and optical contrast thresholds.
- Enforced zero external spending (£0 / $0) and local-first execution.
- Directed the wordless short film narrative, visual aesthetics, and honest provenance watermarking.

---

## 3. What Was AI-Assisted vs. What Was Verified

| Component | AI Role | Verification Method |
|:---|:---|:---|
| **TypeScript Engine (`BuildAliveCore.ts`)** | Scaffolding & type authoring | 2,165 automated Node assertions + Lens Studio `lensifyts` compile |
| **Scene UI (`BuildAliveSceneUI.ts`)** | Component binding & pooling | Interactive SIK pinch handling + LEAF 2.0 scenario execution |
| **LEAF Scenarios (`L01`–`L22`)** | Scenario script drafting | Compiled via `lensifyts.exe` and tested against SIK interactors |
| **Event Bridge (`bridge/`)** | Zero-dep stdlib HTTP/WS server | Real WebSocket round-trip tests and throughput latency profiling |
| **Short Film (`video/`)** | Canvas pixel-art procedural rendering | FFmpeg / FFprobe render and audio loudness verification |
| **Documentation & Review** | Adversarial review generation | Checked against source files, compiler logs, and test stdout |

---

## 4. Third-Party Code & Inspiration

- **Prior Art Inspirations:** Wettel & Lanza's CodeCity (2007) and JetBrains Project Vladivostok (2016). BUILD ALIVE takes inspiration from physicalizing code structure, but is an original, ground-up implementation for autonomous AI agent harnesses.
- **Kodro:** Conceptual inspiration only (the pedagogical principle that observing failures in an interactive world teaches faster than abstract explanations). No Kodro code or assets were used.
- **Preserved EarthProof Rover Heritage:** The original physical ramp climb rover trial was preserved 100% intact as an interactive Project Island within the workbench.
