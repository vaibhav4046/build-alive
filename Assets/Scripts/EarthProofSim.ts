// EarthProofSim: pure simulation for the Ramp Climb trial. No Lens Studio API in this file.
// The same functions decide the outcome, produce every on-screen number, and are asserted by LEAF.
// Simplified teaching model, not a motor datasheet. Deterministic: same inputs, same result.

export type MotorId = "small" | "geared"

export interface Motor {
  readonly id: MotorId
  readonly label: string
  readonly baseTorqueNcm: number // per motor, before gearing
  readonly baseRpm: number
  readonly gearRatio: number // 1 = direct drive
  readonly efficiency: number // gearbox efficiency, 1 = none
}

export interface Rover {
  readonly massKg: number
  readonly drivenWheels: number
  readonly wheelRadiusCm: number
  readonly rollingResistance: number
  readonly wheelbaseCm: number // rear to front wheel contact, used only for the pose
}

export interface Section {
  readonly name: string
  readonly angleDeg: number
  readonly lengthCm: number
}

export const GRAVITY = 9.81
export const SNAP_RADIUS_CM = 6

export const ROVER: Rover = {
  massKg: 0.6,
  drivenWheels: 2,
  wheelRadiusCm: 3,
  rollingResistance: 0.03,
  wheelbaseCm: 14,
}

export const MOTORS: {readonly [id in MotorId]: Motor} = {
  small: {id: "small", label: "Small", baseTorqueNcm: 2.0, baseRpm: 150, gearRatio: 1, efficiency: 1},
  geared: {id: "geared", label: "Geared", baseTorqueNcm: 2.0, baseRpm: 150, gearRatio: 5, efficiency: 0.85},
}

export const RAMP: ReadonlyArray<Section> = [
  {name: "shallow", angleDeg: 10, lengthCm: 20},
  {name: "steep", angleDeg: 25, lengthCm: 30},
]

const DEG = Math.PI / 180

/** Total wheel torque (N.cm) needed to hold a slope: m g (sin a + crr cos a) r. */
export function requiredTorqueNcm(angleDeg: number, rover: Rover = ROVER): number {
  const a = angleDeg * DEG
  const forceN = rover.massKg * GRAVITY * (Math.sin(a) + rover.rollingResistance * Math.cos(a))
  return forceN * rover.wheelRadiusCm // N * cm = N.cm
}

export function torquePerMotorNcm(motor: Motor): number {
  return motor.baseTorqueNcm * motor.gearRatio * motor.efficiency
}

/** Total torque (N.cm) over all driven wheels. */
export function availableTorqueNcm(motor: Motor, rover: Rover = ROVER): number {
  return torquePerMotorNcm(motor) * rover.drivenWheels
}

export function rpmOf(motor: Motor): number {
  return motor.baseRpm / motor.gearRatio
}

/** Flat-ground speed in cm/s: rpm * 2 pi r / 60. */
export function flatSpeedCmS(motor: Motor, rover: Rover = ROVER): number {
  return (rpmOf(motor) * 2 * Math.PI * rover.wheelRadiusCm) / 60
}

export interface SectionResult {
  readonly index: number
  readonly name: string
  readonly angleDeg: number
  readonly lengthCm: number
  readonly startCm: number // distance along the ramp from its base
  readonly endCm: number
  readonly needNcm: number
  readonly hasNcm: number
  readonly passes: boolean
}

export type Outcome = "pass" | "stall"

export interface ClimbResult {
  readonly motorId: MotorId
  readonly outcome: Outcome
  readonly stallSectionIndex: number // -1 when the climb passes
  readonly stallPositionCm: number // distance along the ramp where it stalls, ramp length when it passes
  readonly needNcm: number // the section that stalls it, or the hardest one when it passes
  readonly hasNcm: number
  readonly shortfallNcm: number // 0 when it passes
  readonly marginX: number // has / hardest need
  readonly speedCmS: number
  readonly sections: ReadonlyArray<SectionResult>
}

export function simulateClimb(
  motorId: MotorId,
  sections: ReadonlyArray<Section> = RAMP,
  rover: Rover = ROVER,
): ClimbResult {
  const motor = MOTORS[motorId]
  const has = availableTorqueNcm(motor, rover)

  let cursor = 0
  const results: SectionResult[] = sections.map((s, index) => {
    const need = requiredTorqueNcm(s.angleDeg, rover)
    const r: SectionResult = {
      index,
      name: s.name,
      angleDeg: s.angleDeg,
      lengthCm: s.lengthCm,
      startCm: cursor,
      endCm: cursor + s.lengthCm,
      needNcm: need,
      hasNcm: has,
      passes: has >= need,
    }
    cursor += s.lengthCm
    return r
  })

  const failing = results.find((r) => !r.passes)
  const hardest = results.reduce((a, b) => (b.needNcm > a.needNcm ? b : a))
  const decisive = failing ?? hardest

  return {
    motorId,
    outcome: failing ? "stall" : "pass",
    stallSectionIndex: failing ? failing.index : -1,
    stallPositionCm: failing ? failing.startCm : cursor,
    needNcm: decisive.needNcm,
    hasNcm: has,
    shortfallNcm: failing ? failing.needNcm - has : 0,
    marginX: has / hardest.needNcm,
    speedCmS: flatSpeedCmS(motor, rover),
    sections: results,
  }
}

/** Height (cm) of the ramp surface at distance s along it. Flat before the base and after the top. */
export function surfaceHeightCm(s: number, sections: ReadonlyArray<Section> = RAMP): number {
  let h = 0
  let start = 0
  for (const sec of sections) {
    const end = start + sec.lengthCm
    const a = sec.angleDeg * DEG
    if (s <= end) return h + Math.sin(a) * Math.max(0, s - start)
    h += Math.sin(a) * sec.lengthCm
    start = end
  }
  return h
}

/** Horizontal distance (cm) of the ramp point at distance s along it. Linear before the base and after the top. */
export function surfaceXCm(s: number, sections: ReadonlyArray<Section> = RAMP): number {
  let x = 0
  let start = 0
  for (const sec of sections) {
    const end = start + sec.lengthCm
    const a = sec.angleDeg * DEG
    if (s <= end) return s < 0 ? s : x + Math.cos(a) * Math.max(0, s - start)
    x += Math.cos(a) * sec.lengthCm
    start = end
  }
  return x + (s - start)
}

export interface Pose {
  readonly x: number // horizontal, from the ramp base, cm
  readonly y: number // height of the rover's axle line, cm
  readonly pitchDeg: number
}

/** Where the rover sits when its front wheel contact is at ramp distance sFront. Rear contact is one wheelbase behind. */
export function roverPose(
  sFront: number,
  sections: ReadonlyArray<Section> = RAMP,
  rover: Rover = ROVER,
): Pose {
  const sRear = sFront - rover.wheelbaseCm
  const fx = surfaceXCm(sFront, sections)
  const fy = surfaceHeightCm(sFront, sections)
  const rx = surfaceXCm(sRear, sections)
  const ry = surfaceHeightCm(sRear, sections)
  const pitch = Math.atan2(fy - ry, fx - rx)
  // axle sits one wheel radius above the surface, along the surface normal
  return {
    x: (fx + rx) / 2 - Math.sin(pitch) * rover.wheelRadiusCm,
    y: (fy + ry) / 2 + Math.cos(pitch) * rover.wheelRadiusCm,
    pitchDeg: pitch / DEG,
  }
}

export function fmtNcm(n: number): string {
  return n.toFixed(1)
}

export function fmtMargin(m: number): string {
  return m.toFixed(1) + "x"
}

export function snapsToMount(distanceCm: number): boolean {
  return distanceCm <= SNAP_RADIUS_CM
}

/** Percentile with linear interpolation. p in 0..100. Input need not be sorted. */
export function percentile(values: ReadonlyArray<number>, p: number): number {
  if (values.length === 0) return NaN
  const v = values.slice().sort((a, b) => a - b)
  const rank = (p / 100) * (v.length - 1)
  const lo = Math.floor(rank)
  const hi = Math.ceil(rank)
  return v[lo] + (v[hi] - v[lo]) * (rank - lo)
}
