# Node test receipts, 2026-11-09

Raw stdout/stderr of each suite, captured on Windows 11, Node v24.12.0, at commit time of this folder. Re-run with the commands in the top-level README.

| Suite | Result |
|---|---|
| core.check | 62/62 named tests + 2,400 generated cases, 0 failures (summary JSON at the end of the file) |
| explain.check | 11/11 |
| layout.check | 37/37 assertions |
| sim.check | pass |
| build-alive.sweep | 2,224 assertions, 0 failures |
| bridge-hook.test | 16/16 |
| bridge-ws-guard.test | 7/7 (earlier run aborted in libuv at shutdown on Windows after all checks passed; fixed by letting the event loop drain instead of `process.exit`) |
