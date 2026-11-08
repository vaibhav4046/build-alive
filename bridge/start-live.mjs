// bridge/start-live.mjs
// Starts the BUILD ALIVE Live Bridge on 127.0.0.1:8787 connected to all active Windows LLM/agent sessions
// (Antigravity brain transcripts, Claude Code project transcripts, OpenAI Codex rollouts).

import {createBridgeServer} from "./ws-server.mjs"
import {discoverWindowsSessions} from "./antigravity-adapter.mjs"

const port = Number(process.env.BUILD_ALIVE_PORT || 8787)
const discovered = discoverWindowsSessions()

console.log("=== BUILD ALIVE: WINDOWS LIVE LLM & AGENT CONNECTOR ===")
console.log(`Antigravity active sessions : ${discovered.antigravitySessions.length}`)
for (const s of discovered.antigravitySessions.slice(0, 4)) {
  console.log(`  - [Antigravity] ${s.sessionId} (${s.role}) | ${s.stepCount} steps | updated ${s.lastModified}`)
}
console.log(`Claude Code project sessions: ${discovered.claudeSessions.length}`)
for (const s of discovered.claudeSessions.slice(0, 3)) {
  console.log(`  - [Claude Code] ${s.sessionId} | ${s.sizeBytes} bytes | updated ${s.lastModified}`)
}
console.log(`OpenAI Codex rollout logs   : ${discovered.codexSessions.length}`)
for (const s of discovered.codexSessions.slice(0, 2)) {
  console.log(`  - [Codex]       ${s.sessionId} | updated ${s.lastModified}`)
}

const bridge = createBridgeServer({
  port,
  watchWindowsSessions: true,
})

await bridge.listen()
console.log(`\n[LIVE] WebSocket stream active: ws://127.0.0.1:${port}/build-alive`)
console.log(`[LIVE] Session status endpoint: http://127.0.0.1:${port}/sessions`)
console.log(`[LIVE] Health check endpoint  : http://127.0.0.1:${port}/health`)
console.log(`[LIVE] Pre-loaded ${bridge.journal.getAllEvents().length} real Windows session events into journal.`)
