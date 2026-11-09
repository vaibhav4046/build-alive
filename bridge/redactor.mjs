// bridge/redactor.mjs
// Secret and host-path scrubbing rules for incoming CLI/hook events.
// Enforces zero secret leakage and host environment privacy before events reach Lens Studio or storage.

const SECRET_PATTERNS = [
  /sk-ant-[a-zA-Z0-9_-]{20,}/g, // Anthropic API keys
  /ghp_[a-zA-Z0-9]{30,}/g, // GitHub Personal Access Tokens
  /gho_[a-zA-Z0-9]{30,}/g, // GitHub OAuth Tokens
  /github_pat_[a-zA-Z0-9_]{50,}/g, // GitHub Fine-grained PATs
  /xox[baprs]-[a-zA-Z0-9-]{10,}/g, // Slack tokens
  /AIza[0-9A-Za-z-_]{35}/g, // Google API keys
  /AKIA[0-9A-Z]{16}/g, // AWS Access Keys
  /gsk_[A-Za-z0-9]{20,}/g, // Groq API keys
  /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/g, // OpenAI-style keys
  /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, // JWTs
  /(?:token|secret|key|password|api)[^a-zA-Z0-9]{1,5}[0-9a-f]{32,64}/gi, // Credential hex secrets
  /bearer\s+[a-zA-Z0-9._~+/-]+=*/gi, // Authorization Bearer tokens
  /password\s*[:=]\s*['"][^'"]+['"]/gi, // Inline passwords
]

const HOST_PATH_PATTERNS = [
  /[A-Za-z]:[\/][Uu]sers[\/][a-zA-Z0-9._-]+[\/]?/g, // Windows C:\Users\<username> or C:/Users/<username>
  /\/home\/[a-zA-Z0-9._-]+\/?/g, // Linux /home/<username>
  /\/Users\/[a-zA-Z0-9._-]+\/?/g, // macOS /Users/<username>
]

export function scrubSecrets(input) {
  if (typeof input !== "string") return ""
  let scrubbed = input

  // Scrub known secret tokens
  for (const pattern of SECRET_PATTERNS) {
    scrubbed = scrubbed.replace(pattern, "[REDACTED_SECRET]")
  }

  // Scrub personal host paths
  for (const pattern of HOST_PATH_PATTERNS) {
    scrubbed = scrubbed.replace(pattern, "[REDACTED_USER_PATH]")
  }

  return scrubbed
}

export function sanitizeFileAlias(filePath) {
  if (!filePath || typeof filePath !== "string") {
    return {ok: false, alias: "unknown/file", reason: "missing_or_non_string"}
  }
  const clean = scrubSecrets(filePath).replace(/\\/g, "/")
  const segments = clean.split("/").filter(Boolean)

  if (segments.some((s) => s === ".." || s === ".")) {
    return {ok: false, alias: "sanitized/file", reason: "directory_traversal_prohibited"}
  }

  // Keep last 3 meaningful path components for clear, concise spatial badges
  const rel = segments.slice(-3).join("/")
  return {ok: true, alias: rel}
}

export function redactEventPayload(rawEvent) {
  if (!rawEvent || typeof rawEvent !== "object") return null
  const clone = structuredClone(rawEvent)

  if (typeof clone.summary === "string") {
    clone.summary = scrubSecrets(clone.summary)
  }
  if (typeof clone.redactedOutput === "string") {
    clone.redactedOutput = scrubSecrets(clone.redactedOutput)
  }
  if (Array.isArray(clone.fileAliases)) {
    clone.fileAliases = clone.fileAliases.map((f) => sanitizeFileAlias(f).alias)
  }
  return clone
}
