// Generates the film's soft ambient bed locally: detuned sine pads on slow chords, no samples, no network.
// node devpost/tools/gen-ambient.mjs <seconds> <out.wav>
// Deterministic (seeded). 44.1 kHz, 16-bit stereo. Level is set by ffmpeg loudnorm afterwards.
import {writeFileSync} from "node:fs"

const seconds = Number(process.argv[2] ?? 152)
const out = process.argv[3] ?? "video/assets/ambient.wav"
const SR = 44100
const N = Math.floor(seconds * SR)
const L = new Float32Array(N)
const R = new Float32Array(N)

// four-chord loop in A minor (Am9 - Fmaj7 - Cmaj9 - G6), each chord 9 s, notes as Hz
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)
const CHORDS = [
  [45, 57, 60, 64, 71], // Am9
  [41, 57, 60, 64, 69], // Fmaj7
  [48, 55, 59, 62, 64], // Cmaj9
  [43, 55, 59, 62, 64], // G6
]
const CHORD_S = 9
let seed = 1108
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }

// each chord tone: 3 slightly detuned sines, slow tremolo, panned a little
const voices = []
CHORDS.forEach((chord, ci) => {
  chord.forEach((m, ni) => {
    for (let d = 0; d < 3; d++) {
      voices.push({
        ci, f: mtof(m) * (1 + (d - 1) * 0.0018 + (rnd() - 0.5) * 0.0006),
        amp: (ni === 0 ? 0.5 : 0.22) / 3, pan: (rnd() - 0.5) * 0.9,
        trem: 0.05 + rnd() * 0.12, tph: rnd() * 6.28,
      })
    }
  })
})

for (let i = 0; i < N; i++) {
  const t = i / SR
  const slot = Math.floor(t / CHORD_S)
  const ci = slot % CHORDS.length
  const lt = t - slot * CHORD_S
  // slow swell in/out per chord with 2.5 s overlap into the next chord
  const attack = Math.min(1, lt / 2.5)
  const release = lt > CHORD_S - 2.5 ? 1 - (lt - (CHORD_S - 2.5)) / 2.5 : 1
  const env = attack * attack * (3 - 2 * attack) * (release > 0 ? release : 0)
  const prev = (ci + CHORDS.length - 1) % CHORDS.length
  const prevEnv = lt < 2.5 ? 1 - lt / 2.5 : 0
  let l = 0, r = 0
  for (const v of voices) {
    const e = v.ci === ci ? env : v.ci === prev ? prevEnv : 0
    if (e <= 0) continue
    const s = Math.sin(2 * Math.PI * v.f * t) * v.amp * e * (0.85 + 0.15 * Math.sin(2 * Math.PI * v.trem * t + v.tph))
    l += s * (1 - v.pan) * 0.5 + s * 0.5
    r += s * (1 + v.pan) * 0.5 + s * 0.5
  }
  // gentle global fade in/out
  const g = Math.min(1, t / 3) * Math.min(1, (seconds - t) / 4)
  L[i] = l * g
  R[i] = r * g
}

// peak normalise to -6 dBFS (ffmpeg loudnorm sets the final loudness)
let peak = 0
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
const k = 0.5 / (peak || 1)
const buf = Buffer.alloc(44 + N * 4)
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12)
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24)
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40)
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * k * 32767))), 44 + i * 4)
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * k * 32767))), 46 + i * 4)
}
writeFileSync(out, buf)
console.log(`wrote ${out}: ${seconds} s, ${(buf.length / 1048576).toFixed(1)} MB`)
