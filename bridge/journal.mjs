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
