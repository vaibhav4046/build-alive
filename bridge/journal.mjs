// bridge/journal.mjs
// Append-only JSONL event journal with SHA-256 state hashing and monotonic sequence numbers.

import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import {redactEventPayload} from "./redactor.mjs"

export class EventJournal {
  constructor(journalFilePath) {
    this.journalFilePath = journalFilePath
    this.currentSeq = 0
    this.lastHash = "0".repeat(64)
    this.events = []

    if (this.journalFilePath && fs.existsSync(this.journalFilePath)) {
      this.replayFromDisk()
    }
  }

  append(event) {
    const redacted = redactEventPayload(event)
    this.currentSeq++
    redacted.seq = this.currentSeq
    redacted.ts = Date.now()

    const eventHash = crypto
      .createHash("sha256")
      .update(`${this.lastHash}:${redacted.seq}:${JSON.stringify(redacted)}`)
      .digest("hex")

    redacted.journalHash = eventHash
    this.lastHash = eventHash
    this.events.push(redacted)

    if (this.journalFilePath) {
      fs.mkdirSync(path.dirname(this.journalFilePath), {recursive: true})
      fs.appendFileSync(this.journalFilePath, JSON.stringify(redacted) + "\n", "utf8")
    }

    return redacted
  }

  replayFromDisk() {
    const raw = fs.readFileSync(this.journalFilePath, "utf8")
    const lines = raw.split("\n").filter((l) => l.trim().length > 0)
    this.events = []
    this.lastHash = "0".repeat(64)

    for (const line of lines) {
      try {
        const ev = JSON.parse(line)
        this.events.push(ev)
        this.currentSeq = Math.max(this.currentSeq, ev.seq || 0)
        if (ev.journalHash) this.lastHash = ev.journalHash
      } catch (_e) {
        // Skip malformed journal lines cleanly
      }
    }
  }

  getAllEvents() {
    return [...this.events]
  }

  getHeadHash() {
    return this.lastHash
  }
}

/**
 * History for a reconnecting client (persistent workspace): the last few sessions from the journal, newest first, each with a handful of its
 * latest events in a compact form. Everything in it is RECORDED history, never live: the client must not treat it as new activity.
 * Pure function (no I/O) so it can be unit-tested.
 */
export function buildHistory(events, opts = {}) {
  const maxSessions = opts.maxSessions ?? 3
  const maxPerSession = opts.maxPerSession ?? 10
  const bySession = new Map()
  for (const ev of events) {
    if (!ev || typeof ev.sessionId !== "string" || typeof ev.kind !== "string") continue
    const ts = typeof ev.ts === "number" ? ev.ts : Date.parse(ev.timestamp || "")
    if (!Number.isFinite(ts)) continue
    let s = bySession.get(ev.sessionId)
    if (!s) {
      s = {sessionId: ev.sessionId, projectId: String(ev.projectId || ""), startedAt: ts, lastAt: ts, count: 0, events: []}
      bySession.set(ev.sessionId, s)
    }
    s.startedAt = Math.min(s.startedAt, ts)
    s.lastAt = Math.max(s.lastAt, ts)
    s.count++
    s.events.push({
      kind: ev.kind,
      status: String(ev.status || ""),
      summary: String(ev.summary || "").slice(0, 160),
      actor: String(ev.actor || ""),
      fileAliases: Array.isArray(ev.fileAliases) ? ev.fileAliases.slice(0, 3).map(String) : [],
      ts,
    })
  }
  const sessions = [...bySession.values()]
    .sort((a, b) => b.lastAt - a.lastAt)
    .slice(0, maxSessions)
    .map((s) => ({...s, events: s.events.slice(-maxPerSession)}))
  return {type: "history", label: "RECORDED", generatedAt: Date.now(), sessions}
}
