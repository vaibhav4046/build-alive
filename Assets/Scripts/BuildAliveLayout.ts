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

// Front control rail (z = -48 cm, y = -24.5 cm): 5 buttons spaced exactly 12.0 cm apart (-24, -12, 0, +12, +24)
export const RAIL_BUTTON_SIZE: BoxSizeCm = {w: 7.5, h: 5.0, d: 1.2}
export const RAIL_CONTROLS: readonly ControlSpec[] = [
  {
    id: "step",
    sceneName: "BA_StepButton",
    label: "Step >",
    center: {x: -24, y: -24.5, z: -48},
    size: RAIL_BUTTON_SIZE,
    group: "rail",
  },
  {
    id: "inspect",
    sceneName: "BA_InspectButton",
    label: "Inspect",
    center: {x: -12, y: -24.5, z: -48},
    size: RAIL_BUTTON_SIZE,
    group: "rail",
  },
  {
    id: "learn",
    sceneName: "BA_LearnButton",
    label: "Learn ?",
    center: {x: 0, y: -24.5, z: -48},
    size: RAIL_BUTTON_SIZE,
    group: "rail",
  },
  {
    id: "approve",
    sceneName: "BA_ApproveButton",
    label: "Approve",
    center: {x: 12, y: -24.5, z: -48},
    size: RAIL_BUTTON_SIZE,
    group: "rail",
  },
  {
    id: "reset",
    sceneName: "BA_ResetButton",
    label: "Reset",
    center: {x: 24, y: -24.5, z: -48},
    size: RAIL_BUTTON_SIZE,
    group: "rail",
  },
]

// Project Archipelago shelf (z = -58 cm, y = -24.5 cm): 3 islands spaced 12.0 cm apart (-24, -12, 0)
export const ISLAND_SIZE: BoxSizeCm = {w: 5.8, h: 2.4, d: 5.8}
export const PROJECT_ISLANDS: readonly ControlSpec[] = [
  {
    id: "lobby-sync",
    sceneName: "Island_LobbySync",
    label: "LobbySync",
    center: {x: -24, y: -24.5, z: -60},
    size: ISLAND_SIZE,
    group: "island",
  },
  {
    id: "edge-guard",
    sceneName: "Island_EdgeGuard",
    label: "EdgeGuard",
    center: {x: -12, y: -24.5, z: -60},
    size: ISLAND_SIZE,
    group: "island",
  },
  {
    id: "earthproof-rover",
    sceneName: "Island_EarthProof",
    label: "EarthProof",
    center: {x: 0, y: -24.5, z: -60},
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

// Right-side collapsible UIKit evidence/learning/approval card anchor
export const BUILD_ALIVE_CARD_POS: Vec3Cm = {x: 15, y: -10, z: -66}
export const BUILD_ALIVE_CARD_WIDTH_CM = 25

// Provenance banner on desk front-left edge
export const PROVENANCE_BANNER_POS: Vec3Cm = {x: -22, y: DESK_TOP_Y + 0.4, z: -51}

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
  allInView: boolean
  details: string[]
} {
  const details: string[] = []
  let minWidthCm = Infinity
  let minRailSpacingCm = Infinity
  let minIslandSpacingCm = Infinity
  let allInView = true

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
    allInView

  return {
    passed,
    minWidthCm,
    minRailSpacingCm,
    minIslandSpacingCm,
    allInView,
    details,
  }
}
