// bridge/mentor-demo.mjs - measures the mentor loop end to end against the REAL live journal.
// Honest note: there is no microphone here, so each spoken question is synthesised with the offline Windows voice and then
// transcribed like a recording would be. Output: devpost/receipts/mentor/{run.json, q*.wav, a*.wav}
import fs from "node:fs"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {loadKeys, mentorTurnWith, speakLocal} from "./mentor.mjs"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(HERE, "..", "devpost", "receipts", "mentor")
const key = loadKeys().GROQ_API_KEY
if (!key) throw new Error("GROQ_API_KEY missing in bridge/.env")
const journal = path.join(HERE, "..", "devpost", "receipts", "g2-live", "journal.jsonl")
const events = fs.readFileSync(journal, "utf8").trim().split("\n").map((l) => JSON.parse(l))
const questions = [
  "What is the agent doing right now?",
  "Did anything fail?",
  "Which file did it just change?",
  "Is this live or a replay?",
  "What is the agent thinking?",
]
fs.mkdirSync(OUT, {recursive: true})
const runs = []
for (let i = 0; i < questions.length; i++) {
  const qWav = await speakLocal(questions[i])
  fs.writeFileSync(path.join(OUT, `q${i + 1}.wav`), qWav)
  const r = await mentorTurnWith(qWav, events, key, speakLocal)
  fs.writeFileSync(path.join(OUT, `a${i + 1}.wav`), r.answerWav)
  runs.push({asked: questions[i], heard: r.question, answer: r.answer, ms: r.ms})
  console.log(`#${i + 1} heard="${r.question}" -> "${r.answer}"  [stt ${r.ms.stt} ms, llm ${r.ms.llm} ms, tts ${r.ms.tts} ms, total ${r.ms.total} ms]`)
}
const tot = runs.map((r) => r.ms.total).sort((a, b) => a - b)
const pct = (p) => tot[Math.min(tot.length - 1, Math.ceil((p / 100) * tot.length) - 1)]
const summary = {at: new Date().toISOString(), journalEvents: events.length, n: runs.length, method: "wall clock per API call from this PC (Node fetch), cold+warm mixed, network included", p50: pct(50), p95: pct(95), max: tot[tot.length - 1], runs}
fs.writeFileSync(path.join(OUT, "run.json"), JSON.stringify(summary, null, 2))
console.log(`n=${runs.length} total p50=${summary.p50} ms p95=${summary.p95} ms max=${summary.max} ms (journal events: ${events.length})`)
