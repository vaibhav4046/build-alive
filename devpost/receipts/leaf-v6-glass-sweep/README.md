# LEAF sweep on the v6 glass-window build (Lens Studio 5.23.2 Preview, 2026-11-09 06:3x-07:5x GMT, log from line 15226)

Verbatim lines from `LensStudioLog-2026-11-09-04-40-27-235-639cb.txt` via `devpost/tools/leaf-receipts.mjs` (`_summary.json` lists every run, including
re-runs). Launched with the lens-studio MCP `run_leaf_scenario` (`onDevice:false`).

**Result (final verdict per scenario):**
- PASS: L01-L16, L18-L26 (25 scenarios). L10 first run was pre-empted by the next call (NO_VERDICT) and passed on its own re-run; L22 first FAILED
  ("passing module has non-colour word OK") because I had dropped the "OK" status word, a real accessibility regression that I fixed and re-ran: PASS.
- PASS (legacy Rover fallback): c1, c2, c3-drop-far, c5, c6-ik-reach.
- **FAIL: c3-swap-pinch, c4-pass-proof, c6-controls.** c3/c4 are NEW regressions on this layout (they passed in `../leaf-v5-holo-sweep/`): the Rover
  fallback block can no longer be mounted (log: "Geared is mounted, Small is back in the tray" / "Geared installed"). Not root-caused in the time left; the
  new Project/Learn/Session windows and module blocks now share the same space as the Rover fallback's objects. c6-controls is the long-standing Rover
  field-of-view failure.
- **NOT RUN to a verdict in this sweep: L17-latency-benchmark and c7-latency** (the MCP call times out client-side and the calls pre-empted each other; both
  PASSED on the v5 build with p50 2.0 / p95 3.0 ms). Do not cite them for v6.
- Scenarios now take 7-27 s each (IK hands reach windows at z -58), so the MCP call returns "timed out" even when the scenario passes; verdicts above come from the log.

Honest limits: Lens still runs in replay / real-scan mode (Experimental APIs off, no live event). The rule-based explainer (`BuildAliveExplain.ts`,
18/18 Node tests in `devpost/tools/test-explain.mjs`) is not AI reasoning. The Preview's room has a bright console band in its lower half that washes out text
on this additive display; windows were moved up to avoid it.
