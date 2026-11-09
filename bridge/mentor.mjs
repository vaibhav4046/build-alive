// bridge/mentor.mjs - "call your mentor": speech -> text -> grounded answer -> speech, all bridge-side.
// Grounding: the model only sees the recent journal events (redacted by the bridge) and must say it can't see it
// when the events do not contain the answer. It never claims to see the agent's private reasoning.
// Keys come from bridge/.env (git-ignored). Uses Groq: whisper-large-v3-turbo (STT), openai/gpt-oss-20b (answer),
// canopylabs/orpheus-v1-english (TTS). Every call is timed so latency can be reported with its method.
import fs from "node:fs"
import path from "node:path"
import {fileURLToPath} from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const GROQ = "https://api.groq.com/openai/v1"
const TIMEOUT_MS = 20000

export function loadKeys(envPath = path.join(HERE, ".env")) {
  const out = {}
  if (!fs.existsSync(envPath)) return out
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
  return out
}

async function timed(fn) {
  const t0 = performance.now()
  const value = await fn()
  return {value, ms: Math.round(performance.now() - t0)}
}

function withTimeout() {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), TIMEOUT_MS)
  return {signal: c.signal, done: () => clearTimeout(t)}
}

/** Compact, plain lines the model is allowed to use as facts. */
export function eventsToFacts(events, max = 25) {
  return events.slice(-max).map((e) => {
    const t = String(e.timestamp || "").slice(11, 19)
    return `#${e.seq} ${t} ${e.provenance} ${e.actor} ${e.kind} ${e.status}: ${e.summary}`
  })
}

const SYSTEM = [
  "You are the mentor inside BUILD ALIVE, a voxel valley that shows what a coding agent is doing.",
  "Answer in at most 2 short sentences a 10-year-old can follow, then nothing else.",
  "Use ONLY the numbered event facts given. If they do not answer the question, say you can't see that in the events.",
  "Never claim to know the agent's private thoughts. Mention the event number you used, like (event #12).",
].join(" ")

export async function askMentor(question, facts, key, model = "openai/gpt-oss-20b") {
  const {signal, done} = withTimeout()
  try {
    const res = await fetch(`${GROQ}/chat/completions`, {
      method: "POST",
      signal,
      headers: {Authorization: `Bearer ${key}`, "Content-Type": "application/json"},
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 400,
        reasoning_effort: "low",
        messages: [
          {role: "system", content: SYSTEM},
          {role: "user", content: `Event facts:\n${facts.join("\n") || "(no events yet)"}\n\nQuestion: ${String(question).slice(0, 500)}`},
        ],
      }),
    })
    const j = await res.json()
    if (!res.ok) throw new Error(`chat ${res.status}: ${JSON.stringify(j).slice(0, 200)}`)
    return String(j.choices?.[0]?.message?.content || "").trim()
  } finally {
    done()
  }
}

export async function speak(text, key, voice = "hannah") {
  const {signal, done} = withTimeout()
  try {
    const res = await fetch(`${GROQ}/audio/speech`, {
      method: "POST",
      signal,
      headers: {Authorization: `Bearer ${key}`, "Content-Type": "application/json"},
      body: JSON.stringify({model: "canopylabs/orpheus-v1-english", voice, input: String(text).slice(0, 600), response_format: "wav"}),
    })
    if (!res.ok) throw new Error(`tts ${res.status}: ${(await res.text()).slice(0, 200)}`)
    return Buffer.from(await res.arrayBuffer())
  } finally {
    done()
  }
}

export async function transcribe(wav, key) {
  const {signal, done} = withTimeout()
  try {
    const form = new FormData()
    form.append("file", new Blob([wav], {type: "audio/wav"}), "question.wav")
    form.append("model", "whisper-large-v3-turbo")
    form.append("response_format", "json")
    const res = await fetch(`${GROQ}/audio/transcriptions`, {method: "POST", signal, headers: {Authorization: `Bearer ${key}`}, body: form})
    const j = await res.json()
    if (!res.ok) throw new Error(`stt ${res.status}: ${JSON.stringify(j).slice(0, 200)}`)
    return String(j.text || "").trim()
  } finally {
    done()
  }
}

/** Full loop on one recorded question: transcribe -> answer from facts -> speak. Returns texts, audio and timings. */
export async function mentorTurn(questionWav, events, key) {
  const stt = await timed(() => transcribe(questionWav, key))
  const facts = eventsToFacts(events)
  const llm = await timed(() => askMentor(stt.value, facts, key))
  const tts = await timed(() => speak(llm.value, key))
  return {question: stt.value, answer: llm.value, answerWav: tts.value, ms: {stt: stt.ms, llm: llm.ms, tts: tts.ms, total: stt.ms + llm.ms + tts.ms}}
}

/** Offline Windows voice (System.Speech / SAPI): free, no account. Used when the Groq Orpheus terms are not accepted. */
export async function speakLocal(text) {
  const {execFileSync} = await import("node:child_process")
  const os = await import("node:os")
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "ba-tts-")), "say.wav")
  // Text and path travel as environment variables, never interpolated into the command (model output is untrusted).
  const ps = "Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.SetOutputToWaveFile($env:BA_SAY_OUT); $s.Speak($env:BA_SAY_TEXT); $s.Dispose()"
  execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", ps], {
    timeout: 20000,
    env: {...process.env, BA_SAY_TEXT: String(text).slice(0, 600), BA_SAY_OUT: out},
  })
  return fs.readFileSync(out)
}

/** Same loop with a pluggable voice (e.g. speakLocal). */
export async function mentorTurnWith(questionWav, events, key, voice) {
  const stt = await timed(() => transcribe(questionWav, key))
  const llm = await timed(() => askMentor(stt.value, eventsToFacts(events), key))
  const tts = await timed(() => voice(llm.value))
  return {question: stt.value, answer: llm.value, answerWav: tts.value, ms: {stt: stt.ms, llm: llm.ms, tts: tts.ms, total: stt.ms + llm.ms + tts.ms}}
}
