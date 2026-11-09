// BuildAliveLayout: Desk-scale centimeter geometry, FOV checks, and control separation math
// for BUILD ALIVE on Snap SPECS (Lens Studio 5.23.2, seated eye origin (0,0,0) facing -Z).
// Pure module: zero Lens Studio runtime globals so both Node tests and LEAF scenarios share exact numbers.

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

// Virtual desk surface (matches EarthProof TABLE_CENTER / TABLE_SIZE so both modes share the physical desk)
export const DESK_CENTER: Vec3Cm = {x: 0, y: -30, z: -75}
export const DESK_SIZE: BoxSizeCm = {w: 100, h: 3, d: 60}
export const DESK_TOP_Y = DESK_CENTER.y + DESK_SIZE.h / 2 // -28.5 cm

// Preview camera constants observed in Lens Studio 5.23.2 SPECS 27 Preview
export const PREVIEW_VFOV_DEG = 36.6
export const PREVIEW_ASPECT = 0.875
export const SEATED_GAZE_TARGET: Vec3Cm = {x: 0, y: -19, z: -66}

// Minimum ergonomic constraints (plan-lens & Master Brief Section 8/9)
export const MIN_TARGET_SIZE_CM = 5.0
export const MIN_RAIL_SEPARATION_CM = 12.0

// Front control rail, two staggered rows at z = -62 cm. The preview camera sees only about +-14 cm
// sideways at this depth (36.6 deg vertical FOV, 0.875 aspect), so a single 5-button row 12 cm apart
// (48 cm wide) cannot fit. Row 1 (y = -24.5): Step, Learn, Approve at x = -12, 0, +12.
// Row 2 (y = -12.5): Inspect, Reset at x = -6, +6. Every pair is >= 12 cm apart in 3D (row to row 13.4 cm).
export const RAIL_BUTTON_SIZE: BoxSizeCm = {w: 7.5, h: 5.0, d: 1.2}
export const RAIL_CONTROLS: readonly ControlSpec[] = [
  {
    id: "step",
    sceneName: "BA_StepButton",
    label: "Step >",
    center: {x: -12, y: -24.5, z: -62},
    size: RAIL_BUTTON_SIZE,
    group: "rail",
  },
  {
    id: "inspect",
    sceneName: "BA_InspectButton",
    label: "Inspect",
    center: {x: -6, y: -12.5, z: -62},
    size: RAIL_BUTTON_SIZE,
    group: "rail",
  },
  {
    id: "learn",
    sceneName: "BA_LearnButton",
    label: "Learn ?",
    center: {x: 0, y: -24.5, z: -62},
    size: RAIL_BUTTON_SIZE,
    group: "rail",
  },
  {
    id: "approve",
    sceneName: "BA_ApproveButton",
    label: "Approve",
    center: {x: 12, y: -24.5, z: -62},
    size: RAIL_BUTTON_SIZE,
    group: "rail",
  },
  {
    id: "reset",
    sceneName: "BA_ResetButton",
    label: "Reset",
    center: {x: 6, y: -12.5, z: -62},
    size: RAIL_BUTTON_SIZE,
    group: "rail",
  },
]

// Project Archipelago shelf (z = -52 cm, y = -24.5 cm): 3 islands spaced 12.0 cm apart (-12, 0, +12)
export const ISLAND_SIZE: BoxSizeCm = {w: 5.8, h: 2.4, d: 5.8}
// Islands sit on the desk (top -28.5 + half height) so they do not occlude the row-1 rail buttons behind them:
// the Preview camera (z = +150) saw Island_LobbySync blocking BA_StepButton at the old y = -24.5 (PreviewInteractTool "obstructed").
export const ISLAND_Y = DESK_TOP_Y + ISLAND_SIZE.h / 2 // -27.3 cm
export const PROJECT_ISLANDS: readonly ControlSpec[] = [
  {
    id: "lobby-sync",
    sceneName: "Island_LobbySync",
    label: "LobbySync",
    center: {x: -12, y: ISLAND_Y, z: -52},
    size: ISLAND_SIZE,
    group: "island",
  },
  {
    id: "edge-guard",
    sceneName: "Island_EdgeGuard",
    label: "EdgeGuard",
    center: {x: 0, y: ISLAND_Y, z: -52},
    size: ISLAND_SIZE,
    group: "island",
  },
  {
    id: "earthproof-rover",
    sceneName: "Island_EarthProof",
    label: "EarthProof",
    center: {x: 12, y: ISLAND_Y, z: -52},
    size: ISLAND_SIZE,
    group: "island",
  },
]

// Rewind crystal & Fault marker (interactive 3D artifacts above city)
export const REWIND_CRYSTAL: ControlSpec = {
  id: "rewind-crystal",
  sceneName: "RewindCrystal",
  label: "Rewind",
  center: {x: -18, y: -11, z: -66},
  size: {w: 5.2, h: 5.2, d: 5.2},
  group: "crystal",
}

export const FAULT_MARKER_POS: Vec3Cm = {x: 16, y: -10.5, z: -68}
export const FAULT_MARKER_SIZE: BoxSizeCm = {w: 5.2, h: 5.2, d: 5.2}

// Architecture City modules (6 district roles, >= 5.2 cm across, >= 12 cm apart)
export const CITY_MODULES: readonly ModuleLayoutSpec[] = [
  {
    moduleId: "client-ui",
    sceneName: "Module_Client",
    label: "UI:Client",
    role: "UI",
    center: {x: -16, y: -18, z: -70},
    size: {w: 5.4, h: 5.4, d: 5.4},
  },
  {
    moduleId: "server-lobby",
    sceneName: "Module_Lobby",
    label: "Logic:Lobby",
    role: "Logic",
    center: {x: -4, y: -16, z: -70},
    size: {w: 6.0, h: 6.5, d: 6.0},
  },
  {
    moduleId: "ws-gateway",
    sceneName: "Module_WSServer",
    label: "API:WS",
    role: "API",
    center: {x: 8, y: -18, z: -70},
    size: {w: 5.4, h: 5.4, d: 5.4},
  },
  {
    moduleId: "shared-state",
    sceneName: "Module_SharedState",
    label: "Data:State",
    role: "Data",
    center: {x: -10, y: -21, z: -80},
    size: {w: 5.4, h: 5.2, d: 5.4},
  },
  {
    moduleId: "db-mock",
    sceneName: "Module_DBMock",
    label: "Assets:DB",
    role: "Assets",
    center: {x: 4, y: -21, z: -80},
    size: {w: 5.2, h: 5.0, d: 5.2},
  },
  {
    moduleId: "test-suite",
    sceneName: "Module_TestSuite",
    label: "Tests:Room03",
    role: "Tests",
    center: {x: 16, y: -16, z: -68},
    size: {w: 5.8, h: 5.8, d: 5.8},
  },
]

export const CITY_BRIDGES: readonly BridgeLayoutSpec[] = [
  {
    bridgeId: "bridge-client-lobby",
    sceneName: "Bridge_Client_Lobby",
    fromModuleId: "client-ui",
    toModuleId: "server-lobby",
    verified: true,
  },
  {
    bridgeId: "bridge-lobby-ws",
    sceneName: "Bridge_Lobby_WS",
    fromModuleId: "server-lobby",
    toModuleId: "ws-gateway",
    verified: true,
  },
  {
    bridgeId: "bridge-lobby-state",
    sceneName: "Bridge_Lobby_State",
    fromModuleId: "server-lobby",
    toModuleId: "shared-state",
    verified: true,
  },
  {
    bridgeId: "bridge-state-db",
    sceneName: "Bridge_State_DB",
    fromModuleId: "shared-state",
    toModuleId: "db-mock",
    verified: false, // F12: explicitly unknown/heuristic edge
  },
  {
    bridgeId: "bridge-lobby-tests",
    sceneName: "Bridge_Lobby_Tests",
    fromModuleId: "server-lobby",
    toModuleId: "test-suite",
    verified: true,
  },
]

// Execution Theater agent vessels (above city)
export const AGENT_PRIMARY_HOME: Vec3Cm = {x: -4, y: -9.5, z: -70}
export const AGENT_SUB_HOME: Vec3Cm = {x: 16, y: -9.5, z: -68}
export const AGENT_VESSEL_SIZE: BoxSizeCm = {w: 3.6, h: 2.2, d: 3.6}

// Evidence / learning / approval card: centred above the city so its whole footprint stays inside the preview FOV
// (a 25 cm card at x = +15 was cut off by the camera). Height is the FlexLayout estimate for the six text rows.
export const BUILD_ALIVE_CARD_POS: Vec3Cm = {x: 0, y: -4, z: -68}
export const BUILD_ALIVE_CARD_WIDTH_CM = 22
export const BUILD_ALIVE_CARD_HEIGHT_CM = 12.5

// Provenance banner on desk front-left edge
export const PROVENANCE_BANNER_POS: Vec3Cm = {x: 0, y: DESK_TOP_Y - 0.4, z: -43.5}

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

/**
 * Checks whether a 3D world point (in cm, eye at origin) falls inside the preview camera's
 * field of view when gazing at `gazeTarget`.
 */
export function angularOffsetFromGazeDeg(
  point: Vec3Cm,
  gazeTarget: Vec3Cm = SEATED_GAZE_TARGET,
): {yawDeg: number; pitchDeg: number; inView: boolean} {
  const gx = gazeTarget.x
  const gy = gazeTarget.y
  const gz = gazeTarget.z
  const gHorizontal = Math.sqrt(gx * gx + gz * gz)
  const gazeYaw = Math.atan2(gx, -gz)
  const gazePitch = Math.atan2(gy, gHorizontal)

  const px = point.x
  const py = point.y
  const pz = point.z
  const pHorizontal = Math.sqrt(px * px + pz * pz)
  const pointYaw = Math.atan2(px, -pz)
  const pointPitch = Math.atan2(py, pHorizontal)

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
 * Verifies that every rail control and island control satisfies the >= 5 cm size floor
 * and >= 12 cm center-to-center spacing within its interaction row.
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

  // The evidence card must be fully visible: test its four corners, not just its centre.
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

  // Rail buttons and islands are different groups: centres must not sit on top of each other.
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
    minIslandSpacingCm >= MIN_RAIL_SEPARATION_CM - 0.01 &&
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
