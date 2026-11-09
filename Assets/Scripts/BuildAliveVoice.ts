// BuildAliveVoice: voice commands for the learning environment. No API key, no cloud AI: Spectacles' built-in ASR gives a transcript and a
// small rule-based router maps it to ONE of a few fixed intents. Answers come from the existing deterministic explainer, never improvised.
// ASR is unreliable for short command words (partial transcripts churn, finals arrive late), so matching is tolerant and the dock mic is
// always backed by the normal pinch buttons.

export type VoiceIntent =
  | "what_happened"
  | "why_failed"
  | "what_try"
  | "explain_command"
  | "next_step"
  | "approve"
  | "deny"
  | "unknown"

export const VOICE_HELP =
  "I can answer: what just happened, why did it fail, what should I try, explain the command, next step, approve, deny."

function norm(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Map a transcript to an intent. Safety words (deny/approve) are checked first; anything unrecognised is "unknown". */
export function routeVoice(transcript: string): VoiceIntent {
  const t = norm(transcript)
  if (t.length === 0) return "unknown"
  if (/\b(deny|reject|decline|cancel|don'?t (run|do)|do not (run|do)|no stop)\b/.test(t)) return "deny"
  if (/\b(approve|approved|go ahead|yes run|run the (check|test|tests)|confirm)\b/.test(t)) return "approve"
  if (/\b(why|how come)\b.*\b(fail|failed|failing|broke|broken|red|wrong)\b|\bwhy did (it|that|the check|the test) fail/.test(t)) return "why_failed"
  if (/\b(what|how)\b.*\b(should|can|could|do)\b.*\b(try|do|next|ask|fix)\b|\bwhat (do i|should i)\b|\bany (tip|tips|hint)\b|\bwhat to try\b/.test(t)) return "what_try"
  if (/\bexplain\b.*\b(command|that|it|this)\b|\bwhat does (the|that|this) command\b|\bexplain the command\b|\bwhat is (the|that|this) command\b/.test(t)) return "explain_command"
  if (/\b(next|continue|go on|forward)\b/.test(t)) return "next_step"
  if (/\b(what|whats)\b.*\b(happen|happened|happening|going on|doing|just)\b|\bwhat just\b|\bwhat is it doing\b/.test(t)) return "what_happened"
  return "unknown"
}

/** Thin wrapper around Spectacles' built-in ASR module. If the module cannot start, status says why; nothing is faked. */
export class VoiceListener {
  status: string = "idle"
  private asr: AsrModule | null = null
  private listening = false

  get isListening(): boolean {
    return this.listening
  }

  start(onFinalText: (text: string) => void, onStatus: (status: string) => void): void {
    if (this.listening) return
    try {
      this.asr = require("LensStudio:AsrModule") as AsrModule
      const options = AsrModule.AsrTranscriptionOptions.create()
      options.silenceUntilTerminationMs = 1200
      options.mode = AsrModule.AsrMode.Balanced
      options.onTranscriptionUpdateEvent.add((e: AsrModule.TranscriptionUpdateEvent) => {
        if (e.isFinal && e.text.trim().length > 0) onFinalText(e.text)
      })
      options.onTranscriptionErrorEvent.add((code: AsrModule.AsrStatusCode) => {
        this.status = "ASR error " + code
        onStatus(this.status)
      })
      this.asr.startTranscribing(options)
      this.listening = true
      this.status = "listening"
    } catch (e) {
      this.listening = false
      this.status = "ASR unavailable: " + e
    }
    onStatus(this.status)
  }

  stop(): void {
    if (!this.listening || !this.asr) return
    try {
      this.asr.stopTranscribing()
    } catch (e) {
      this.status = "ASR stop failed: " + e
    }
    this.listening = false
    this.status = "idle"
  }
}
