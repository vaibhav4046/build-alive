// Run: node devpost/tests/history.check.mjs
// buildHistory (bridge/journal.mjs): newest sessions first, compact, capped, labelled RECORDED, tolerant of junk lines.
import fs from "node:fs"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {buildHistory} from "../../bridge/journal.mjs"

let pass = 0
let fail = 0
function check(cond, what) {
  if (cond) pass++
  else {
    fail++
    console.log("FAIL: " + what)
  }
}

const mk = (sessionId, ts, kind, extra = {}) => ({sessionId, projectId: "earthproof", ts, kind, status: "succeeded", summary: "s" + ts, actor: "primary-agent", fileAliases: ["a"], ...extra})
const events = [
  mk("old", 1000, "session_started"),
  mk("old", 2000, "tool_started"),
  mk("mid", 5000, "session_started"),
  mk("mid", 6000, "tool_finished"),
  mk("new", 9000, "session_started"),
  ...Array.from({length: 30}, (_, i) => mk("new", 10000 + i, "tool_started")),
  mk("fourth", 500, "session_started"),
  null,
  {sessionId: 5, kind: "x"},
  {sessionId: "bad", kind: "tool_started", ts: "nope"},
]
const h = buildHistory(events)
check(h.type === "history" && h.label === "RECORDED", "frame is typed history and labelled RECORDED")
check(h.sessions.length === 3, "at most 3 sessions (" + h.sessions.length + ")")
check(h.sessions[0].sessionId === "new" && h.sessions[1].sessionId === "mid" && h.sessions[2].sessionId === "old", "newest session first")
check(!h.sessions.some((s) => s.sessionId === "fourth"), "the oldest session is dropped by the cap")
check(h.sessions[0].events.length === 10 && h.sessions[0].count === 31, "per-session events capped to 10, count keeps the real total (31)")
check(h.sessions[0].events[9].ts === 10029, "the kept events are the latest ones")
check(h.sessions[0].startedAt === 9000 && h.sessions[0].lastAt === 10029, "start and last timestamps are tracked")
check(!h.sessions.some((s) => s.sessionId === "bad"), "events with an unusable timestamp are skipped, not guessed")
check(JSON.stringify(h).length < 16000, "frame stays well under the Lens payload cap (" + JSON.stringify(h).length + " bytes)")
check(buildHistory([]).sessions.length === 0, "empty journal gives an empty history")
const long = buildHistory([mk("s", 1, "tool_started", {summary: "x".repeat(500)})])
check(long.sessions[0].events[0].summary.length === 160, "summaries are truncated to 160 chars")

// real journal (read-only), if present: must stay under the cap too
const here = path.dirname(fileURLToPath(import.meta.url))
const real = path.join(here, "../receipts/g2-live/journal.jsonl")
if (fs.existsSync(real)) {
  const evs = fs.readFileSync(real, "utf8").split("\n").filter(Boolean).map((l) => {
    try {
      return JSON.parse(l)
    } catch {
      return null
    }
  })
  const rh = buildHistory(evs)
  check(rh.sessions.length >= 1 && rh.sessions.length <= 3, "real journal yields 1-3 sessions (" + rh.sessions.length + ")")
  check(JSON.stringify(rh).length < 16000, "real-journal history under the Lens cap (" + JSON.stringify(rh).length + " bytes)")
  console.log("real journal: " + evs.length + " events -> " + rh.sessions.map((s) => s.count + " in " + s.sessionId.slice(0, 8)).join(", "))
}

console.log(pass + " passed, " + fail + " failed")
process.exit(fail === 0 ? 0 : 1)
