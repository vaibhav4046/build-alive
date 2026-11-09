// BuildAliveHolo: original holographic "mission control" voxel recipes (pure; no Lens globals). Replaces the v4 valley art
// (BuildAliveWorldArt, tagged v4-voxel-valley). Design rule: optical displays are additive, so dark = transparent. Fills are
// deep blue (nearly see-through), edges and cores are bright cyan / amber / mint / white, so shapes read as light, not as slabs.
// No third-party logos, assets or UI copies.

import type {ModuleLayoutSpec} from "./BuildAliveLayout"
import {C, rng, VoxelGrid} from "./BuildAliveVoxel"

// Voxel scales (cm per voxel)
export const TERRAIN_VOX = 0.5
export const MOUNTAIN_VOX = 1
export const PROP_VOX = 0.5
export const WORKER_VOX = 0.25
export const CLOUD_VOX = 0.8
export const WATER_TOP_Y = -30

/** Palette roles (indices into PALETTE in BuildAliveVoxel.ts, recoloured for holograms). */
export const H = {
  FILL: C.GRASS_A,
  FILL_B: C.GRASS_B,
  FILL_C: C.GRASS_C,
  GRID: C.DIRT,
  FILL_DK: C.DIRT_DK,
  EDGE_DIM: C.STONE,
  STEEL: C.STONE_DK,
  AMBER_DIM: C.SAND,
  CYAN_MID: C.WATER,
  CYAN_LT: C.WATER_LT,
  WHITE: C.SNOW,
  AMBER_MID: C.WOOD,
  AMBER_DK: C.WOOD_DK,
  MINT_MID: C.LEAF_A,
  MINT_LT: C.LEAF_B,
  CORAL: C.ROOF_RED,
  BLUE: C.ROOF_BLUE,
  TEAL: C.ROOF_TEAL,
  PALE: C.PLASTER,
  RED_DIM: C.BRICK,
  AMBER: C.GOLD,
  WARM: C.GLOW,
  CYAN: C.CYAN,
  CORAL_HOT: C.CORAL,
  VIOLET: C.VIOLET,
  MINT: C.MINT,
  MOTE: C.CLOUD,
  MAGENTA: C.PINK,
  YELLOW: C.YELLOW,
  PALE2: C.SKIN,
  DARK: C.DARK,
  DEEP: C.PINE,
} as const

// The holographic platform (the "project core") the buildings stand on.
export const PLATFORM_CENTER_X = 0
export const PLATFORM_CENTER_Z = -75
export const PLATFORM_R = 30

export function riverCenterX(_z: number): number {
  return 24
}

// ---- tiny drawing helpers ----------------------------------------------------------------------------------------

/** Twelve edges of a box (a wireframe cube). */
function wire(g: VoxelGrid, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: number): void {
  for (let x = x0; x <= x1; x++) for (const y of [y0, y1]) for (const z of [z0, z1]) g.set(x, y, z, c)
  for (let y = y0; y <= y1; y++) for (const x of [x0, x1]) for (const z of [z0, z1]) g.set(x, y, z, c)
  for (let z = z0; z <= z1; z++) for (const x of [x0, x1]) for (const y of [y0, y1]) g.set(x, y, z, c)
}

function disc(g: VoxelGrid, cx: number, cz: number, r: number, y: number, c: number): void {
  for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++)
    for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++) if ((x - cx) ** 2 + (z - cz) ** 2 <= r * r) g.set(x, y, z, c)
}

function ring(g: VoxelGrid, cx: number, cz: number, r: number, y: number, c: number, thick = 0.9): void {
  for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++)
    for (let z = Math.floor(cz - r - 1); z <= Math.ceil(cz + r + 1); z++) {
      const d = Math.hypot(x - cx, z - cz)
      if (d <= r && d > r - thick) g.set(x, y, z, c)
    }
}

// ---- the platform, skyline, pylons --------------------------------------------------------------------------------

/** Holographic floor: faint grid, bright rim, two inner rings, amber ticks. Voxel (i, j, k) is at (i, j, k) * 0.5 cm. */
export function buildTerrain(): VoxelGrid {
  const g = new VoxelGrid()
  const R = PLATFORM_R / TERRAIN_VOX
  const cx = PLATFORM_CENTER_X / TERRAIN_VOX
  const cz = PLATFORM_CENTER_Z / TERRAIN_VOX
  const j = -53 // top face at -26 cm = PLATEAU_Y
  for (let i = Math.floor(cx - R); i <= Math.ceil(cx + R); i++)
    for (let k = Math.floor(cz - R); k <= Math.ceil(cz + R); k++) {
      const d = Math.hypot(i - cx, k - cz)
      if (d > R) continue
      let c: number = H.FILL_DK
      if (i % 8 === 0 || k % 8 === 0) c = H.GRID
      if (d > R - 1.1) c = H.CYAN
      else if (Math.abs(d - R * 0.66) < 0.55 || Math.abs(d - R * 0.33) < 0.55) c = H.EDGE_DIM
      g.set(i, j, k, c)
    }
  // amber ticks around the rim
  for (let a = 0; a < 48; a++) {
    const ang = (a / 48) * Math.PI * 2
    const len = a % 4 === 0 ? 5 : 2
    for (let t = 1; t <= len; t++) {
      g.set(Math.round(cx + Math.cos(ang) * (R + t)), j, Math.round(cz + Math.sin(ang) * (R + t)), a % 4 === 0 ? H.AMBER : H.AMBER_DIM)
    }
  }
  return g
}

/** Distant data skyline: thin dim towers with bright caps, three depth rows (1 cm voxels). */
export function buildMountains(): VoxelGrid {
  const g = new VoxelGrid()
  const r = rng(23)
  const rows = [
    {z: -150, base: -64, hMin: 8, hMax: 26, step: 8},
    {z: -175, base: -66, hMin: 14, hMax: 40, step: 9},
    {z: -205, base: -70, hMin: 20, hMax: 54, step: 11},
  ]
  for (const row of rows) {
    for (let x = -110; x <= 110; x += row.step) {
      const w = 2 + Math.floor(r() * 2)
      const h = Math.round(row.hMin + r() * (row.hMax - row.hMin))
      const bx = x + Math.floor(r() * 3)
      g.box(bx, row.base, row.z, bx + w, row.base + h, row.z + w, H.FILL_DK)
      for (let y = row.base; y <= row.base + h; y++) {
        g.set(bx, y, row.z, H.EDGE_DIM)
        g.set(bx + w, y, row.z, H.EDGE_DIM)
      }
      g.box(bx, row.base + h, row.z, bx + w, row.base + h, row.z + w, r() < 0.2 ? H.AMBER : H.CYAN_MID)
    }
  }
  return g
}

/** Four corner pylons on the platform: scale references that make the space read as a room. */
export function buildProps(): VoxelGrid {
  const g = new VoxelGrid()
  const j0 = -53
  for (const [px, pz] of [[-26, -52], [26, -52], [-26, -98], [26, -98]]) {
    const i = Math.round(px / PROP_VOX)
    const k = Math.round(pz / PROP_VOX)
    for (let y = 1; y <= 18; y++) {
      g.set(i, j0 + y, k, y % 6 === 0 ? H.AMBER : H.CYAN_MID)
      g.set(i + 1, j0 + y, k, H.FILL_B)
    }
    g.box(i - 1, j0 + 19, k - 1, i + 2, j0 + 19, k + 1, H.CYAN)
    g.set(i, j0 + 20, k, H.WHITE)
  }
  return g
}

/** A rotating scanner ring (own object): cyan arcs with amber ticks. */
export function buildScanRing(): VoxelGrid {
  const g = new VoxelGrid()
  const R = 66 // 33 cm at 0.5 cm voxels
  for (let a = 0; a < 360; a += 2) {
    const ang = (a * Math.PI) / 180
    if (a % 90 >= 52) continue
    g.set(Math.round(Math.cos(ang) * R), 0, Math.round(Math.sin(ang) * R), a % 30 < 2 ? H.AMBER : H.CYAN_MID)
  }
  for (let a = 0; a < 360; a += 30) {
    const ang = (a * Math.PI) / 180
    for (let t = 1; t <= 3; t++) g.set(Math.round(Math.cos(ang) * (R + t)), 0, Math.round(Math.sin(ang) * (R + t)), H.AMBER)
  }
  return g
}

// ---- buildings (0.5 cm voxels, local grid 0..14 x 0..14, origin = plot centre bottom) ------------------------------

export type BuildingRole = ModuleLayoutSpec["role"]
export const BUILDING_ORIGIN: [number, number, number] = [-3.75, 0, -3.75]

const ROLE_ACCENT: Record<BuildingRole, number> = {
  UI: H.CYAN,
  Logic: H.AMBER,
  API: H.MINT,
  Data: H.BLUE,
  Assets: H.VIOLET,
  Tests: H.WHITE,
}

/** hot: 0 normal, 1 changed (amber), 2 failed (coral). Tier 0..2 grows the building with the module's real file count. */
export function buildBuilding(role: BuildingRole, tier: number, hot: number = 0): VoxelGrid {
  const g = new VoxelGrid()
  const up = Math.max(0, Math.min(2, tier)) * 2
  const edge = hot === 2 ? H.CORAL_HOT : hot === 1 ? H.AMBER : ROLE_ACCENT[role]
  const fill = hot === 2 ? H.RED_DIM : hot === 1 ? H.AMBER_DIM : H.FILL_B
  const glow = hot === 2 ? H.CORAL_HOT : hot === 1 ? H.WARM : H.WHITE

  // plinth: dim plate with a bright outline
  g.box(0, 0, 0, 14, 0, 14, H.FILL_DK)
  for (let k = 0; k <= 14; k++) {
    g.set(k, 0, 0, edge)
    g.set(k, 0, 14, edge)
    g.set(0, 0, k, edge)
    g.set(14, 0, k, edge)
  }

  if (role === "UI") {
    // three floating screens, staggered, each a lit frame with a few "pixel" lines
    for (let i = 0; i < 3; i++) {
      const x0 = 1 + i * 2
      const x1 = x0 + 7
      const z = 2 + i * 4
      const top = 5 + up + i * 2
      g.box(x0, 2, z, x1, top, z, fill)
      wire(g, x0, 2, z, x1, top, z, edge)
      for (let y = 4; y < top; y += 2) g.box(x0 + 1, y, z, x1 - 1 - (y % 3), y, z, i === 1 ? H.WARM : H.CYAN_LT)
    }
  } else if (role === "Logic") {
    // reactor: wire cube around a bright core, corner nodes, orbit rings
    const h = 8 + up
    wire(g, 3, 1, 3, 10, h, 10, edge)
    g.box(5, 3, 5, 8, 3 + Math.min(4, h - 4), 8, glow)
    for (const x of [3, 10]) for (const z of [3, 10]) g.set(x, h + 1, z, H.WHITE)
    ring(g, 6.5, 6.5, 6.4, 1, H.AMBER_DIM)
    ring(g, 6.5, 6.5, 5.4, h - 2, H.AMBER_DIM)
  } else if (role === "API") {
    // gateway: two pillars, a lintel, and a pulse ring floating in the opening (the radar arm is a separate object)
    for (const x of [2, 12]) {
      g.box(x, 1, 5, x + 1, 9 + up, 8, fill)
      wire(g, x, 1, 5, x + 1, 9 + up, 8, edge)
    }
    g.box(2, 10 + up, 5, 13, 10 + up, 8, fill)
    wire(g, 2, 10 + up, 5, 13, 10 + up, 8, edge)
    ring(g, 7, 6.5, 3.2, 5, H.MINT_LT)
    g.set(7, 5, 6, H.WHITE)
  } else if (role === "Data") {
    // memory stack: glowing discs with gaps
    for (let n = 0; n < 3 + (tier > 0 ? 1 : 0); n++) {
      const y = 1 + n * 3
      const r = 5.6 - n * 0.5
      disc(g, 7, 7, r, y, fill)
      disc(g, 7, 7, r, y + 1, fill)
      ring(g, 7, 7, r + 0.4, y + 1, n % 2 ? H.CYAN : edge)
      g.set(7, y + 2, 7, H.WHITE)
    }
  } else if (role === "Assets") {
    // vault: crystal pyramid and shard
    for (let y = 1; y <= 6; y++) {
      const w = 6 - y
      g.box(7 - w, y, 7 - w, 7 + w, y, 7 + w, fill)
      wire(g, 7 - w, y, 7 - w, 7 + w, y, 7 + w, edge)
    }
    for (let y = 7; y <= 11 + up; y++) g.set(7, y, 7, y > 9 ? H.WHITE : edge)
    g.box(11, 1, 3, 12, 4 + up, 4, fill)
    wire(g, 11, 1, 3, 12, 4 + up, 4, edge)
  } else {
    // checks tower: tall wire shaft with ringed segments and glowing slits (the status lamp is a separate object)
    const h = 15 + up
    wire(g, 4, 1, 4, 10, h, 10, edge)
    for (let y = 4; y <= h; y += 3) wire(g, 4, y, 4, 10, y, 10, H.EDGE_DIM)
    g.box(6, 5, 10, 8, 7, 10, glow)
    g.box(6, 10, 10, 8, 12, 10, glow)
    g.box(5, h + 1, 5, 9, h + 1, 9, fill)
  }
  return g
}

/** Radar / pulse arm for the gateway (own object, rotates around local Z). Local origin = hub. */
export function buildWindmillSails(): VoxelGrid {
  const g = new VoxelGrid()
  for (let t = -7; t <= 7; t++) {
    g.set(t, 0, 0, Math.abs(t) > 4 ? H.MINT : H.MINT_MID)
    g.set(0, t, 0, Math.abs(t) > 4 ? H.MINT : H.MINT_MID)
  }
  g.box(-1, -1, 0, 1, 1, 0, H.WHITE)
  return g
}

// ---- floating project islands (data chips) -------------------------------------------------------------------------

export const ISLAND_RADIUS_VOX = 11
export const ISLAND_TOP_CM = 2.5

export interface IslandArtSpec {
  readonly seed: number
  readonly houses: number
  readonly roof: number // accent colour index
  readonly sample: boolean
}

/** Project chip: a lit disc, an inverted-cone underside, and one tower per real module (max 8); sample world = crystal. */
export function buildIsland(spec: IslandArtSpec): VoxelGrid {
  const g = new VoxelGrid()
  const r = rng(spec.seed)
  const R = ISLAND_RADIUS_VOX
  const top = 4
  const accent = spec.roof
  disc(g, 0, 0, R, top, H.FILL_B)
  ring(g, 0, 0, R, top, accent, 1.2)
  ring(g, 0, 0, R * 0.55, top, H.EDGE_DIM, 0.9)
  for (let t = 1; t <= 10; t++) {
    const rr = R * (1 - t / 11)
    if (t % 3 === 1) ring(g, 0, 0, rr, top - t, H.EDGE_DIM, 1.1)
    else if (t === 10) disc(g, 0, 0, Math.max(1, rr), top - t, accent)
  }
  g.set(0, top - 11, 0, H.WHITE)
  if (spec.sample) {
    for (let y = 1; y <= 9; y++) {
      const w = y < 7 ? 1 : 0
      g.box(-w, top + y, -w, w, top + y, w, y > 7 ? H.WHITE : H.VIOLET)
    }
    g.box(4, top + 1, 2, 6, top + 3, 4, H.MAGENTA)
    g.box(-6, top + 1, 3, -4, top + 2, 5, H.YELLOW)
  } else {
    g.box(0, top + 1, 0, 0, top + 3, 0, H.WHITE)
    const n = Math.max(1, Math.min(8, spec.houses))
    for (let h = 0; h < n; h++) {
      const ang = (h / n) * Math.PI * 2 + 0.4
      const hx = Math.round(Math.cos(ang) * 6.5)
      const hz = Math.round(Math.sin(ang) * 6.5)
      const hh = 2 + Math.floor(r() * 5)
      g.box(hx, top + 1, hz, hx + 1, top + hh, hz + 1, H.FILL_C)
      g.box(hx, top + hh + 1, hz, hx + 1, top + hh + 1, hz + 1, accent)
      g.set(hx, top + 1, hz + 1, H.WARM)
    }
  }
  return g
}

/** Mesh origin so an island grid's top sits at ISLAND_TOP_CM above the island centre. */
export const ISLAND_ORIGIN: [number, number, number] = [0, ISLAND_TOP_CM - 5 * PROP_VOX, 0]

// ---- motes, drones, small props -----------------------------------------------------------------------------------

/** A few drifting light motes (replaces clouds). */
export function buildCloud(seed: number): VoxelGrid {
  const g = new VoxelGrid()
  const r = rng(seed)
  const parts = 4 + Math.floor(r() * 3)
  for (let p = 0; p < parts; p++) {
    const x = Math.floor((p - parts / 2) * 4 + r() * 3)
    const y = Math.floor(r() * 5)
    const z = Math.floor(r() * 4)
    g.set(x, y, z, r() < 0.3 ? H.AMBER : H.CYAN_LT)
    g.set(x + 1, y, z, H.CYAN_MID)
    g.set(x, y + 1, z, H.CYAN_MID)
  }
  return g
}

/** Agent drone: glowing diamond with a halo ring (hovers; faces +Z). Body/hat are palette indices. */
export function buildWorker(body: number, hat: number): VoxelGrid {
  const g = new VoxelGrid()
  g.set(6, 11, 6, H.WHITE)
  g.box(5, 10, 5, 7, 10, 7, body)
  g.box(4, 9, 4, 8, 9, 8, body)
  g.box(3, 8, 3, 9, 8, 9, body)
  g.box(4, 7, 4, 8, 7, 8, body)
  g.box(5, 6, 5, 7, 6, 7, body)
  g.set(6, 5, 6, H.WHITE)
  ring(g, 6, 6, 6, 8, hat, 1)
  g.set(6, 8, 10, H.WHITE) // eye faces +Z
  return g
}
export const WORKER_ORIGIN: [number, number, number] = [-6 * WORKER_VOX, 0, -6 * WORKER_VOX]

/** A data cube (carried file change). */
export function buildCrate(): VoxelGrid {
  const g = new VoxelGrid()
  wire(g, 0, 0, 0, 3, 3, 3, H.AMBER)
  g.box(1, 1, 1, 2, 2, 2, H.WARM)
  return g
}

export function buildPuff(color: number): VoxelGrid {
  const g = new VoxelGrid()
  g.set(0, 0, 0, color)
  return g
}

/** Data arc along local +Z, `lengthCm` long, rising to a gentle crest. Dashed amber when the link is unverified. */
export function buildPath(lengthCm: number, verified: boolean, _seed: number): VoxelGrid {
  const g = new VoxelGrid()
  const n = Math.max(2, Math.floor(lengthCm / PROP_VOX))
  const crest = Math.min(6, lengthCm * 0.28) / PROP_VOX
  for (let k = 0; k < n; k++) {
    if (!verified && k % 4 >= 2) continue
    const u = k / (n - 1)
    const y = Math.round(crest * 4 * u * (1 - u))
    g.set(0, y, k, verified ? (k % 9 === 0 ? H.WHITE : H.CYAN) : H.AMBER)
  }
  return g
}
export function pathOrigin(lengthCm: number): [number, number, number] {
  return [-0.25, 0.9, -lengthCm / 2]
}

/** Rewind hourglass (local origin = centre). */
export function buildHourglass(): VoxelGrid {
  const g = new VoxelGrid()
  g.box(-3, -5, -3, 3, -5, 3, H.AMBER)
  g.box(-3, 5, -3, 3, 5, 3, H.AMBER)
  for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) g.box(x, -4, z, x, 4, z, H.AMBER_MID)
  for (let y = -4; y <= 4; y++) {
    const w = Math.max(0, Math.round(Math.abs(y) * 0.55))
    g.box(-w, y, -w, w, y, w, y < 0 ? H.AMBER : y === 0 ? H.WARM : H.CYAN_LT)
  }
  return g
}

/** Warning marker for a failing check (local origin = centre). */
export function buildWarning(): VoxelGrid {
  const g = new VoxelGrid()
  for (let y = -2; y <= 2; y++) {
    const w = 2 - Math.abs(y)
    g.box(-w, y, -w, w, y, w, H.CORAL_HOT)
  }
  g.set(0, 3, 0, H.YELLOW)
  return g
}

// ---- mission-control additions (orbs, flow nodes, ticks) -----------------------------------------------------------

/** Agent orb: hollow sphere in `color` with a bright core. Radius in voxels (0.5 cm). */
export function buildOrb(radiusVox: number, color: number): VoxelGrid {
  const g = new VoxelGrid()
  const R = radiusVox
  for (let x = -R; x <= R; x++)
    for (let y = -R; y <= R; y++)
      for (let z = -R; z <= R; z++) {
        const d = Math.sqrt(x * x + y * y + z * z)
        if (d <= R && d > R - 1.15) g.set(x, y, z, Math.abs(y) < 0.6 || (x === 0 && z >= 0) ? H.WHITE : color)
      }
  g.box(-1, -1, -1, 0, 0, 0, H.WHITE)
  return g
}

/** Flat halo ring for an orb (own object, tilted by the scene). */
export function buildOrbRing(radiusVox: number, color: number): VoxelGrid {
  const g = new VoxelGrid()
  ring(g, 0, 0, radiusVox, 0, color, 1)
  return g
}

/** Flow-pipeline node: a flat pad with a lit centre. 0.5 cm voxels, local origin = centre. */
export function buildStageNode(): VoxelGrid {
  const g = new VoxelGrid()
  disc(g, 0, 0, 6, 0, H.FILL_B)
  ring(g, 0, 0, 6, 0, H.CYAN, 1.3)
  ring(g, 0, 0, 3.6, 1, H.CYAN_MID, 1.1)
  g.box(-1, 1, -1, 1, 4, 1, H.WHITE)
  return g
}
