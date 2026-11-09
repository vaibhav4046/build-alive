#!/usr/bin/env node
// bridge/claude-hook-cli.mjs - forwards a Claude Code hook (stdin JSON) to the local BUILD ALIVE bridge.
// Register it as a command hook (PreToolUse / PostToolUse / PostToolUseFailure); see devpost/evidence/G2-live-event.md.
// Safety: loopback only, shared-secret header from bridge/.hook-token, 1.5 s timeout, and it ALWAYS exits 0 with no output
// so it can never block or alter a Claude Code tool call. The bridge decides what is inside an approved root.
import fs from "node:fs"
import http from "node:http"
import path from "node:path"
import {fileURLToPath} from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const hookName = process.argv[2] || ""
const port = Number(process.env.BUILD_ALIVE_PORT || 8787)

function done() {
  process.exit(0)
}

let raw = ""
process.stdin.setEncoding("utf8")
process.stdin.on("data", (c) => {
  if (raw.length < 256 * 1024) raw += c
})
process.stdin.on("end", () => {
  let input
  try {
    input = JSON.parse(raw)
  } catch (_e) {
    return done()
  }
  let token
  try {
    token = fs.readFileSync(path.join(here, ".hook-token"), "utf8").trim()
  } catch (_e) {
    return done()
  }
  const ti = input && typeof input.tool_input === "object" && input.tool_input ? input.tool_input : {}
  const body = JSON.stringify({
    hookName: hookName || input.hook_event_name,
    data: {
      sessionId: String(input.session_id || "claude-session").slice(0, 40),
      toolName: String(input.tool_name || "tool").slice(0, 40),
      params: {
        file_path: ti.file_path || ti.path || ti.notebook_path || "",
        cwd: input.cwd || "",
      },
    },
  })
  const req = http.request(
    {host: "127.0.0.1", port, path: "/hook", method: "POST", timeout: 1500, headers: {"Content-Type": "application/json", "x-build-alive-token": token, "Content-Length": Buffer.byteLength(body)}},
    (res) => {
      res.resume()
      res.on("end", done)
    },
  )
  req.on("error", done)
  req.on("timeout", () => {
    req.destroy()
    done()
  })
  req.end(body)
})
