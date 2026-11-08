// bridge/action-gate.mjs
// Cryptographically verified, nonce-enforced action gate.
// Enforces that only pre-allowlisted, user-approved actions can trigger host executions.

import crypto from "node:crypto"

export const ALLOWLISTED_ACTIONS = Object.freeze({
  RUN_KNOWN_TEST: "run_known_test",
  OPEN_READ_ONLY_DIFF: "open_read_only_diff",
  REQUEST_EXPLANATION: "request_explanation",
})

export class ActionGate {
  constructor({onExecuteAction, journal} = {}) {
    this.onExecuteAction = onExecuteAction || null
    this.journal = journal || null
    this.pendingRequests = new Map()
    this.auditReceipts = []
  }

  proposeAction({actionId, targetFile, metadata = {}}) {
    const validIds = Object.values(ALLOWLISTED_ACTIONS)
    if (!validIds.includes(actionId)) {
      return {
        ok: false,
        reason: `PROHIBITED_ACTION: action '${actionId}' is not in the allowlist [${validIds.join(", ")}]`,
      }
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const nonce = crypto.randomBytes(16).toString("hex")

    const proposal = {
      requestId,
      actionId,
      targetFile: String(targetFile || ""),
      nonce,
      metadata,
      status: "PENDING_HUMAN_APPROVAL",
      createdAt: Date.now(),
    }

    this.pendingRequests.set(requestId, proposal)
    return {ok: true, proposal}
  }

  resolveApproval({requestId, nonce, actorConfirmation, approved}) {
    const req = this.pendingRequests.get(requestId)
    if (!req) {
      return {ok: false, reason: "NOT_FOUND: unknown requestId"}
    }
    if (req.status !== "PENDING_HUMAN_APPROVAL") {
      return {ok: false, reason: `INVALID_STATE: request is already ${req.status}`}
    }
    if (req.nonce !== nonce) {
      return {ok: false, reason: "SECURITY_VIOLATION: nonce mismatch"}
    }
    if (!actorConfirmation || typeof actorConfirmation !== "string" || actorConfirmation.trim().length === 0) {
      return {ok: false, reason: "REJECTED: explicit actor confirmation required"}
    }

    const timestamp = Date.now()
    const signature = crypto
      .createHash("sha256")
      .update(`${requestId}:${nonce}:${approved}:${actorConfirmation}:${timestamp}`)
      .digest("hex")

    const receipt = {
      receiptId: `rcpt_${signature.slice(0, 12)}`,
      requestId,
      actionId: req.actionId,
      targetFile: req.targetFile,
      approved: Boolean(approved),
      actorConfirmation,
      timestamp,
      signature,
    }

    req.status = approved ? "APPROVED" : "REJECTED"
    this.auditReceipts.push(receipt)

    if (this.journal) {
      this.journal.append({
        type: "approval_resolved",
        receipt,
      })
    }

    let executionResult = null
    if (approved && typeof this.onExecuteAction === "function") {
      try {
        executionResult = this.onExecuteAction(req)
        req.status = "EXECUTED"
      } catch (err) {
        req.status = "EXECUTION_FAILED"
        executionResult = {error: err.message}
      }
    }

    return {
      ok: true,
      receipt,
      executionResult,
    }
  }

  getAuditReceipts() {
    return [...this.auditReceipts]
  }
}
