// BuildAliveExplain: deterministic plain-language layer (pure; no Lens globals, runs in Node tests).
// Every agent step is shown as a one-sentence "kid" caption first; the exact command / output stays one tap deeper.
// This is rule-based wording, not AI reasoning: unknown commands are labelled as unknown, never guessed.

export type StepKind = "read" | "search" | "edit" | "command" | "test" | "helper" | "ask" | "start" | "other"

export interface CommandExplanation {
  readonly known: boolean
  readonly kind: StepKind
  /** Kid sentence, present tense, no jargon. */
  readonly plain: string
}

interface Rule {
  readonly test: RegExp
  readonly kind: StepKind
  readonly plain: string
}

// Order matters: first match wins. Patterns look at the start of the command or at a recognisable verb.
const COMMAND_RULES: readonly Rule[] = [
  {test: /^\s*git\s+diff\b/i, kind: "read", plain: "Compares what changed"},
  {test: /^\s*git\s+status\b/i, kind: "read", plain: "Checks which files changed"},
  {test: /^\s*git\s+log\b/i, kind: "read", plain: "Reads the history of changes"},
  {test: /^\s*git\s+(add|commit)\b/i, kind: "command", plain: "Saves the changes into the project history"},
  {test: /^\s*git\s+push\b/i, kind: "command", plain: "Sends the saved changes to the shared copy"},
  {test: /^\s*(npm|pnpm|yarn)\s+(run\s+)?test\b|^\s*node\s+\S*\.test\.\w+|^\s*(pytest|vitest|jest)\b|^\s*go\s+test\b|^\s*cargo\s+test\b/i, kind: "test", plain: "Runs the checks"},
  {test: /^\s*(npm|pnpm|yarn)\s+(run\s+)?build\b|^\s*tsc\b/i, kind: "command", plain: "Builds the project to see if it fits together"},
  {test: /^\s*(npm|pnpm|yarn)\s+(install|i|add)\b|^\s*pip\s+install\b/i, kind: "command", plain: "Fetches helper tools the project needs"},
  {test: /^\s*(rg|grep|findstr|ag)\b/i, kind: "search", plain: "Searches for words in files"},
  {test: /^\s*(find|fd)\b/i, kind: "search", plain: "Looks for files by name"},
  {test: /^\s*(ls|dir|tree)\b/i, kind: "read", plain: "Looks inside a folder"},
  {test: /^\s*(cd|pushd|popd)\b/i, kind: "command", plain: "Walks into a folder"},
  {test: /^\s*(cat|type|head|tail|less|more)\b/i, kind: "read", plain: "Reads a file"},
  {test: /^\s*(mkdir|touch|new-item)\b/i, kind: "command", plain: "Makes a new file or folder"},
  {test: /^\s*(rm|del|rmdir|remove-item)\b/i, kind: "command", plain: "Deletes a file or folder"},
  {test: /^\s*(cp|copy|mv|move|rename)\b/i, kind: "command", plain: "Copies or moves a file"},
  {test: /^\s*(curl|wget|invoke-webrequest)\b/i, kind: "command", plain: "Asks a website or service for something"},
  {test: /^\s*(node|python|python3|deno|bun)\b/i, kind: "command", plain: "Runs a program"},
  {test: /^\s*(echo|write-output|print)\b/i, kind: "command", plain: "Prints a message"},
]

/** Maps a shell command to plain words. Unknown commands say so honestly. */
export function explainCommand(command: string): CommandExplanation {
  const cmd = (command || "").trim()
  if (cmd.length === 0) return {known: false, kind: "other", plain: "Runs a command (nothing to show)"}
  for (const r of COMMAND_RULES) {
    if (r.test.test(cmd)) return {known: true, kind: r.kind, plain: r.plain}
  }
  return {known: false, kind: "other", plain: "Runs a command we do not have a plain-words name for yet"}
}

export interface StepExplanation {
  readonly kind: StepKind
  /** One kid sentence: what happened. */
  readonly what: string
  /** Why it matters. */
  readonly why: string
  /** What to try next (a prompt or debug tip grounded in this event). */
  readonly tip: string
  /** Short word used in lists. */
  readonly badge: string
}

export interface StepInput {
  readonly kind: string
  readonly status: string
  readonly summary?: string
  readonly files?: readonly string[]
  readonly actor?: string
}

const lastName = (p: string): string => {
  const parts = p.replace(/\\/g, "/").split("/")
  return parts[parts.length - 1] || p
}

/** Explains one agent event in three layers: what / why it matters / what to try. Deterministic. */
export function explainStep(ev: StepInput): StepExplanation {
  const text = ev.summary || ""
  const file = ev.files && ev.files.length > 0 ? lastName(ev.files[0]) : ""
  const failed = ev.status === "failed"

  if (ev.kind === "test_completed") {
    if (failed) {
      return {
        kind: "test",
        badge: "CHECK",
        what: "The checks ran and one failed, so something is broken",
        why: "A failed check is the program telling you exactly where it disagrees with what you wanted",
        tip: "Ask the AI: show me the failing line and the test output before you change anything",
      }
    }
    return {
      kind: "test",
      badge: "CHECK",
      what: "The checks ran and all of them passed",
      why: "Passing checks are proof that the fix really works, not just a feeling",
      tip: "Ask the AI to say which check proves the fix, so you can run it yourself",
    }
  }
  if (ev.kind === "subagent_started") {
    return {
      kind: "helper",
      badge: "HELPER",
      what: "A helper joined to do one small job",
      why: "Splitting a big task into small jobs makes each one easier to check",
      tip: "Give each job one goal and one way to tell it is done",
    }
  }
  if (ev.kind === "subagent_stopped") {
    return {kind: "helper", badge: "HELPER", what: "The helper finished and went home", why: "Its answer now flows back to the main agent", tip: "Ask what the helper changed before moving on"}
  }
  if (ev.kind === "approval_requested") {
    return {
      kind: "ask",
      badge: "ASK",
      what: "The agent is asking you before it does something",
      why: "You stay in charge: nothing risky runs until you say yes",
      tip: "Read what it wants to run, then approve only if you can say what it will change",
    }
  }
  if (ev.kind === "approval_resolved") {
    return {kind: "ask", badge: "ASK", what: ev.status === "denied" ? "You said no, so nothing ran" : "You said yes, so it went ahead", why: "Your answer is the safety switch", tip: "Say why you denied it so the AI can try a safer way"}
  }
  if (ev.kind === "session_started") {
    return {kind: "start", badge: "START", what: "The agent woke up and is ready to work", why: "Every session begins with a goal in your prompt", tip: "Start prompts with the goal, the file, and how you will check it worked"}
  }

  // tool_started / tool_finished: look at the words in the summary
  const lower = text.toLowerCase()
  const bash = /\bbash\b|\bshell\b|\bpowershell\b|run_known_test|\bnpm\b|\bnode\b|\bgit\b/.test(lower)
  if (/\b(edit|write|multiedit|modified|patch|replace)\b/.test(lower)) {
    return {
      kind: "edit",
      badge: "BUILD",
      what: file ? "Rewrote part of " + file : "Rewrote part of a file",
      why: "Each edit is a small bet that the program will behave better",
      tip: "Ask the AI to explain the change in one sentence and show the before and after",
    }
  }
  if (/\b(grep|glob|search|find)\b/.test(lower)) {
    return {kind: "search", badge: "SEARCH", what: "Searched for words in the project", why: "Looking before changing avoids breaking things it did not see", tip: "Name the file or word you care about so the search is faster"}
  }
  if (/\b(read|open|view|cat)\b/.test(lower) && !bash) {
    return {kind: "read", badge: "READ", what: file ? "Opened " + file + " like a recipe book" : "Opened a file like a recipe book", why: "The agent reads first so its changes fit what is already there", tip: "Point the AI at the exact file you want it to read"}
  }
  if (bash) {
    const m = /(?:bash|command|ran|running)\s*[:\-]?\s*(.*)$/i.exec(text)
    const exp = explainCommand(m && m[1] ? m[1] : text)
    return {
      kind: exp.kind === "other" ? "command" : exp.kind,
      badge: "MACHINE",
      what: (exp.known ? exp.plain : "Used the computer's command line") + (ev.kind === "tool_started" ? "" : " (done)"),
      why: "Commands are how the agent touches the real computer, so they deserve a look",
      tip: "Ask the AI to explain a command in plain words before you approve it",
    }
  }
  return {kind: "other", badge: failed ? "FAILED" : "STEP", what: "Did one step of the job", why: "Small steps are easier to follow than one big jump", tip: "Ask the AI what the next step is and why"}
}

export interface CoachTip {
  readonly missing: readonly string[]
  readonly tip: string
}

/** Prompt Coach: three deterministic checks (goal, file, success check). Labelled as a tip, not AI reasoning. */
export function promptCoach(prompt: string): CoachTip {
  const p = (prompt || "").trim()
  const lower = p.toLowerCase()
  const missing: string[] = []
  if (p.length < 25 || !/\b(fix|add|make|change|build|explain|find|write|remove|rename|test|show|why|how)\b/.test(lower)) missing.push("goal")
  if (!/[\w\-./\\]+\.(ts|js|tsx|jsx|py|mjs|json|md|html|css|go|rs|java|cs)\b|\bin\s+the\s+\w+\s+(file|folder|module)\b/.test(lower)) missing.push("file")
  if (!/\b(test|tests|passes|pass|expect|should|check|verify|prove|works)\b/.test(lower)) missing.push("success check")
  let tip: string
  if (missing.length === 0) tip = "Good prompt: it names a goal, a file and a way to check. Keep that shape."
  else if (missing[0] === "goal") tip = "Say what you want in one verb: for example 'fix', 'add' or 'explain', then the thing it applies to."
  else if (missing[0] === "file") tip = "Name the file or folder. Example: 'in server/lobby.ts' stops the AI from guessing."
  else tip = "Add how you will know it worked. Example: 'and the room-capacity test should pass'."
  return {missing, tip}
}
