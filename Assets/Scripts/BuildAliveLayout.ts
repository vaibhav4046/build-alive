// BuildAliveLayout: world-scale centimetre geometry, FOV checks, and control separation math
// for BUILD ALIVE on Snap SPECS (Lens Studio 5.23.2). Pure module: zero Lens Studio runtime globals so both Node tests
// and LEAF scenarios share exact numbers.
//
// v4 "living valley" layout. The world is a voxel valley that runs past the edges of the view (no desk slab): a near
// ledge with a waterfall, a village plateau in the middle, rolling hills and mountains far back, and the real-repo
// islands floating in the sky above. Controls live in a slim dock BELOW the world so nothing sits on a sight line
// to a building (v3 bug, proven with PreviewInteractTool: pinching Module_Lobby failed with
// "Interaction failed (obstructed): Blocked by "Collider"" = the BA_InspectButton UIKit collider at (-6,-12.5,-62)).

export interface Vec3Cm {
  readonly x: number
  readonly y: number
  readonly z: number
}

export interface BoxSizeCm {
  readonly w: number
  readonly h: number
  readonly d: number
}

export interface ControlSpec {
  readonly id: string
  readonly sceneName: string
  readonly label: string
  readonly center: Vec3Cm
  readonly size: BoxSizeCm
  readonly group: "rail" | "island" | "city" | "crystal"
}

export interface ModuleLayoutSpec {
  readonly moduleId: string
  readonly sceneName: string
  readonly label: string
  readonly role: "UI" | "Logic" | "API" | "Data" | "Tests" | "Assets"
  readonly center: Vec3Cm
  readonly size: BoxSizeCm
}

export interface BridgeLayoutSpec {
  readonly bridgeId: string
  readonly sceneName: string
  readonly fromModuleId: string
  readonly toModuleId: string
  readonly verified: boolean
}

const DEG_TO_RAD = Math.PI / 180

// Kept for LEAF L01 / the rover fallback: "DeskShelf" is now the empty root of the terrain.
export const DESK_CENTER: Vec3Cm = {x: 0, y: -30, z: -75}
export const DESK_SIZE: BoxSizeCm = {w: 100, h: 3, d: 60}
export const DESK_TOP_Y = DESK_CENTER.y + DESK_SIZE.h / 2 // -28.5 cm

/** Top of the village plateau the buildings stand on. */
export const PLATEAU_Y = -26

// Lens Studio 5.23.2 SPECS 27 Preview camera, read from the running Preview (Camera Object world pose):
// position (0, -2, 14), pitched 14 deg down. FOV/aspect as observed in earlier sessions.
export const PREVIEW_VFOV_DEG = 36.6
export const PREVIEW_ASPECT = 0.875
export const PREVIEW_EYE: Vec3Cm = {x: 0, y: -2, z: 14}
export const PREVIEW_PITCH_DEG = -14
export const SEATED_GAZE_TARGET: Vec3Cm = {
  x: 0,
  y: PREVIEW_EYE.y + 80 * Math.tan(PREVIEW_PITCH_DEG * DEG_TO_RAD),
  z: PREVIEW_EYE.z - 80,
}

// Ergonomics. Dock pills are 5.4 x 2.8 cm at ~56 cm from the eye (about 5.5 deg wide); centres 6.2 cm apart leave a
// 0.8 cm gap. v3 used 12 cm spacing, which forced the buttons into the world itself; this is the deliberate trade-off.
export const MIN_TARGET_SIZE_CM = 5.0
export const MIN_RAIL_SEPARATION_CM = 6.0

export const RAIL_BUTTON_SIZE: BoxSizeCm = {w: 5.4, h: 2.8, d: 1.0}
// Dock sits below every camera->module sight line but within a seated arm's reach (L16 left-hand IK failed at y -32).
const DOCK_Y = -23.2
const DOCK_Z = -44
export const RAIL_CONTROLS: readonly ControlSpec[] = [
  {id: "reset", sceneName: "BA_ResetButton", label: "Replay", center: {x: -12.4, y: DOCK_Y, z: DOCK_Z}, size: RAIL_BUTTON_SIZE, group: "rail"},
  {id: "inspect", sceneName: "BA_InspectButton", label: "Command", center: {x: -6.2, y: DOCK_Y, z: DOCK_Z}, size: RAIL_BUTTON_SIZE, group: "rail"},
  {id: "step", sceneName: "BA_StepButton", label: "Next step", center: {x: 0, y: DOCK_Y, z: DOCK_Z}, size: RAIL_BUTTON_SIZE, group: "rail"},
  {id: "learn", sceneName: "BA_LearnButton", label: "Explain", center: {x: 6.2, y: DOCK_Y, z: DOCK_Z}, size: RAIL_BUTTON_SIZE, group: "rail"},
  {id: "approve", sceneName: "BA_ApproveButton", label: "Approve", center: {x: 12.4, y: DOCK_Y, z: DOCK_Z}, size: RAIL_BUTTON_SIZE, group: "rail"},
]

// Real-repo islands float in the sky above the far valley. Collider box = ISLAND_SIZE (grass top + rocky underside).
// v6 glass layout: project tabs are three glass chips in a row above the session window.
export const ISLAND_SIZE: BoxSizeCm = {w: 10, h: 4.2, d: 3}
export const ISLAND_Y = 0.1
export const WINDOW_Z = -58
export const PROJECT_ISLANDS: readonly ControlSpec[] = [
  {id: "lobby-sync", sceneName: "Island_LobbySync", label: "LobbySync", center: {x: -12, y: ISLAND_Y, z: WINDOW_Z}, size: ISLAND_SIZE, group: "island"},
  {id: "edge-guard", sceneName: "Island_EdgeGuard", label: "EdgeGuard", center: {x: 0, y: ISLAND_Y, z: WINDOW_Z}, size: ISLAND_SIZE, group: "island"},
  {id: "earthproof-rover", sceneName: "Island_EarthProof", label: "EarthProof", center: {x: 12, y: ISLAND_Y, z: WINDOW_Z}, size: ISLAND_SIZE, group: "island"},
]

// Rewind: a small amber hourglass hovering at the left edge of the village.
export const REWIND_CRYSTAL: ControlSpec = {
  id: "rewind-crystal",
  sceneName: "RewindCrystal",
  label: "Rewind",
  center: {x: -20.6, y: 0.1, z: WINDOW_Z},
  size: {w: 5.0, h: 5.0, d: 5.0},
  group: "crystal",
}

// Six village plots on the plateau. Each plot shows the building for the REAL module's role (UI cottage, Logic
// workshop, API windmill, Data granary, Assets barn, Tests watchtower); centre y is the middle of the collider box.
const PLOT: BoxSizeCm = {w: 5, h: 5, d: 5}
// Project window (right): two columns x three rows of clean blocks, one block per real module.
const PX0 = 13.8
const PX1 = 19.2
const PY0 = -8.6
const PY1 = -13.9
const PY2 = -19.2
export const CITY_MODULES: readonly ModuleLayoutSpec[] = [
  {moduleId: "client-ui", sceneName: "Module_Client", label: "Screens", role: "UI", center: {x: PX0, y: PY0, z: WINDOW_Z}, size: PLOT},
  {moduleId: "server-lobby", sceneName: "Module_Lobby", label: "Game rules", role: "Logic", center: {x: PX1, y: PY0, z: WINDOW_Z}, size: PLOT},
  {moduleId: "ws-gateway", sceneName: "Module_WSServer", label: "Network door", role: "API", center: {x: PX0, y: PY1, z: WINDOW_Z}, size: PLOT},
  {moduleId: "shared-state", sceneName: "Module_SharedState", label: "Shared memory", role: "Data", center: {x: PX1, y: PY1, z: WINDOW_Z}, size: PLOT},
  {moduleId: "db-mock", sceneName: "Module_DBMock", label: "Pretend database", role: "Assets", center: {x: PX0, y: PY2, z: WINDOW_Z}, size: PLOT},
  {moduleId: "test-suite", sceneName: "Module_TestSuite", label: "Checks", role: "Tests", center: {x: PX1, y: PY2, z: WINDOW_Z}, size: PLOT},
]

export const FAULT_MARKER_POS: Vec3Cm = {x: PX1, y: PY2 + 3.6, z: WINDOW_Z + 1.5}
export const FAULT_MARKER_SIZE: BoxSizeCm = {w: 2.2, h: 2.2, d: 2.2}

export const CITY_BRIDGES: readonly BridgeLayoutSpec[] = [
  {bridgeId: "bridge-client-lobby", sceneName: "Bridge_Client_Lobby", fromModuleId: "client-ui", toModuleId: "server-lobby", verified: true},
  {bridgeId: "bridge-lobby-ws", sceneName: "Bridge_Lobby_WS", fromModuleId: "server-lobby", toModuleId: "ws-gateway", verified: true},
  {bridgeId: "bridge-lobby-state", sceneName: "Bridge_Lobby_State", fromModuleId: "server-lobby", toModuleId: "shared-state", verified: true},
  {bridgeId: "bridge-state-db", sceneName: "Bridge_State_DB", fromModuleId: "shared-state", toModuleId: "db-mock", verified: false}, // F12: explicitly unknown/heuristic edge
  {bridgeId: "bridge-lobby-tests", sceneName: "Bridge_Lobby_Tests", fromModuleId: "server-lobby", toModuleId: "test-suite", verified: true},
]

// Little voxel workers walk on the plateau (feet on the ground).
export const AGENT_VESSEL_SIZE: BoxSizeCm = {w: 1.8, h: 3.0, d: 1.4}
export const AGENT_PRIMARY_HOME: Vec3Cm = {x: 16.5, y: -24, z: WINDOW_Z + 1}
export const AGENT_SUB_HOME: Vec3Cm = {x: 21, y: -24, z: WINDOW_Z + 1}

// One small glass card, upper-left, clear of every sight line from the eye to a building or island.
export const BUILD_ALIVE_CARD_POS: Vec3Cm = {x: -1.5, y: -12, z: -52}
export const BUILD_ALIVE_CARD_WIDTH_CM = 17
export const BUILD_ALIVE_CARD_HEIGHT_CM = 10

// Small honest status caption under the dock (LIVE / REPLAY / real scan).
export const PROVENANCE_BANNER_POS: Vec3Cm = {x: 0, y: -32.9, z: -39}

export function dist3D(a: Vec3Cm, b: Vec3Cm): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function midpoint3D(a: Vec3Cm, b: Vec3Cm): Vec3Cm {
  return {
    x: (a.x + b.x) * 0.5,
    y: (a.y + b.y) * 0.5,
    z: (a.z + b.z) * 0.5,
  }
}

/** Yaw/pitch of `point` relative to the gaze ray from `eye` (default: the measured Preview camera pose). */
export function angularOffsetFromGazeDeg(
  point: Vec3Cm,
  gazeTarget: Vec3Cm = SEATED_GAZE_TARGET,
  eye: Vec3Cm = PREVIEW_EYE,
): {yawDeg: number; pitchDeg: number; inView: boolean} {
  const gx = gazeTarget.x - eye.x
  const gy = gazeTarget.y - eye.y
  const gz = gazeTarget.z - eye.z
  const gazeYaw = Math.atan2(gx, -gz)
  const gazePitch = Math.atan2(gy, Math.sqrt(gx * gx + gz * gz))

  const px = point.x - eye.x
  const py = point.y - eye.y
  const pz = point.z - eye.z
  const pointYaw = Math.atan2(px, -pz)
  const pointPitch = Math.atan2(py, Math.sqrt(px * px + pz * pz))

  const yawDeg = (pointYaw - gazeYaw) / DEG_TO_RAD
  const pitchDeg = (pointPitch - gazePitch) / DEG_TO_RAD

  const halfVFov = PREVIEW_VFOV_DEG * 0.5
  const halfHFov = Math.atan(Math.tan(halfVFov * DEG_TO_RAD) * PREVIEW_ASPECT) / DEG_TO_RAD

  return {
    yawDeg,
    pitchDeg,
    inView: Math.abs(yawDeg) <= halfHFov && Math.abs(pitchDeg) <= halfVFov,
  }
}

/**
 * Verifies that every rail control and island control satisfies the >= 5 cm size floor and the dock spacing,
 * that rail buttons and islands never share a spot, and that everything (incl. the card's corners) is in view.
 */
export function auditControlErgonomics(): {
  passed: boolean
  minWidthCm: number
  minRailSpacingCm: number
  minIslandSpacingCm: number
  minCrossGroupGapCm: number
  cardInView: boolean
  allInView: boolean
  details: string[]
} {
  const details: string[] = []
  let minWidthCm = Infinity
  let minRailSpacingCm = Infinity
  let minIslandSpacingCm = Infinity
  let minCrossGroupGapCm = Infinity
  let allInView = true

  const hw = BUILD_ALIVE_CARD_WIDTH_CM / 2
  const hh = BUILD_ALIVE_CARD_HEIGHT_CM / 2
  let cardInView = true
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const corner = {x: BUILD_ALIVE_CARD_POS.x + sx * hw, y: BUILD_ALIVE_CARD_POS.y + sy * hh, z: BUILD_ALIVE_CARD_POS.z}
    if (!angularOffsetFromGazeDeg(corner).inView) {
      cardInView = false
      details.push(`card_corner_out_of_view:(${corner.x},${corner.y})`)
    }
  }
  if (!cardInView) allInView = false

  for (const a of RAIL_CONTROLS) {
    for (const b of PROJECT_ISLANDS) {
      const d = dist3D(a.center, b.center)
      if (d < minCrossGroupGapCm) minCrossGroupGapCm = d
    }
  }

  for (const c of [...RAIL_CONTROLS, ...PROJECT_ISLANDS, REWIND_CRYSTAL]) {
    const span = Math.max(c.size.w, c.size.d)
    if (span < minWidthCm) minWidthCm = span
    const fov = angularOffsetFromGazeDeg(c.center)
    if (!fov.inView) {
      allInView = false
      details.push(`out_of_view:${c.sceneName}(yaw=${fov.yawDeg.toFixed(1)},pitch=${fov.pitchDeg.toFixed(1)})`)
    }
  }

  for (const m of CITY_MODULES) {
    const span = Math.max(m.size.w, m.size.d)
    if (span < minWidthCm) minWidthCm = span
    const fov = angularOffsetFromGazeDeg(m.center)
    if (!fov.inView) {
      allInView = false
      details.push(`out_of_view:${m.sceneName}(yaw=${fov.yawDeg.toFixed(1)},pitch=${fov.pitchDeg.toFixed(1)})`)
    }
  }

  for (let i = 0; i < RAIL_CONTROLS.length; i++) {
    for (let j = i + 1; j < RAIL_CONTROLS.length; j++) {
      const d = dist3D(RAIL_CONTROLS[i].center, RAIL_CONTROLS[j].center)
      if (d < minRailSpacingCm) minRailSpacingCm = d
    }
  }

  for (let i = 0; i < PROJECT_ISLANDS.length; i++) {
    for (let j = i + 1; j < PROJECT_ISLANDS.length; j++) {
      const d = dist3D(PROJECT_ISLANDS[i].center, PROJECT_ISLANDS[j].center)
      if (d < minIslandSpacingCm) minIslandSpacingCm = d
    }
  }

  const passed =
    minWidthCm >= MIN_TARGET_SIZE_CM &&
    minRailSpacingCm >= MIN_RAIL_SEPARATION_CM - 0.01 &&
    minIslandSpacingCm >= 12 - 0.01 &&
    minCrossGroupGapCm >= 8 &&
    allInView

  return {
    passed,
    minWidthCm,
    minRailSpacingCm,
    minIslandSpacingCm,
    minCrossGroupGapCm,
    cardInView,
    allInView,
    details,
  }
}
