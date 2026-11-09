// bridge/start-g2.mjs - workspace bridge (GET /workspace, POST /hook, ws /build-alive) with a persistent journal,
// so every real Claude Code hook event is kept as a receipt: devpost/receipts/g2-live/journal.jsonl
import path from "node:path"
import {fileURLToPath} from "node:url"
import {createBridgeServer} from "./ws-server.mjs"

const here = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.BUILD_ALIVE_PORT || 8787)
const bridge = createBridgeServer({
  port,
  workspaceConfigPath: path.join(here, "approved-roots.json"),
  journalPath: path.join(here, "..", "devpost", "receipts", "g2-live", "journal.jsonl"),
})
await bridge.listen()
console.log(`[BUILD ALIVE] G2 bridge on ws://127.0.0.1:${port}/build-alive, journal devpost/receipts/g2-live/journal.jsonl`)
