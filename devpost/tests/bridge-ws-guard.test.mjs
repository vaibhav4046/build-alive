// devpost/tests/bridge-ws-guard.test.mjs - WebSocket upgrade guards (security audit H1) and /antigravity auth (M1).
// Run: node devpost/tests/bridge-ws-guard.test.mjs
import net from "node:net"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import {createBridgeServer} from "../../bridge/ws-server.mjs"

const PORT = 8994
const tokenPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "ba-ws-")), ".hook-token")
const bridge = createBridgeServer({port: PORT, hookTokenPath: tokenPath})
await bridge.listen()
let pass = 0
let fail = 0
const check = (ok, name) => {
  console.log((ok ? "PASS " : "FAIL ") + name)
  ok ? pass++ : fail++
}
function upgrade(host, origin) {
  return new Promise((resolve) => {
    const s = net.connect(PORT, "127.0.0.1", () => {
      s.write(
        "GET /build-alive HTTP/1.1\r\nHost: " + host + "\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n" +
          "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\n" +
          (origin ? "Origin: " + origin + "\r\n" : "") + "\r\n",
      )
    })
    let data = ""
    s.on("data", (d) => {
      data += d
      s.destroy()
    })
    s.on("close", () => resolve(data.split("\r\n")[0] || "(closed)"))
    setTimeout(() => s.destroy(), 1500)
  })
}
check((await upgrade("127.0.0.1:" + PORT, null)).includes("101"), "Lens-style upgrade (no Origin) is accepted: 101")
check((await upgrade("127.0.0.1:" + PORT, "http://localhost:" + PORT)).includes("101"), "same-origin loopback page is accepted")
check((await upgrade("127.0.0.1:" + PORT, "http://localhost:5173")).includes("403"), "page on another localhost port is refused (403)")
check((await upgrade("127.0.0.1:" + PORT, "https://evil.example")).includes("403"), "foreign Origin is refused (403)")
check((await upgrade("evil.example:" + PORT, null)).includes("403"), "non-loopback Host (DNS rebinding) is refused (403)")
const r1 = await fetch(`http://127.0.0.1:${PORT}/antigravity`, {method: "POST", body: "{}"})
check(r1.status === 401, "/antigravity without token: 401")
const tok = fs.readFileSync(tokenPath, "utf8").trim()
const r2 = await fetch(`http://127.0.0.1:${PORT}/antigravity`, {method: "POST", headers: {"x-build-alive-token": tok}, body: "x".repeat(70 * 1024)}).catch(() => ({status: 413}))
check(r2.status === 413, "/antigravity oversize body: 413")
await bridge.close?.()
console.log(`bridge-ws-guard.test: ${pass}/${pass + fail} passed`)
process.exit(fail ? 1 : 0)
