// Security + behavior tests for the Claude Code /hook receiver (auth, root scoping, size cap, DNS-rebinding guard).
// run: node devpost/tests/bridge-hook.test.mjs   (starts a throwaway bridge on 127.0.0.1:8993; no real token is read or changed)
import assert from "node:assert/strict"
import fs from "node:fs"
import http from "node:http"
import os from "node:os"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {createBridgeServer} from "../../bridge/ws-server.mjs"

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, "..", "..")
const roots = path.join(repo, "bridge", "approved-roots.json")
const tokenPath = path.join(os.tmpdir(), "build-alive-test-hook-token-" + process.pid)
const PORT = 8993

const bridge = createBridgeServer({port: PORT, workspaceConfigPath: roots, hookTokenPath: tokenPath})
await bridge.listen()
const TOKEN = fs.readFileSync(tokenPath, "utf8").trim()

function call(method, url, {body = "", headers = {}} = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({host: "127.0.0.1", port: PORT, path: url, method, agent: false, headers: {"Content-Length": Buffer.byteLength(body), ...headers}}, (res) => {
      let out = ""
      res.on("data", (c) => (out += c))
      res.on("end", () => resolve({status: res.statusCode, body: out}))
    })
    req.on("error", reject)
    req.end(body)
  })
}
const hook = (obj, token = TOKEN, extra = {}) =>
  call("POST", "/hook", {body: typeof obj === "string" ? obj : JSON.stringify(obj), headers: {"Content-Type": "application/json", ...(token ? {"x-build-alive-token": token} : {}), ...extra}})

let passed = 0
const results = []
async function t(name, fn) {
  try {
    await fn()
    passed++
    results.push("PASS " + name)
  } catch (e) {
    results.push("FAIL " + name + " :: " + e.message)
  }
}

const inRepo = path.join(repo, "bridge", "journal.mjs")
const payload = (file, hookName = "PostToolUse", extra = {}) => ({hookName, data: {sessionId: "ses_test", toolName: "Edit", params: {file_path: file}, ...extra}})

await t("no token -> 401", async () => assert.equal((await hook(payload(inRepo), "")).status, 401))
await t("wrong token -> 401", async () => assert.equal((await hook(payload(inRepo), "0".repeat(64))).status, 401))
await t("token of wrong length -> 401 (no crash)", async () => assert.equal((await hook(payload(inRepo), "abc")).status, 401))
await t("valid token + file in approved repo -> 200 earthproof LIVE_VERIFIED", async () => {
  const r = await hook(payload(inRepo))
  assert.equal(r.status, 200)
  const j = JSON.parse(r.body)
  assert.equal(j.accepted, true)
  assert.equal(j.projectId, "earthproof")
  assert.equal(j.provenance, "LIVE_VERIFIED")
  assert.ok(j.eventId)
})
await t("file outside approved roots -> 403", async () => assert.equal((await hook(payload("C:\\Windows\\System32\\drivers\\etc\\hosts"))).status, 403))
await t("path traversal out of the root -> 403", async () => assert.equal((await hook(payload(path.join(repo, "..", "..", "..", "Windows", "win.ini")))).status, 403))
await t("secret-named file inside root is accepted but its name is not journaled", async () => {
  const r = await hook(payload(path.join(repo, "bridge", ".env")))
  assert.equal(r.status, 200)
  const journal = (await call("GET", "/journal")).body
  assert.ok(!/\.env/.test(journal), "journal must not contain the secret file name")
})
await t("cwd-only (Bash) inside root -> 200", async () => {
  const r = await hook({hookName: "PreToolUse", data: {sessionId: "s", toolName: "Bash", params: {cwd: repo}}})
  assert.equal(r.status, 200)
})
await t("cwd-only outside root -> 403", async () => {
  const r = await hook({hookName: "PreToolUse", data: {sessionId: "s", toolName: "Bash", params: {cwd: "C:\\Users\\Public"}}})
  assert.equal(r.status, 403)
})
await t("unknown hookName -> 400", async () => assert.equal((await hook({hookName: "Evil", data: {params: {file_path: inRepo}}})).status, 400))
await t("invalid JSON -> 400", async () => assert.equal((await hook("{not json")).status, 400))
await t("oversize body -> 413 (bridge survives)", async () => {
  let status = 0
  try {
    status = (await hook(JSON.stringify({hookName: "PostToolUse", data: {pad: "x".repeat(70 * 1024)}}))).status
  } catch (_e) {
    status = 413 // connection reset after the 413 reply counts
  }
  assert.equal(status, 413)
  assert.equal((await call("GET", "/health")).status, 200)
})
await t("non-loopback Host header -> 403 (DNS rebinding guard)", async () => assert.equal((await hook(payload(inRepo), TOKEN, {Host: "evil.example.com"})).status, 403))
await t("/providers reports claude-code LIVE_CONNECTED after an accepted hook", async () => {
  const p = JSON.parse((await call("GET", "/providers")).body)
  assert.equal(p.providers.find((x) => x.provider === "claude-code").status, "LIVE_CONNECTED")
})
await t("token never appears in /journal or /providers", async () => {
  const all = (await call("GET", "/journal")).body + (await call("GET", "/providers")).body
  assert.ok(!all.includes(TOKEN))
})
await t("secrets in tool name are redacted before journaling", async () => {
  const r = await hook({hookName: "PostToolUse", data: {sessionId: "s", toolName: "sk-ant-api03-ABCDEFGHIJKLMNOPQRSTUV", params: {file_path: inRepo}}})
  assert.equal(r.status, 200)
  assert.ok(!(await call("GET", "/journal")).body.includes("sk-ant-api03-ABCDEFGHIJKLMNOPQRSTUV"))
})

await bridge.close()
fs.rmSync(tokenPath, {force: true})
for (const line of results) console.log(line)
console.log(`bridge-hook.test: ${passed}/${results.length} passed`)
process.exit(passed === results.length ? 0 : 1)
