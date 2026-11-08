// bridge/ws-server.mjs
// Zero-dependency native Node.js HTTP + RFC 6455 WebSocket Bridge server (default port 8787).
// Uses stdlib node:http and node:crypto — requires NO external npm packages.
// Securely streams redacted, journaled events to Lens Studio and handles allowlisted action execution.

import http from "node:http"
import crypto from "node:crypto"
import {EventJournal} from "./journal.mjs"
import {ActionGate, ALLOWLISTED_ACTIONS} from "./action-gate.mjs"
import {normalizeClaudeHookEvent} from "./claude-hook.mjs"
import {runDemoRepoSuite} from "../demo-repo/tests/room-capacity.test.mjs"

const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

function encodeTextFrame(text) {
  const payload = Buffer.from(text, "utf8")
  const len = payload.length
  let header
  if (len < 126) {
    header = Buffer.from([0x81, len])
  } else if (len <= 65535) {
    header = Buffer.alloc(4)
    header[0] = 0x81
    header[1] = 126
    header.writeUInt16BE(len, 2)
  } else {
    header = Buffer.alloc(10)
    header[0] = 0x81
    header[1] = 127
    header.writeBigUInt64BE(BigInt(len), 2)
  }
  return Buffer.concat([header, payload])
}

function decodeFrame(buf) {
  if (buf.length < 2) return null
  const opcode = buf[0] & 0x0f
  const masked = (buf[1] & 0x80) !== 0
  let payloadLen = buf[1] & 0x7f
  let offset = 2

  if (payloadLen === 126) {
    if (buf.length < offset + 2) return null
    payloadLen = buf.readUInt16BE(offset)
    offset += 2
  } else if (payloadLen === 127) {
    if (buf.length < offset + 8) return null
    payloadLen = Number(buf.readBigUInt64BE(offset))
    offset += 8
  }

  let maskKey = null
  if (masked) {
    if (buf.length < offset + 4) return null
    maskKey = buf.slice(offset, offset + 4)
    offset += 4
  }

  if (buf.length < offset + payloadLen) return null
  const payload = buf.slice(offset, offset + payloadLen)
  if (masked && maskKey) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= maskKey[i % 4]
    }
  }

  return {opcode, payload, totalLen: offset + payloadLen}
}

export function createBridgeServer({port = 8787, journalPath = null} = {}) {
  const journal = new EventJournal(journalPath)

  const actionGate = new ActionGate({
    journal,
    onExecuteAction: (req) => {
      if (req.actionId === ALLOWLISTED_ACTIONS.RUN_KNOWN_TEST) {
        const testRes = runDemoRepoSuite({useBuggyGuard: false})
        return {success: testRes.passed, testSummary: `${testRes.passedCount}/${testRes.total} tests passed`}
      }
      return {success: true, detail: "action handled"}
    },
  })

  const clients = new Set()

  const server = http.createServer((req, res) => {
    // Health probe endpoint
    if (req.url === "/health") {
      res.writeHead(200, {"Content-Type": "application/json"})
      res.end(JSON.stringify({status: "ok", journalLength: journal.getAllEvents().length}))
      return
    }

    // Claude Code hook receiver
    if (req.method === "POST" && req.url === "/hook") {
      let body = ""
      req.on("data", (chunk) => (body += chunk))
      req.on("end", () => {
        try {
          const payload = JSON.parse(body)
          const normalized = normalizeClaudeHookEvent(payload.hookName, payload.data)
          if (normalized) {
            const saved = journal.append(normalized)
            broadcast(saved)
            res.writeHead(200, {"Content-Type": "application/json"})
            res.end(JSON.stringify({accepted: true, seq: saved.seq}))
            return
          }
          res.writeHead(400, {"Content-Type": "application/json"})
          res.end(JSON.stringify({accepted: false, reason: "invalid_hook_format"}))
        } catch (e) {
          res.writeHead(400, {"Content-Type": "application/json"})
          res.end(JSON.stringify({accepted: false, error: e.message}))
        }
      })
      return
    }

    res.writeHead(404)
    res.end()
  })

  function broadcast(event) {
    const frame = encodeTextFrame(JSON.stringify(event))
    for (const socket of clients) {
      if (!socket.destroyed) {
        socket.write(frame)
      }
    }
  }

  server.on("upgrade", (req, socket, head) => {
    if (req.url !== "/build-alive" && !req.url?.startsWith("/build-alive")) {
      socket.destroy()
      return
    }

    // Origin header verification (mitigates Cross-Site WebSocket Hijacking T07)
    const origin = req.headers["origin"]
    if (origin) {
      try {
        const u = new URL(origin)
        const host = u.hostname.toLowerCase()
        if (host !== "localhost" && host !== "127.0.0.1" && host !== "::1") {
          socket.write("HTTP/1.1 403 Forbidden\r\n\r\n")
          socket.destroy()
          return
        }
      } catch (_e) {
        socket.write("HTTP/1.1 403 Forbidden\r\n\r\n")
        socket.destroy()
        return
      }
    }

    const key = req.headers["sec-websocket-key"]
    if (!key) {
      socket.destroy()
      return
    }

    const accept = crypto
      .createHash("sha1")
      .update(key + WS_GUID)
      .digest("base64")

    const headers = [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${accept}`,
      "\r\n",
    ]
    socket.write(headers.join("\r\n"))
    clients.add(socket)

    // Replay journal history so connected client gets current timeline
    for (const ev of journal.getAllEvents()) {
      socket.write(encodeTextFrame(JSON.stringify(ev)))
    }

    let buf = head && head.length > 0 ? head : Buffer.alloc(0)

    socket.on("data", (chunk) => {
      buf = Buffer.concat([buf, chunk])
      while (true) {
        const decoded = decodeFrame(buf)
        if (!decoded) break
        buf = buf.slice(decoded.totalLen)

        if (decoded.opcode === 0x8) {
          // Close frame
          socket.end(encodeTextFrame(""))
          clients.delete(socket)
          break
        }
        if (decoded.opcode === 0x9) {
          // Ping frame -> send Pong (0xA)
          const pong = Buffer.from([0x8a, 0x00])
          socket.write(pong)
          continue
        }
        if (decoded.opcode === 0x1) {
          // Text message from client
          try {
            const rawText = decoded.payload.toString("utf8")
            const msg = JSON.parse(rawText)

            // 2-Step Nonce Enforced Action Approval Flow
            if (msg.type === "propose_action" && msg.actionId) {
              const prop = actionGate.proposeAction({
                actionId: msg.actionId,
                targetFile: msg.targetFile || "tests/room-capacity.test.mjs",
                metadata: msg.metadata || {},
              })
              socket.write(
                encodeTextFrame(
                  JSON.stringify({
                    type: "action_proposal",
                    ok: prop.ok,
                    proposal: prop.proposal,
                    reason: prop.reason,
                  }),
                ),
              )
            } else if (msg.type === "resolve_approval" && msg.requestId && msg.nonce) {
              const outcome = actionGate.resolveApproval({
                requestId: msg.requestId,
                nonce: msg.nonce,
                actorConfirmation: msg.actorConfirmation || "LENS_STUDIO_PINCH_CONFIRMED",
                approved: msg.approved !== false,
              })
              socket.write(
                encodeTextFrame(
                  JSON.stringify({
                    type: "action_receipt",
                    ok: outcome.ok,
                    receipt: outcome.receipt,
                    reason: outcome.reason,
                  }),
                ),
              )
            } else if (msg.type === "approved_action" && msg.actionId) {
              // Backward-compatible single-step approval for preview/test harnesses
              const prop = actionGate.proposeAction({
                actionId: msg.actionId,
                targetFile: msg.targetFile || "tests/room-capacity.test.mjs",
              })
              if (prop.ok) {
                const outcome = actionGate.resolveApproval({
                  requestId: prop.proposal.requestId,
                  nonce: prop.proposal.nonce,
                  actorConfirmation: "LENS_STUDIO_PINCH_CONFIRMED",
                  approved: true,
                })
                socket.write(encodeTextFrame(JSON.stringify({type: "action_receipt", receipt: outcome.receipt})))
              }
            }
          } catch (_err) {
            // ignore client parse error
          }
        }
      }
    })

    socket.on("close", () => clients.delete(socket))
    socket.on("error", () => clients.delete(socket))
  })

  return {
    server,
    journal,
    actionGate,
    broadcast,
    listen: () =>
      new Promise((resolve) => {
        server.listen(port, "127.0.0.1", () => resolve({port}))
      }),
    close: () =>
      new Promise((resolve) => {
        for (const s of clients) s.destroy()
        clients.clear()
        server.close(resolve)
      }),
  }
}
