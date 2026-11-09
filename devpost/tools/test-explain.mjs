// Unit tests for the plain-language layer (BuildAliveExplain.ts). Run: node devpost/tools/test-explain.mjs
import assert from "node:assert/strict"
import {explainCommand, explainStep, promptCoach} from "../../Assets/Scripts/BuildAliveExplain.ts"

let n = 0
const t = (name, fn) => {
  fn()
  n++
  console.log("PASS", name)
}

t("git diff = compare what changed", () => assert.equal(explainCommand("git diff HEAD~1").plain, "Compares what changed"))
t("npm test = run the checks", () => assert.equal(explainCommand("npm test").plain, "Runs the checks"))
t("node x.test.mjs = run the checks", () => assert.equal(explainCommand("node tests/room.test.mjs").plain, "Runs the checks"))
t("rg/grep = search for words", () => {
  assert.equal(explainCommand("rg players src").plain, "Searches for words in files")
  assert.equal(explainCommand("grep -rn maxPlayers .").kind, "search")
})
t("ls/dir = look inside a folder", () => {
  assert.equal(explainCommand("ls -la").plain, "Looks inside a folder")
  assert.equal(explainCommand("dir").plain, "Looks inside a folder")
})
t("cd = walk into a folder", () => assert.equal(explainCommand("cd server").plain, "Walks into a folder"))
t("unknown command is labelled unknown, never guessed", () => {
  const e = explainCommand("frobnicate --all")
  assert.equal(e.known, false)
  assert.match(e.plain, /do not have a plain-words name/)
})
t("empty command is honest", () => assert.equal(explainCommand("   ").known, false))
t("failed test explained with a grounded debug tip", () => {
  const s = explainStep({kind: "test_completed", status: "failed", summary: "room-capacity failed"})
  assert.match(s.what, /one failed/)
  assert.match(s.tip, /failing line and the test output/)
})
t("passed test says proof, not a feeling", () => assert.match(explainStep({kind: "test_completed", status: "succeeded"}).why, /proof/))
t("edit names the file in kid words", () => {
  const s = explainStep({kind: "tool_finished", status: "succeeded", summary: "PostToolUse: Modified server/lobby.ts (-1/+1 lines)", files: ["server/lobby.ts"]})
  assert.equal(s.kind, "edit")
  assert.equal(s.what, "Rewrote part of lobby.ts")
})
t("read opens a recipe book", () => assert.match(explainStep({kind: "tool_started", status: "running", summary: "Running Read on tool-action", files: ["a/b.ts"]}).what, /recipe book/))
t("Bash event goes through the command explainer", () => {
  const s = explainStep({kind: "tool_started", status: "running", summary: "Bash: git diff"})
  assert.equal(s.badge, "MACHINE")
  assert.match(s.what, /Compares what changed/)
})
t("subagent = helper joins", () => assert.match(explainStep({kind: "subagent_started", status: "running"}).what, /helper joined/))
t("approval asks the human first", () => assert.match(explainStep({kind: "approval_requested", status: "pending"}).why, /stay in charge/))
t("prompt coach flags a vague prompt", () => {
  const c = promptCoach("make it better")
  assert.ok(c.missing.includes("file") && c.missing.includes("success check"))
})
t("prompt coach praises goal + file + check", () => {
  const c = promptCoach("Fix the maxPlayers guard in server/lobby.ts and make the room-capacity test pass")
  assert.deepEqual(c.missing, [])
  assert.match(c.tip, /Good prompt/)
})
t("prompt coach asks for a file when missing", () => assert.match(promptCoach("please fix the join bug so the check passes").tip, /Name the file/))

console.log(n + " passed, 0 failed")
