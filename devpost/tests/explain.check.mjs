// Checks for the plain-language layer: command explainer, step explainer, Prompt Coach.
// Run: node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tests/explain.check.mjs
import assert from "node:assert/strict"
import {explainCommand, explainStep, promptCoach} from "../../Assets/Scripts/BuildAliveExplain.ts"

let passed = 0
const t = (name, fn) => { fn(); passed++; console.log("PASS " + name) }

t("known commands map to plain words", () => {
  const cases = [
    ["git status", "read", "Checks which files changed"],
    ["git diff HEAD~1", "read", "Compares what changed"],
    ["npm test", "test", "Runs the checks"],
    ["pnpm run test -- --watch", "test", "Runs the checks"],
    ["pytest -q", "test", "Runs the checks"],
    ["npm run build", "command", "Builds the project to see if it fits together"],
    ["rg lobby", "search", "Searches for words in files"],
    ["rm -rf dist", "command", "Deletes a file or folder"],
    ["curl https://example.com", "command", "Asks a website or service for something"],
  ]
  for (const [cmd, kind, plain] of cases) {
    const e = explainCommand(cmd)
    assert.equal(e.known, true, cmd)
    assert.equal(e.kind, kind, cmd)
    assert.equal(e.plain, plain, cmd)
  }
})

t("git diff wins over generic git rules (order)", () => {
  assert.equal(explainCommand("git diff").plain, "Compares what changed")
})

t("unknown and empty commands are labelled honestly, never guessed", () => {
  const u = explainCommand("frobnicate --all")
  assert.equal(u.known, false)
  assert.match(u.plain, /do not have a plain-words name/)
  assert.equal(explainCommand("").known, false)
  assert.equal(explainCommand(undefined).known, false)
})

t("failed test step says something is broken and gives a debug tip", () => {
  const s = explainStep({kind: "test_completed", status: "failed"})
  assert.equal(s.badge, "CHECK")
  assert.match(s.what, /one failed/)
  assert.match(s.tip, /failing line/)
})

t("passing test step says all passed", () => {
  assert.match(explainStep({kind: "test_completed", status: "passed"}).what, /all of them passed/)
})

t("edit step names only the last path part (no home path leak)", () => {
  const s = explainStep({kind: "tool_finished", status: "ok", summary: "Edit file", files: ["C:\\Users\\x\\proj\\server\\lobby.ts"]})
  assert.equal(s.what, "Rewrote part of lobby.ts")
  assert.ok(!s.what.includes("Users"))
})

t("bash step routes through the command explainer", () => {
  const s = explainStep({kind: "tool_started", status: "ok", summary: "Bash: git status"})
  assert.equal(s.badge, "MACHINE")
  assert.equal(s.what, "Checks which files changed")
})

t("approval denied says nothing ran", () => {
  assert.equal(explainStep({kind: "approval_resolved", status: "denied"}).what, "You said no, so nothing ran")
})

t("Prompt Coach: a vague prompt misses goal, file and check", () => {
  const c = promptCoach("make it better")
  assert.deepEqual([...c.missing], ["goal", "file", "success check"])
  assert.match(c.tip, /one verb/)
})

t("Prompt Coach: a complete prompt passes", () => {
  const c = promptCoach("Fix the room capacity bug in server/lobby.ts so the capacity test passes")
  assert.deepEqual([...c.missing], [])
  assert.match(c.tip, /Good prompt/)
})

t("Prompt Coach: missing file only asks for the file", () => {
  const c = promptCoach("Fix the room capacity bug so the capacity test passes")
  assert.deepEqual([...c.missing], ["file"])
  assert.match(c.tip, /Name the file/)
})

console.log(`explain.check: ${passed}/${passed} passed`)
