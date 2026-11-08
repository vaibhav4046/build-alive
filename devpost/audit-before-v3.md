# Audit before v3 (Gate 0) — 2026-11-08

Repo: `D:\earthproof\lens\EarthProof`, branch `visual-emergency-rebuild`, HEAD `8556d7e` (tag `pre-v3-checkpoint`). Fallback tags: `core-rover-v1`, `build-alive-v1.0`, branches `rover-fallback`, `tandem-backup`.

## Verified by running (this session)
| Check | Result |
|---|---|
| `devpost/tests/core.check.mjs` | 62/62 named + 2,400 generated cases pass (1 test had a wrong expectation, pre-existing at HEAD; fixed in the test) |
| `devpost/tests/layout.check.mjs` | 37/37 |
| `devpost/tests/sim.check.mjs` | pass |
| `devpost/tests/build-alive.sweep.mjs` | 2,223 assertions, 0 failures |
| Bridge `bridge/start-workspace.mjs` on 127.0.0.1:8787 | starts; `/workspace` returns 2 distinct real worlds: EarthProof (11 modules, 4 edges, 139 files) and mnemosyne (13 modules, 3 edges, 113 files) |
| `/providers` | antigravity = REPLAY_IMPORTED (24 replay events, 0 live); claude-code = OFFLINE (no hook registered); opencode/openclaw = UNSUPPORTED; codex = OFFLINE |

## NOT verified / corrected
- **LEAF L01–L22: compiled only, never executed in Preview.** No run receipts exist. `test-results.md` previously showed PASS; corrected to "COMPILED, NOT EXECUTED".
- **Lens Studio was not running** and the `lens-studio` MCP tools were not registered in this session, so no Preview screenshot or recording could be taken. `video/out/build-alive-demo.mp4` is a HyperFrames-rendered HTML animation, **not** Preview footage.
- **No live agent event** has reached the Lens: bridge journal holds replay events only.
- Physical Spectacles untested. `127.0.0.1` does not work for a headset.
- 72 / 120 feature "100% implemented" claims in older docs are unproven; treat `feature-matrix.md` statuses as unaudited until re-checked.
