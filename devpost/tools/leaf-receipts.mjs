// Extract per-scenario LEAF run receipts from a Lens Studio log (raw lines kept verbatim, prefix trimmed).
// usage: node devpost/tools/leaf-receipts.mjs <LensStudioLog.txt> <outDir> [sinceLine]
import fs from "node:fs"
import path from "node:path"
const [,, logPath, outDir, since = "0"] = process.argv
const lines = fs.readFileSync(logPath, "utf8").split(/\r?\n/)
const trim = (l) => l.replace(/C:\\Snapchat\\Dev\\temp\\StudioPlugins\S+ \(@Es::Preview::PreviewWorker #\d+\) Es::Preview::PreviewWorker::onSceneCreated::::operator\(\)\] /, "")
const runs = []
let cur = null
for (let i = Number(since); i < lines.length; i++) {
  const l = lines[i]
  const m = l.match(/RUNS: (\S+)/)
  if (m) { cur = {scenario: m[1], startLine: i + 1, lines: []}; runs.push(cur) }
  if (cur && /\[Preview \d\]|LeafPlugin/.test(l) && !/Register scenario/.test(l)) cur.lines.push(trim(l))
  if (cur && /(PASSED|FAILED|TIMEOUT|TIMED OUT): /.test(l) && l.includes(cur.scenario)) { cur.verdictLine = trim(l); cur.endLine = i + 1 }
}
fs.mkdirSync(outDir, {recursive: true})
const summary = runs.map((r) => {
  const verdict = r.verdictLine ? (/PASSED/.test(r.verdictLine) ? "PASS" : "FAIL") : "NO_VERDICT"
  const t = (r.lines[0] || "").match(/I (\d\d:\d\d:\d\d\.\d+)/)
  fs.writeFileSync(path.join(outDir, `${r.scenario}.run${r.startLine}.txt`), r.lines.join("\n") + "\n")
  return {scenario: r.scenario, verdict, startedAt: t ? t[1] : null, logLine: r.startLine, receipt: `${r.scenario}.run${r.startLine}.txt`}
})
fs.writeFileSync(path.join(outDir, "_summary.json"), JSON.stringify(summary, null, 2))
for (const s of summary) console.log(s.verdict.padEnd(10), s.startedAt, s.scenario, "line", s.logLine)
