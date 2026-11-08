// EarthProofFlow: the pure run state machine (no Lens Studio API), so node can sweep it with thousands of scenarios.
//   idle -> running -> stalled (evidence due EVIDENCE_DELAY_S later) | passed
// run(): ignored while running; from stalled/passed it snaps to the base first. reset()/install(): snap to the base.
import type {ClimbResult, MotorId} from "./EarthProofSim"
import {MOTORS, ROVER, rpmOf, simulateClimb} from "./EarthProofSim"
import {RAMP_LENGTH_CM, START_S} from "./EarthProofLayout"

export type RunState = "idle" | "running" | "stalled" | "passed"
export type FlowEvent = "none" | "stalled" | "evidence" | "passed"

export const EVIDENCE_DELAY_S = 0.3 // stall -> evidence card + beam; press-to-card stays under 1 s
const TWO_PI = Math.PI * 2

export class Flow {
  state: RunState = "idle"
  installed: MotorId = "small"
  result: ClimbResult = simulateClimb("small")
  sFront: number = START_S
  wheelOmega = 0 // rad/s, positive = rolling toward +x
  evidenceShown = false
  proofShown = false
  private stallClock = 0

  /** Returns false when ignored because a run is already in progress. */
  run(): boolean {
    if (this.state === "running") return false
    this.toBase()
    this.result = simulateClimb(this.installed)
    this.state = "running"
    return true
  }

  /** Reset puts the Small motor back on the mount, like a motor swap, and snaps to the base. */
  reset(): void {
    this.install("small")
  }

  install(id: MotorId): void {
    this.installed = id
    this.result = simulateClimb(id)
    this.toBase()
  }

  /** Advance by dt seconds. Returns the one event that happened in this step ("none" most frames). */
  step(dt: number): FlowEvent {
    if (this.state === "running") {
      const stalls = this.result.outcome === "stall"
      const target = stalls ? this.result.stallPositionCm : RAMP_LENGTH_CM
      this.sFront = Math.min(target, this.sFront + this.result.speedCmS * dt)
      this.wheelOmega = this.result.speedCmS / ROVER.wheelRadiusCm
      if (this.sFront < target) return "none"
      if (stalls) {
        this.state = "stalled"
        this.stallClock = 0
        this.wheelOmega = (rpmOf(MOTORS[this.installed]) * TWO_PI) / 60 // spins in place
        return "stalled"
      }
      this.state = "passed"
      this.wheelOmega = 0
      this.proofShown = true
      return "passed"
    }
    if (this.state === "stalled" && !this.evidenceShown) {
      this.stallClock += dt
      if (this.stallClock >= EVIDENCE_DELAY_S) {
        this.evidenceShown = true
        return "evidence"
      }
    }
    return "none"
  }

  private toBase(): void {
    this.state = "idle"
    this.sFront = START_S
    this.wheelOmega = 0
    this.stallClock = 0
    this.evidenceShown = false
    this.proofShown = false
  }
}
