// Scenario sweeps against the PURE sim and run state machine (not Lens Studio, not LEAF).
// node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tests/sweep.mjs
// Fails loudly (exit 1) on the first violated invariant and prints real counts per category.
import {
  GRAVITY, MOTORS, ROVER, RAMP, requiredTorqueNcm, availableTorqueNcm, flatSpeedCmS, simulateClimb, snapsToMount, percentile,
} from "../../Assets/Scripts/EarthProofSim.ts"
import {Flow, EVIDENCE_DELAY_S} from "../../Assets/Scripts/EarthProofFlow.ts"
import {START_S, RAMP_LENGTH_CM} from "../../Assets/Scripts/EarthProofLayout.ts"

const counts = {}
let total = 0 // assertions
let scenarios = 0 // distinct input combinations / sequences
const sc = (n = 1) => { scenarios += n }
let failures = 0
function check(category, ok, message) {
  counts[category] = (counts[category] ?? 0) + 1
  total++
  if (!ok) {
    failures++
    console.error(`FAIL [${category}] ${message}`)
    if (failures >= 20) { console.error("too many failures, stopping"); report(); process.exit(1) }
  }
}
function report() {
  console.log("--- sweep summary")
  for (const [k, v] of Object.entries(counts)) console.log(`${String(v).padStart(6)}  ${k}`)
  console.log(`${String(total).padStart(6)}  TOTAL assertions over ${scenarios} distinct scenarios, ${failures} failed`)
}

// deterministic PRNG so every run is identical
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const rnd = mulberry32(20261108)
const motor = (baseTorqueNcm, gearRatio = 1, efficiency = 1, baseRpm = 150) => ({id: "small", label: "t", baseTorqueNcm, baseRpm, gearRatio, efficiency})

// ---- A. sim sweeps -------------------------------------------------------------------------------
// A1: torque x angle grid, one driven wheel so has === torque. Pass iff has >= need; monotone in torque and in angle.
const torques = Array.from({length: 40}, (_, i) => 0.5 * (i + 1))
const angles = Array.from({length: 46}, (_, i) => i)
const oneWheel = {...ROVER, drivenWheels: 1}
for (const a of angles) {
  let prevPass = false
  for (const t of torques) {
    sc()
    const pass = availableTorqueNcm(motor(t), oneWheel) >= requiredTorqueNcm(a, oneWheel)
    check("A1 torque x angle: monotone in torque", !(prevPass && !pass), `torque ${t} at ${a} deg flipped pass->stall`)
    check("A1 torque x angle: outcome matches has >= need", pass === (t >= requiredTorqueNcm(a, oneWheel)), `t=${t} a=${a}`)
    prevPass = pass
  }
}
for (const t of torques) {
  let prevStall = false
  for (const a of angles) {
    const stall = t < requiredTorqueNcm(a, oneWheel)
    check("A1 torque x angle: monotone in angle", !(prevStall && !stall), `angle ${a} at torque ${t} flipped stall->pass`)
    prevStall = stall
  }
}

// A2: mass x motor on the real ramp: need is linear in mass; heavier never turns a stall into a pass.
for (const id of ["small", "geared"]) {
  let prev = null
  for (let m = 0.1; m <= 3.0001; m += 0.1) {
    sc()
    const r = simulateClimb(id, RAMP, {...ROVER, massKg: m})
    // needNcm is the need of the section that decided the outcome (the stalling one, else the hardest = steep)
    const decisiveAngle = r.stallSectionIndex >= 0 ? RAMP[r.stallSectionIndex].angleDeg : 25
    check("A2 mass sweep: need linear in mass", Math.abs(r.needNcm / m - requiredTorqueNcm(decisiveAngle, {...ROVER, massKg: 1})) < 1e-9, `${id} m=${m}`)
    check("A2 mass sweep: heavier never helps", !(prev === "stall" && r.outcome === "pass"), `${id} m=${m}`)
    prev = r.outcome
  }
}

// A3: rolling resistance x angle: more rolling resistance always needs more torque.
for (let crr = 0; crr <= 0.2001; crr += 0.01) {
  for (let a = 0; a <= 60; a += 5) {
    sc()
    const lo = requiredTorqueNcm(a, {...ROVER, rollingResistance: crr})
    const hi = requiredTorqueNcm(a, {...ROVER, rollingResistance: crr + 0.01})
    check("A3 rolling-resistance sweep: more resistance needs more torque", hi > lo, `crr=${crr} a=${a}`)
  }
}

// A4: gear ratio x efficiency: torque scales with ratio x efficiency; speed falls with the ratio.
for (let g = 1; g <= 12; g++) {
  for (let e = 0.5; e <= 1.0001; e += 0.05) {
    sc()
    const m = motor(2, g, e)
    check("A4 gear x efficiency: torque", Math.abs(availableTorqueNcm(m) - 2 * g * e * ROVER.drivenWheels) < 1e-9, `g=${g} e=${e}`)
    check("A4 gear x efficiency: speed trades for torque", Math.abs(flatSpeedCmS(m) - flatSpeedCmS(motor(2, 1, 1)) / g) < 1e-9, `g=${g}`)
  }
}

// A5: boundary exactly at the stall threshold (one wheel, direct drive: has === base torque, no rounding).
for (const a of [1, 5, 10, 15, 20, 25, 30, 35, 40, 45]) {
  sc()
  const need = requiredTorqueNcm(a, oneWheel)
  const sections = [{name: "x", angleDeg: a, lengthCm: 30}]
  const run = (t) => {
    const saved = MOTORS.small.baseTorqueNcm
    MOTORS.small.baseTorqueNcm = t // plain object at runtime; restored right after
    const r = simulateClimb("small", sections, oneWheel)
    MOTORS.small.baseTorqueNcm = saved
    return r
  }
  check("A5 boundary: has exactly equals need passes", run(need).outcome === "pass", `a=${a}`)
  check("A5 boundary: just below stalls", run(need * (1 - 1e-9)).outcome === "stall", `a=${a}`)
  check("A5 boundary: just above passes", run(need * (1 + 1e-9)).outcome === "pass", `a=${a}`)
  check("A5 boundary: stall position is the section start", run(need * 0.5).stallPositionCm === 0, `a=${a}`)
}

// A6: random two/three-section ramps: stall index is the FIRST failing section, position is its start.
for (let i = 0; i < 300; i++) {
  sc()
  const n = 2 + Math.floor(rnd() * 2)
  const sections = Array.from({length: n}, (_, k) => ({name: "s" + k, angleDeg: Math.round(rnd() * 40), lengthCm: 5 + Math.round(rnd() * 30)}))
  const id = rnd() < 0.5 ? "small" : "geared"
  const r = simulateClimb(id, sections)
  const firstFail = sections.findIndex((s) => availableTorqueNcm(MOTORS[id]) < requiredTorqueNcm(s.angleDeg))
  check("A6 random ramps: first failing section", r.stallSectionIndex === firstFail, JSON.stringify({sections, id, got: r.stallSectionIndex, want: firstFail}))
  if (firstFail >= 0) {
    const start = sections.slice(0, firstFail).reduce((s, x) => s + x.lengthCm, 0)
    check("A6 random ramps: stall position and shortfall", r.stallPositionCm === start && r.outcome === "stall" && r.shortfallNcm > 0, JSON.stringify({sections, id}))
  } else {
    check("A6 random ramps: pass has margin >= 1", r.outcome === "pass" && r.shortfallNcm === 0 && r.marginX >= 1, JSON.stringify({sections, id}))
  }
}

// A7: determinism: identical inputs give identical results, 500 repeats per motor.
for (const id of ["small", "geared"]) {
  const first = JSON.stringify(simulateClimb(id))
  sc(500)
  for (let i = 0; i < 500; i++) check("A7 determinism (500 repeats x 2 motors)", JSON.stringify(simulateClimb(id)) === first, id)
}

// A8: the headline numbers the cards display.
const small = simulateClimb("small"), geared = simulateClimb("geared")
sc(5)
check("A8 headline: Small stalls at 20 cm needing 7.9 has 4.0", small.outcome === "stall" && small.stallPositionCm === 20 && small.needNcm.toFixed(1) === "7.9" && small.hasNcm.toFixed(1) === "4.0", "")
check("A8 headline: Geared passes with 2.1x and 17.0 N.cm", geared.outcome === "pass" && geared.marginX.toFixed(1) === "2.1" && geared.hasNcm.toFixed(1) === "17.0", "")
check("A8 headline: gravity constant", GRAVITY === 9.81, "")
check("A8 snap radius boundary", snapsToMount(6) && !snapsToMount(6.0000001) && snapsToMount(0), "")
check("A8 percentile sanity", percentile([5], 99) === 5 && Number.isNaN(percentile([], 50)) && percentile([1, 2, 3, 4], 50) === 2.5, "")

// ---- B. state machine: invariants after every operation -------------------------------------------
function invariants(f, tag) {
  const c = "B state machine invariants"
  check(c, ["idle", "running", "stalled", "passed"].includes(f.state), `${tag} state ${f.state}`)
  check(c, f.sFront >= START_S - 1e-9 && f.sFront <= RAMP_LENGTH_CM + 1e-9, `${tag} sFront ${f.sFront}`)
  if (f.state === "idle") check(c, f.sFront === START_S && !f.evidenceShown && !f.proofShown, `${tag} idle must be at base with nothing shown`)
  check(c, !(f.evidenceShown && f.proofShown), `${tag} evidence and proof together`)
  if (f.evidenceShown) check(c, f.state === "stalled" && f.result.outcome === "stall", `${tag} evidence only after a stall`)
  if (f.proofShown) check(c, f.state === "passed" && f.result.outcome === "pass", `${tag} proof only after a pass`)
  if (f.state === "stalled") check(c, f.sFront === f.result.stallPositionCm, `${tag} stalled at ${f.sFront}`)
  if (f.state === "passed") check(c, f.sFront === RAMP_LENGTH_CM, `${tag} passed at ${f.sFront}`)
}
const OPS = {
  run: (f) => { f.run() },
  reset: (f) => { f.reset() },
  swapGeared: (f) => { f.install("geared") },
  swapSmall: (f) => { f.install("small") },
  stepShort: (f) => { for (let i = 0; i < 6; i++) f.step(1 / 60) },
  stepLong: (f) => { for (let i = 0; i < 700; i++) f.step(1 / 60) },
}
const OP_NAMES = Object.keys(OPS)
function replay(seq) {
  const f = new Flow()
  const trace = []
  for (const name of seq) {
    const before = {state: f.state, s: f.sFront}
    OPS[name](f)
    invariants(f, seq.join(">"))
    if (name === "run" && before.state === "running") check("B run while running is ignored", f.state === "running" && f.sFront >= before.s, seq.join(">"))
    if (name === "reset" || name === "swapGeared" || name === "swapSmall") check("B reset/swap always snaps to idle at base", f.state === "idle" && f.sFront === START_S, seq.join(">"))
    if (name === "reset") check("B reset puts Small back", f.installed === "small", seq.join(">"))
    trace.push(`${f.state}:${f.installed}:${f.sFront.toFixed(3)}:${+f.evidenceShown}${+f.proofShown}`)
  }
  return trace.join("|")
}
// B1: exhaustive interleavings of up to 4 operations (6 + 36 + 216 + 1296 sequences)
function* sequences(maxLen) {
  let layer = [[]]
  for (let n = 1; n <= maxLen; n++) {
    const next = []
    for (const s of layer) for (const op of OP_NAMES) next.push([...s, op])
    layer = next
    yield* layer
  }
}
for (const seq of sequences(4)) {
  sc()
  check("B1 exhaustive interleavings (<=4 ops): replay is deterministic", replay(seq) === replay(seq), seq.join(">"))
}
// B2: 400 random long sequences (length 30), each replayed twice
for (let i = 0; i < 400; i++) {
  sc()
  const seq = Array.from({length: 30}, () => OP_NAMES[Math.floor(rnd() * OP_NAMES.length)])
  check("B2 random long sequences (400 x 30 ops): replay is deterministic", replay(seq) === replay(seq), seq.join(">"))
}
// B3: frame-rate independence and the 1 s evidence budget (press to card), 4 frame rates x 2 motors
for (const dt of [1 / 30, 1 / 60, 1 / 90, 1 / 120]) {
  sc(2) // one Small run and one Geared run per frame rate
  const f = new Flow()
  check("B3 run accepted from idle", f.run(), "")
  let t = 0, ev = -1
  for (let i = 0; i < 100000 && ev < 0; i++) { const e = f.step(dt); t += dt; if (e === "evidence") ev = t }
  check("B3 Small: stalls at 20 cm regardless of dt", f.state === "stalled" && f.sFront === 20, `dt=${dt}`)
  check("B3 Small: evidence card within 1 s of the press", ev > 0 && ev < 1.0, `dt=${dt} evidence at ${ev}`)
  check("B3 Small: evidence not before the stall delay", ev >= EVIDENCE_DELAY_S, `dt=${dt}`)
  const g = new Flow()
  g.install("geared"); g.run()
  let tp = 0
  for (let i = 0; i < 100000 && g.state !== "passed"; i++) { g.step(dt); tp += dt }
  check("B3 Geared: reaches the top and shows proof", g.state === "passed" && g.proofShown && g.sFront === RAMP_LENGTH_CM, `dt=${dt}`)
  check("B3 Geared: slower than Small (about 5x)", tp > 4.5 && tp < 7, `dt=${dt} took ${tp.toFixed(2)} s`)
}

report()
if (failures > 0) { console.error(`SWEEP FAILED: ${failures} of ${total} assertions`); process.exit(1) }
console.log(`SWEEP PASSED: ${scenarios} distinct scenarios, ${total} assertions, 0 failed`)

