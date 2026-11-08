// bridge/start-workspace.mjs — BUILD ALIVE 3.0 real-workspace bridge (127.0.0.1 only, Preview on this PC).
// Scans ONLY roots in approved-roots.json, serves the real worlds, tails live agent sessions.
import path from "node:path"
import {fileURLToPath} from "node:url"
import {createBridgeServer} from "./ws-server.mjs"

const here = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.BUILD_ALIVE_PORT || 8787)
const bridge = createBridgeServer({port, workspaceConfigPath: path.join(here, "approved-roots.json")})
await bridge.listen()
console.log(`[BUILD ALIVE 3.0] workspace bridge on ws://127.0.0.1:${port}/build-alive  (GET /workspace /providers /journal /health)`)
