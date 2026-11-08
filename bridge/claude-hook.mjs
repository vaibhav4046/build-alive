// bridge/claude-hook.mjs
// Normalizes Claude Code lifecycle hook payloads into canonical BUILD ALIVE v1 EventEnvelopes.
// Handles PreToolUse, PostToolUse, PostToolUseFailure, SubagentStart, SubagentStop.

import {redactEventPayload, sanitizeFileAlias} from "./redactor.mjs"

export function normalizeClaudeHookEvent(hookName, hookData) {
  if (!hookName || typeof hookData !== "object" || hookData === null) {
    return null
  }

  const base = {
    v: 1,
    eventId: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sessionId: hookData.sessionId || "ses_claude_01",
    projectId: hookData.projectId || "lobby-sync",
    timestamp: new Date().toISOString(),
    source: "claude-hooks",
    provenance: "LIVE_VERIFIED",
  }

  switch (hookName) {
    case "PreToolUse": {
      const toolName = hookData.toolName || "tool"
      const filePath = hookData.params?.file_path || hookData.params?.path || ""
      const fileAlias = filePath ? sanitizeFileAlias(filePath).alias : "tool-action"
      return redactEventPayload({
        ...base,
        actor: hookData.subagentId ? `subagent:${hookData.subagentId}` : "primary-agent",
        kind: "tool_started",
        status: "running",
        fileAliases: [fileAlias],
        evidenceIds: [],
        summary: `Running ${toolName} on ${fileAlias}`,
      })
    }

    case "PostToolUse": {
      const toolName = hookData.toolName || "tool"
      const filePath = hookData.params?.file_path || hookData.params?.path || ""
      const fileAlias = filePath ? sanitizeFileAlias(filePath).alias : "tool-action"
      const isTest = toolName.includes("test") || fileAlias.includes("test")
      return redactEventPayload({
        ...base,
        actor: hookData.subagentId ? `subagent:${hookData.subagentId}` : "primary-agent",
        kind: isTest ? "test_completed" : "tool_finished",
        status: "succeeded",
        fileAliases: [fileAlias],
        evidenceIds: [],
        summary: `Completed ${toolName} on ${fileAlias}`,
      })
    }

    case "PostToolUseFailure": {
      const filePath = hookData.params?.file_path || hookData.params?.path || ""
      const fileAlias = filePath ? sanitizeFileAlias(filePath).alias : "test-suite"
      return redactEventPayload({
        ...base,
        actor: hookData.subagentId ? `subagent:${hookData.subagentId}` : "primary-agent",
        kind: "test_completed",
        status: "failed",
        fileAliases: [fileAlias],
        evidenceIds: ["ev-fail-room03"],
        summary: `Failure in ${fileAlias}: ${hookData.error || "assertion failed"}`,
        redactedOutput: String(hookData.error || "assertion failed"),
      })
    }

    case "SubagentStart": {
      return redactEventPayload({
        ...base,
        actor: `subagent:${hookData.subagentId || "01"}`,
        kind: "subagent_started",
        status: "running",
        fileAliases: [],
        evidenceIds: [],
        summary: `Spawned subagent ${hookData.role || "Verifier"}`,
      })
    }

    case "SubagentStop": {
      return redactEventPayload({
        ...base,
        actor: `subagent:${hookData.subagentId || "01"}`,
        kind: "subagent_stopped",
        status: "succeeded",
        fileAliases: [],
        evidenceIds: [],
        summary: `Subagent completed verification`,
      })
    }

    default:
      return null
  }
}
