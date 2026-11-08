// bridge/codex-adapter.mjs
// Translates Codex session.event notifications into canonical BUILD ALIVE v1 EventEnvelopes.

import {redactEventPayload, sanitizeFileAlias} from "./redactor.mjs"

export function normalizeCodexEvent(rawCodexEvent) {
  if (!rawCodexEvent || typeof rawCodexEvent !== "object") return null

  const eventType = rawCodexEvent.type || "unknown"
  const base = {
    v: 1,
    eventId: `ev_codex_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sessionId: rawCodexEvent.sessionId || "ses_codex_01",
    projectId: rawCodexEvent.projectId || "lobby-sync",
    timestamp: new Date().toISOString(),
    source: "codex-sdk",
    provenance: "TESTED",
  }

  if (eventType === "file_change" || eventType === "file_edit") {
    const alias = sanitizeFileAlias(rawCodexEvent.path || "").alias
    return redactEventPayload({
      ...base,
      actor: "primary-agent",
      kind: "tool_finished",
      status: "succeeded",
      fileAliases: [alias],
      evidenceIds: [],
      summary: `Codex edit ${alias} (+${rawCodexEvent.linesAdded || 0}/-${rawCodexEvent.linesRemoved || 0})`,
    })
  }

  if (eventType === "command_run") {
    const isTest = (rawCodexEvent.command || "").includes("test")
    const passed = rawCodexEvent.exitCode === 0
    return redactEventPayload({
      ...base,
      actor: "primary-agent",
      kind: isTest ? "test_completed" : "tool_finished",
      status: passed ? "succeeded" : "failed",
      fileAliases: ["test-suite"],
      evidenceIds: passed ? [] : ["ev-fail-room03"],
      summary: `Codex exec: ${rawCodexEvent.command || ""}`,
      redactedOutput: passed ? "" : rawCodexEvent.stderr || "non-zero exit",
    })
  }

  return null
}
