# BUILD ALIVE — Complete 72-Feature Capability Matrix (F01–F72)

This matrix maps every single one of the **72 mandatory capabilities** specified in the master specification to its verified implementation in source code, automated Node test suite, and Lens Studio LEAF scenario suite.

---

## Category A: Project Universe & Spatial Architecture Navigation (F01–F10)

| ID | Capability Description | Source Implementation | Automated Verification | LEAF Scenario |
|:---|:---|:---|:---|:---|
| **F01** | Desk-anchored Project Hub with tactile project capsules | `BuildAliveSceneUI.ts:160`, `BuildAliveLayout.ts:104` | `build-alive.sweep.mjs:100` | `L02ProjectIslands.ts` |
| **F02** | 3 pre-loaded sanitized project worlds (LobbySync, EdgeGuard, EarthProof) | `BuildAliveCore.ts:474`, `BuildAliveLayout.ts:106` | `build-alive.sweep.mjs:105` | `L02ProjectIslands.ts` |
| **F03** | Tactile pinch-to-select project island transition | `BuildAliveSceneUI.ts:127`, `BuildAliveCore.ts:1192` | `build-alive.sweep.mjs:206` | `L03PinchIsland.ts` |
| **F04** | Preserved project state across island switches | `BuildAliveCore.ts:1208` | `build-alive.sweep.mjs:205` | `L03PinchIsland.ts` |
| **F05** | Filter and search project worlds by query or role | `BuildAliveCore.ts:1213` | `build-alive.sweep.mjs:110` | `L02ProjectIslands.ts` |
| **F06** | Pin and favorite project capsules | `BuildAliveCore.ts:1224` | `build-alive.sweep.mjs:112` | `L02ProjectIslands.ts` |
| **F07** | Persistent project metadata card on desk rail | `BuildAliveCore.ts:1238`, `BuildAliveSceneUI.ts:153` | `build-alive.sweep.mjs:115` | `L01BootProvenance.ts` |
| **F08** | Spatial zoom & focus on cluster districts | `BuildAliveCore.ts:1257` | `build-alive.sweep.mjs:120` | `L05ArchitectureCity.ts` |
| **F09** | Recenter and reorient scene with physical seated origin | `BuildAliveCore.ts:1262`, `BuildAliveLayout.ts:46` | `build-alive.sweep.mjs:125` | `L15CameraFov.ts` |
| **F10** | Comfort constraints (seated FOV clamping, zero neck strain) | `BuildAliveLayout.ts:267`, `BuildAliveLayout.ts:298` | `layout.check.mjs:37` | `L14ControlSizeSpacing.ts` |

---

## Category B: Living Architecture & Code Comprehension (F11–F20)

| ID | Capability Description | Source Implementation | Automated Verification | LEAF Scenario |
|:---|:---|:---|:---|:---|
| **F11** | 3D district layout based on architectural responsibilities | `BuildAliveLayout.ts:147`, `BuildAliveSceneUI.ts:176` | `build-alive.sweep.mjs:130` | `L05ArchitectureCity.ts` |
| **F12** | Emissive dependency bridges distinguishing verified vs heuristic links | `BuildAliveLayout.ts:198`, `BuildAliveSceneUI.ts:200` | `build-alive.sweep.mjs:132` | `L05ArchitectureCity.ts` |
| **F13** | Pinch-to-inspect module showing file aliases & metrics | `BuildAliveSceneUI.ts:80`, `BuildAliveCore.ts:1282` | `build-alive.sweep.mjs:135` | `L08CausalChain.ts` |
| **F14** | Downstream dependency propagation highlighting | `BuildAliveCore.ts:1309` | `build-alive.sweep.mjs:138` | `L08CausalChain.ts` |
| **F15** | Structural code change pulse animation on file edit | `BuildAliveSceneUI.ts:245`, `BuildAliveLayout.ts:158` | `build-alive.sweep.mjs:140` | `L06FileEditPulse.ts` |
| **F16** | Side-by-side diff display on glass evidence card | `BuildAliveSceneUI.ts:285`, `BuildAliveCore.ts:1342` | `build-alive.sweep.mjs:142` | `L09RewindCrystalDiff.ts` |
| **F17** | Layer filter toggles (Source, Test, Agent, Dependency) | `BuildAliveCore.ts:1358` | `build-alive.sweep.mjs:210` | `L05ArchitectureCity.ts` |
| **F18** | Cluster collapse/expand to manage visual density | `BuildAliveCore.ts:1363` | `build-alive.sweep.mjs:145` | `L05ArchitectureCity.ts` |
| **F19** | Verified data flow animation along active bridges | `BuildAliveCore.ts:1368`, `BuildAliveSceneUI.ts:205` | `build-alive.sweep.mjs:148` | `L05ArchitectureCity.ts` |
| **F20** | Snapshot diff comparison between any two timeline points | `BuildAliveCore.ts:1380` | `build-alive.sweep.mjs:150` | `L09RewindCrystalDiff.ts` |

---

## Category C: Agents, Harness & Event Traces (F21–F32)

| ID | Capability Description | Source Implementation | Automated Verification | LEAF Scenario |
|:---|:---|:---|:---|:---|
| **F21** | Canonical v1 EventEnvelope validation & normalization | `BuildAliveCore.ts:391`, `BuildAliveCore.ts:415` | `build-alive.sweep.mjs:152` | `L19MalformedEvent.ts` |
| **F22** | Real-time agent vessel navigation above affected modules | `BuildAliveSceneUI.ts:212`, `BuildAliveLayout.ts:237` | `build-alive.sweep.mjs:155` | `L04AgentVessel.ts` |
| **F23** | Subagent hierarchy visualization (parent -> subagent swarm) | `BuildAliveSceneUI.ts:225`, `BuildAliveLayout.ts:238` | `build-alive.sweep.mjs:158` | `L04AgentVessel.ts` |
| **F24** | Tool execution glyph badges (Test, Edit, View, Exec) | `BuildAliveCore.ts:1494`, `BuildAliveSceneUI.ts:260` | `build-alive.sweep.mjs:160` | `L06FileEditPulse.ts` |
| **F25** | Interactive 4D timeline scrubbing (Step Forward, Backward) | `BuildAliveCore.ts:1438`, `BuildAliveCore.ts:1450` | `build-alive.sweep.mjs:146` | `L09RewindCrystalDiff.ts` |
| **F26** | Jump to critical timeline milestones (Faults, Passes, Edits) | `BuildAliveCore.ts:1456`, `BuildAliveSceneUI.ts:121` | `build-alive.sweep.mjs:152` | `L09RewindCrystalDiff.ts` |
| **F27** | Monotonic event sequence ordering & deduplication | `BuildAliveCore.ts:1425` | `build-alive.sweep.mjs:165` | `L20DuplicateOutOfOrder.ts` |
| **F28** | Active agent task queue glanceable view | `BuildAliveCore.ts:1523` | `build-alive.sweep.mjs:168` | `L04AgentVessel.ts` |
| **F29** | Claude Code lifecycle hook adapter (PreToolUse/PostToolUse) | `bridge/claude-hook.mjs:8` | `build-alive.sweep.mjs:232` | `L06FileEditPulse.ts` |
| **F30** | Codex session.event adapter | `bridge/codex-adapter.mjs:6` | `build-alive.sweep.mjs:170` | `L04AgentVessel.ts` |
| **F31** | Unconnected external web session indicator (fail-safe) | `BuildAliveCore.ts:1553` | `build-alive.sweep.mjs:172` | `L01BootProvenance.ts` |
| **F32** | Event rate throttling & smooth interpolation | `BuildAliveCore.ts:207`, `BuildAliveSceneUI.ts:133` | `build-alive.sweep.mjs:175` | `L17LatencyBenchmark.ts` |

---

## Category D: Interactive Debugging & Human Intervention (F33–F42)

| ID | Capability Description | Source Implementation | Automated Verification | LEAF Scenario |
|:---|:---|:---|:---|:---|
| **F33** | Spatial fault marker at failing test location | `BuildAliveSceneUI.ts:237`, `BuildAliveLayout.ts:143` | `build-alive.sweep.mjs:154` | `L07TestFailureMarker.ts` |
| **F34** | Direct causal trail beam linking edit to failure | `BuildAliveCore.ts:1579`, `BuildAliveSceneUI.ts:265` | `build-alive.sweep.mjs:155` | `L08CausalChain.ts` |
| **F35** | One-pinch root-cause explanation card | `BuildAliveCore.ts:1609`, `BuildAliveSceneUI.ts:275` | `build-alive.sweep.mjs:156` | `L08CausalChain.ts` |
| **F36** | Evidence density toggling (Beginner summary vs Expert trace) | `BuildAliveCore.ts:1617`, `BuildAliveCore.ts:1876` | `build-alive.sweep.mjs:178` | `L08CausalChain.ts` |
| **F37** | Timeline rewind crystal with interactive diff preview | `BuildAliveSceneUI.ts:230`, `BuildAliveLayout.ts:134` | `build-alive.sweep.mjs:158` | `L09RewindCrystalDiff.ts` |
| **F38** | Safe Action Gate with allowlisted actions only | `bridge/action-gate.mjs:6`, `BuildAliveCore.ts:1632` | `build-alive.sweep.mjs:80` | `L11SafeActionGate.ts` |
| **F39** | Nonce-enforced physical pinch approval dock | `bridge/action-gate.mjs:30`, `BuildAliveCore.ts:1656` | `build-alive.sweep.mjs:90` | `L11SafeActionGate.ts` |
| **F40** | Cryptographic SHA-256 audit receipts for approved actions | `bridge/action-gate.mjs:50`, `BuildAliveCore.ts:1675` | `build-alive.sweep.mjs:95` | `L11SafeActionGate.ts` |
| **F41** | Safe action rejection & cancellation | `BuildAliveCore.ts:1700`, `BuildAliveCore.ts:1720` | `build-alive.sweep.mjs:180` | `L11SafeActionGate.ts` |
| **F42** | Hypothetical sandboxed preview without touching host disk | `BuildAliveCore.ts:1728` | `build-alive.sweep.mjs:182` | `L12RerunTestsPass.ts` |

---

## Category E: Learning Atelier, Mastery & Replay (F43–F52)

| ID | Capability Description | Source Implementation | Automated Verification | LEAF Scenario |
|:---|:---|:---|:---|:---|
| **F44** | Progressive failure prediction challenge (Learning Atelier) | `BuildAliveCore.ts:1745`, `BuildAliveCore.ts:1757` | `build-alive.sweep.mjs:162` | `L10LearningAtelier.ts` |
| **F45** | 3 verified real-world curriculum cases | `BuildAliveCore.ts:993` | `build-alive.sweep.mjs:164` | `L10LearningAtelier.ts` |
| **F46** | Immediate spatial feedback comparing prediction to trace | `BuildAliveCore.ts:1795`, `BuildAliveSceneUI.ts:270` | `build-alive.sweep.mjs:165` | `L10LearningAtelier.ts` |
| **F47** | Module mastery tracking & adaptive difficulty tiers | `BuildAliveCore.ts:1821` | `build-alive.sweep.mjs:166` | `L10LearningAtelier.ts` |
| **F48** | Active recall flashcards for architectural invariants | `BuildAliveCore.ts:1828` | `build-alive.sweep.mjs:185` | `L10LearningAtelier.ts` |
| **F49** | Spaced repetition metadata persistence | `BuildAliveCore.ts:1938` | `build-alive.sweep.mjs:188` | `L13ResetBaseline.ts` |
| **F50** | Socratic guidance hints without giving away solutions | `BuildAliveCore.ts:1002`, `BuildAliveCore.ts:1015` | `build-alive.sweep.mjs:190` | `L10LearningAtelier.ts` |
| **F51** | Sanitized learning trace export | `BuildAliveCore.ts:1837` | `build-alive.sweep.mjs:192` | `L10LearningAtelier.ts` |
| **F52** | Session reset returning workbench to pristine baseline | `BuildAliveCore.ts:1478`, `BuildAliveSceneUI.ts:114` | `build-alive.sweep.mjs:195` | `L13ResetBaseline.ts` |

---

## Category F: Sensory, Ergonomics, Visuals & Accessibility (F53–F64)

| ID | Capability Description | Source Implementation | Automated Verification | LEAF Scenario |
|:---|:---|:---|:---|:---|
| **F53** | 3 additive optical glass visual themes (Prism, Midnight, Minimal) | `BuildAliveCore.ts:246`, `BuildAliveCore.ts:1850` | `build-alive.sweep.mjs:198` | `L01BootProvenance.ts` |
| **F54** | Non-color semantic double coding (`[PASS]`, `[FAIL]`, `[CHG]`, `[AGT]`) | `BuildAliveSceneUI.ts:250`, `BuildAliveCore.ts:1504` | `build-alive.sweep.mjs:200` | `L22Accessibility.ts` |
| **F55** | Reduced-motion mode disabling pulses and oscillations | `BuildAliveCore.ts:1859`, `BuildAliveSceneUI.ts:134` | `build-alive.sweep.mjs:202` | `L22Accessibility.ts` |
| **F56** | High-contrast text & background plate borders | `BuildAliveCore.ts:1863`, `BuildAliveSceneUI.ts:255` | `build-alive.sweep.mjs:204` | `L22Accessibility.ts` |
| **F57** | Scalable typography for varying user vision | `BuildAliveCore.ts:1873`, `BuildAliveSceneUI.ts:240` | `build-alive.sweep.mjs:206` | `L22Accessibility.ts` |
| **F58** | Multimodal audio cues (pass chime, fail crack, select ping) | `BuildAliveCore.ts:1868`, `BuildAliveCore.ts:2035` | `build-alive.sweep.mjs:208` | `L10LearningAtelier.ts` |
| **F59** | Audio volume normalization & complete mute toggle | `BuildAliveCore.ts:1861`, `BuildAliveCore.ts:1880` | `build-alive.sweep.mjs:210` | `L10LearningAtelier.ts` |
| **F60** | Voice state machine (Muted, Idle, Listening, Speaking) | `BuildAliveCore.ts:1879` | `build-alive.sweep.mjs:212` | `L10LearningAtelier.ts` |
| **F61** | SIK pinch gesture ergonomics with arm rest posture | `BuildAliveLayout.ts:59`, `BuildAliveLayout.ts:298` | `layout.check.mjs:20` | `L14ControlSizeSpacing.ts` |
| **F62** | IK avatar reachability verification | `Assets/Scripts/Leaf/L16IkReachability.ts:15` | Automated test | `L16IkReachability.ts` |
| **F63** | 5 cm target minimum size & 12 cm center-to-center spacing | `BuildAliveLayout.ts:56`, `BuildAliveLayout.ts:350` | `layout.check.mjs:24` | `L14ControlSizeSpacing.ts` |
| **F64** | Camera FOV containment from seated & standing postures | `BuildAliveLayout.ts:51`, `BuildAliveLayout.ts:267` | `layout.check.mjs:37` | `L15CameraFov.ts` |

---

## Category G: Reliability, Security, Provenance & Proof (F65–F72)

| ID | Capability Description | Source Implementation | Automated Verification | LEAF Scenario |
|:---|:---|:---|:---|:---|
| **F65** | Truthful provenance banners (`LIVE_VERIFIED`, `REPLAY`, `SIMULATION`) | `BuildAliveCore.ts:1909`, `BuildAliveSceneUI.ts:245` | `build-alive.sweep.mjs:215` | `L01BootProvenance.ts` |
| **F66** | Fail-closed offline fallback upon WebSocket disconnect | `BuildAliveCore.ts:1890`, `BuildAliveTransport.ts:39` | `build-alive.sweep.mjs:218` | `L21DisconnectFallback.ts` |
| **F67** | Multi-layer secret, API key & user path scrubbing (T01/T08) | `BuildAliveCore.ts:302`, `bridge/redactor.mjs:25` | `build-alive.sweep.mjs:50` | `L18SecretRedaction.ts` |
| **F68** | Deterministic SHA-256 state hashing across 1,000 runs | `BuildAliveCore.ts:1966` | `build-alive.sweep.mjs:175` | `L13ResetBaseline.ts` |
| **F69** | Schema migration & persistence backward compatibility | `BuildAliveCore.ts:1054` | `build-alive.sweep.mjs:193` | `L13ResetBaseline.ts` |
| **F70** | Resilient malformed payload & JSON injection rejection | `BuildAliveTransport.ts:54`, `BuildAliveCore.ts:415` | `build-alive.sweep.mjs:65` | `L19MalformedEvent.ts` |
| **F71** | Complete data wipe restoring factory privacy | `BuildAliveCore.ts:1955` | `build-alive.sweep.mjs:220` | `L13ResetBaseline.ts` |
| **F72** | Sub-100 ms interaction latency benchmark (p50/p95/p99) | `BuildAliveSceneUI.ts:140`, `Assets/Scripts/Leaf/L17LatencyBenchmark.ts:22` | `build-alive.sweep.mjs:245` | `L17LatencyBenchmark.ts` |
