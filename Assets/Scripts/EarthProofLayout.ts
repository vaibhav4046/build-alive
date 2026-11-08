// EarthProofLayout: world layout constants (cm, eye at origin, looking -Z). Pure, no Lens Studio API.
// One source for the scene generator, the runtime scripts and the node/LEAF checks.
import {RAMP, roverPose} from "./EarthProofSim"

export const TABLE_TOP_Y = -30
export const TABLE_SIZE = {w: 100, h: 3, d: 60}
export const TABLE_CENTER = {x: 0, y: TABLE_TOP_Y - TABLE_SIZE.h / 2, z: -75}

export const RAMP_Z = -90
export const RAMP_WIDTH_CM = 20
export const RAMP_FRONT_Z = RAMP_Z + RAMP_WIDTH_CM / 2
export const RAMP_BASE_X = -16.5 // rover rear end to landing end spans about -34.5..+34.5 cm
export const RAMP_THICKNESS_CM = 1.5
export const LANDING_CM = 4
export const RAMP_LENGTH_CM = RAMP.reduce((n, s) => n + s.lengthCm, 0)

/** Rover front wheel contact (distance along the ramp) at rest. Rear contact is 14 cm behind, on the table. */
export const START_S = -2

export const ROVER_BODY = {w: 18, h: 8, d: 12, centerY: 2.5}
export const WHEEL = {radius: 3, width: 3, dx: 7, dz: 7.5}
export const MOUNT_LOCAL_Y = 7 // top of the rover body, where the motor block sits
export const BLOCK_SIZE_CM = 6

export const SLOT_SMALL = {x: -34, y: TABLE_TOP_Y, z: -62}
export const SLOT_GEARED = {x: -20, y: TABLE_TOP_Y, z: -62}
export const RUN_BUTTON = {x: -10, y: -26, z: -49}
export const RESET_BUTTON = {x: 10, y: -26, z: -49}
export const BUTTON_SIZE = {w: 8, h: 5}

export const EVIDENCE_CARD = {x: 16, y: -6, z: -82}
export const PROOF_CARD = {x: 24, y: -3, z: -82}
export const STALL_MARKER_Z = RAMP_FRONT_Z + 1

export interface WorldPose {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly pitchDeg: number
}

/** Rover origin (axle line, between wheels) in world cm, for a front-wheel ramp distance. */
export function roverWorld(sFront: number): WorldPose {
  const p = roverPose(sFront)
  return {x: RAMP_BASE_X + p.x, y: TABLE_TOP_Y + p.y, z: RAMP_Z, pitchDeg: p.pitchDeg}
}
