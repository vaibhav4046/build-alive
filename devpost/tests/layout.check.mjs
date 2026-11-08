// Static geometry checks for the authored layout (done criteria 1 and 6), computed from EarthProofLayout.
// Not a LEAF test and not a run in Lens Studio: it checks the numbers the scene is generated from.
// node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tests/layout.check.mjs
import assert from "node:assert/strict"
import * as L from "../../Assets/Scripts/EarthProofLayout.ts"
import {RAMP, surfaceHeightCm, surfaceXCm, roverPose} from "../../Assets/Scripts/EarthProofSim.ts"

let n = 0
const ok = (cond, msg) => { n++; assert.ok(cond, msg) }
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)

// controls: Run and Reset buttons (8 x 5) plus the two motor blocks (6 cm)
const controls = {
  Run: {...L.RUN_BUTTON, across: Math.min(L.BUTTON_SIZE.w, L.BUTTON_SIZE.h)},
  Reset: {...L.RESET_BUTTON, across: Math.min(L.BUTTON_SIZE.w, L.BUTTON_SIZE.h)},
  Small: {x: L.SLOT_SMALL.x, y: L.SLOT_SMALL.y + L.BLOCK_SIZE_CM / 2, z: L.SLOT_SMALL.z, across: L.BLOCK_SIZE_CM},
  Geared: {x: L.SLOT_GEARED.x, y: L.SLOT_GEARED.y + L.BLOCK_SIZE_CM / 2, z: L.SLOT_GEARED.z, across: L.BLOCK_SIZE_CM},
}
const names = Object.keys(controls)
const rows = []
for (const a of names) {
  ok(controls[a].across >= 5, `${a} is at least 5 cm across`)
  let nearest = Infinity
  for (const b of names) if (a !== b) { const d = dist(controls[a], controls[b]); nearest = Math.min(nearest, d); ok(d >= 12, `${a}-${b} centre distance ${d.toFixed(1)} >= 12`) }
  rows.push(`${a.padEnd(7)} across ${controls[a].across} cm, nearest other control ${nearest.toFixed(1)} cm`)
}
ok(dist(controls.Run, controls.Reset) === 20, "Run and Reset are 20 cm apart")

// everything the user needs sits below eye level (eye at origin) and within arm-plus-table reach in front
for (const [k, c] of Object.entries(controls)) { ok(c.y < 0 && c.z < 0 && c.z > -75, `${k} is below eye level and in front`) }
ok(L.RUN_BUTTON.z >= L.TABLE_CENTER.z + L.TABLE_SIZE.d / 2 - 5, "buttons sit on the front edge of the table")

// ramp: sections, rise, and that the rover start + landing end fit the ~63-69 cm usable width
const top = {x: L.RAMP_BASE_X + surfaceXCm(L.RAMP_LENGTH_CM), y: L.TABLE_TOP_Y + surfaceHeightCm(L.RAMP_LENGTH_CM)}
const p0 = roverPose(L.START_S)
const roverLeft = L.RAMP_BASE_X + p0.x - L.ROVER_BODY.w / 2
const landingEnd = top.x + L.LANDING_CM
ok(RAMP.length === 2 && RAMP[0].angleDeg === 10 && RAMP[0].lengthCm === 20 && RAMP[1].angleDeg === 25 && RAMP[1].lengthCm === 30, "ramp is 10 deg x 20 cm then 25 deg x 30 cm")
ok(L.RAMP_LENGTH_CM === 50, "ramp is 50 cm long")
ok(top.y < 0, "ramp top is below eye level")
ok(landingEnd - roverLeft <= 70 && landingEnd - roverLeft >= 60, `rover rear to landing end spans ${(landingEnd - roverLeft).toFixed(1)} cm`)
ok(Math.abs(roverLeft + landingEnd) < 3, "span is centred on the view axis")
ok(p0.pitchDeg === 0, "rover starts level at the base")
ok(L.WHEEL.radius === 3, "wheel radius 3 cm")
ok(L.ROVER_BODY.w === 18 && L.ROVER_BODY.d === 12 && L.ROVER_BODY.h === 8, "rover body 18 x 12 x 8 cm")

// cards: pinned beside the stall point / at the top of the ramp, not centred, in front of the ramp
const stallX = L.RAMP_BASE_X + surfaceXCm(RAMP[0].lengthCm)
ok(Math.abs(L.EVIDENCE_CARD.x - stallX) > 5 && Math.abs(L.EVIDENCE_CARD.x - stallX) < 25, "evidence card is beside the stall point, not on it")
ok(Math.abs(L.EVIDENCE_CARD.x) > 5, "evidence card is not centred in the view")
ok(Math.abs(L.PROOF_CARD.x - top.x) < 30, "proof card is beside the top of the ramp, left of the rover's resting place")
ok(L.EVIDENCE_CARD.z > L.RAMP_Z && L.PROOF_CARD.z > L.RAMP_Z, "cards stand in front of the ramp, facing the user")
// cards stay below eye level (eye at y = 0) and clear of the rover resting on the landing
const evTop = L.EVIDENCE_CARD.y + L.EVIDENCE_CARD_H / 2, prTop = L.PROOF_CARD.y + L.PROOF_CARD_H / 2
ok(evTop < 0 && prTop < 0, `cards are below eye level (tops ${evTop.toFixed(1)} and ${prTop.toFixed(1)})`)
const roverTopLeft = L.RAMP_BASE_X + roverPose(50).x - L.ROVER_BODY.w / 2
ok(L.PROOF_CARD.x + L.CARD_W / 2 < roverTopLeft, `proof card right edge ${(L.PROOF_CARD.x + L.CARD_W / 2).toFixed(1)} is left of the rover at the top (${roverTopLeft.toFixed(1)})`)
// the proof card must also clear the steep ramp surface under it
const rampUnderCardRight = L.TABLE_TOP_Y + surfaceHeightCm(Math.min(50, 20 + (L.PROOF_CARD.x + L.CARD_W / 2 - stallX) / Math.cos(25 * Math.PI / 180)))
ok(L.PROOF_CARD.y - L.PROOF_CARD_H / 2 > rampUnderCardRight, `proof card bottom ${(L.PROOF_CARD.y - L.PROOF_CARD_H / 2).toFixed(1)} clears the ramp surface ${rampUnderCardRight.toFixed(1)}`)

console.log("layout.check: all " + n + " assertions passed")
console.log(rows.join("\n"))
console.log(`ramp top at x=${top.x.toFixed(1)} y=${top.y.toFixed(1)}; rover left end ${roverLeft.toFixed(1)}, landing end ${landingEnd.toFixed(1)} (span ${(landingEnd - roverLeft).toFixed(1)} cm)`)
