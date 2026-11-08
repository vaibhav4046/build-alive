// Node check for the pure simulation module (runs outside Lens Studio): node devpost/tests/sim.check.mjs
import assert from "node:assert/strict"
import {
  MOTORS, RAMP, requiredTorqueNcm, availableTorqueNcm, flatSpeedCmS, simulateClimb,
  fmtNcm, fmtMargin, roverPose, snapsToMount, percentile,
} from "../../Assets/Scripts/EarthProofSim.ts"

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`)

near(requiredTorqueNcm(10), 3.6, 0.05, "10 deg needs ~3.6 N.cm")
near(requiredTorqueNcm(25), 7.94, 0.01, "25 deg needs ~7.94 N.cm")
assert.equal(fmtNcm(requiredTorqueNcm(25)), "7.9")
near(availableTorqueNcm(MOTORS.small), 4.0, 1e-9, "small total")
near(availableTorqueNcm(MOTORS.geared), 17.0, 1e-9, "geared total")
near(flatSpeedCmS(MOTORS.small), 47.1, 0.05, "small speed")
near(flatSpeedCmS(MOTORS.geared), 9.4, 0.05, "geared speed")

const small = simulateClimb("small")
assert.equal(small.outcome, "stall")
assert.equal(small.stallSectionIndex, 1)
assert.equal(small.stallPositionCm, 20)
assert.equal(fmtNcm(small.needNcm), "7.9")
assert.equal(fmtNcm(small.hasNcm), "4.0")
near(small.shortfallNcm, 3.94, 0.01, "shortfall ~3.9")

const geared = simulateClimb("geared")
assert.equal(geared.outcome, "pass")
assert.equal(geared.stallPositionCm, 50)
assert.equal(fmtMargin(geared.marginX), "2.1x")

// deterministic
assert.deepEqual(simulateClimb("small"), small)

// pose sanity: front at base, rear on the flat -> level; front on steep -> pitched up
near(roverPose(0).pitchDeg, 0, 1e-9, "level at base")
assert.ok(roverPose(40).pitchDeg > 20, "pitched on steep")
assert.ok(roverPose(50).y > roverPose(0).y, "rover higher at the top")

assert.ok(snapsToMount(6) && !snapsToMount(6.01))
near(percentile([1, 2, 3, 4, 100], 50), 3, 1e-9, "p50")
near(percentile([1, 2, 3, 4, 100], 99), 96.16, 0.01, "p99 interpolated")

console.log("sim.check: all assertions passed")
console.log("small  :", JSON.stringify({o: small.outcome, need: fmtNcm(small.needNcm), has: fmtNcm(small.hasNcm), speed: small.speedCmS.toFixed(1)}))
console.log("geared :", JSON.stringify({o: geared.outcome, margin: fmtMargin(geared.marginX), speed: geared.speedCmS.toFixed(1)}))
console.log("ramp   :", JSON.stringify(RAMP))
