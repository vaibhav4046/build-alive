// BuildAliveWorldArt: original voxel recipes for the BUILD ALIVE valley (pure; no Lens globals).
// Every recipe returns a VoxelGrid in palette indices; BuildAliveSceneUI turns grids into meshes with buildVoxelMesh().
// Art direction: warm restrained palette, one voxel scale per layer (terrain 2 cm, mountains 5 cm, props/buildings
// 0.5 cm, workers 0.25 cm), deterministic seeds so the world is identical on every launch and in every test.

import {CITY_MODULES, PLATEAU_Y} from "./BuildAliveLayout"
import type {ModuleLayoutSpec} from "./BuildAliveLayout"
import {C, rng, valueNoise2, VoxelGrid} from "./BuildAliveVoxel"

export const TERRAIN_VOX = 2
export const MOUNTAIN_VOX = 5
export const PROP_VOX = 0.5
export const WORKER_VOX = 0.25
export const CLOUD_VOX = 1.2

export const WATER_TOP_Y = -30
const RIVER_HALF = 3.2
const FRONT_K = -24 // terrain voxel row whose front face is the near ledge (z = -46 cm)
const BOTTOM_J = -22 // terrain is filled down to y = -44 cm (below the bottom of the view)

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t)
const hash2 = (a: number, b: number, s: number): number => {
  let n = (a * 73856093) ^ (b * 19349663) ^ (s * 83492791)
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296
}

/** River centre line (cm): comes down from the far right hills, swings past the watchtower, falls off the near ledge. */
export function riverCenterX(z: number): number {
  return 24 + 4 * Math.sin((z + 80) / 14) - (z > -66 ? (z + 66) * 0.45 : 0)
}

const hillNoise = valueNoise2(7)
const detailNoise = valueNoise2(19)

function plateauWeight(x: number, z: number): number {
  // a soft rectangle under the whole village plus a disc under every plot
  const rx = clamp01((24 - Math.abs(x - 0.5)) / 4)
  const rz = clamp01((16.5 - Math.abs(z + 75.5)) / 4)
  let w = rx * rz
  for (const m of CITY_MODULES) {
    const d = Math.hypot(x - m.center.x, z - m.center.z)
    w = Math.max(w, clamp01((11 - d) / 4))
  }
  return w
}

/** Continuous ground height (cm) before voxel snapping. */
export function groundHeight(x: number, z: number): number {
  let h = -28 + Math.max(0, -z - 66) * 0.075
  h += (hillNoise(x / 15, z / 15) - 0.5) * 6 + (detailNoise(x / 6, z / 6) - 0.5) * 1.2
  h += Math.max(0, Math.abs(x) - 28) * 0.3
  const w = plateauWeight(x, z)
  h = h * (1 - w) + PLATEAU_Y * w
  const dx = Math.abs(x - riverCenterX(z))
  if (dx < RIVER_HALF + 2.5) {
    const t = clamp01((dx - RIVER_HALF) / 2.5)
    h = Math.min(h, -32 + (h + 32) * t)
  }
  return h
}

/** Top surface y (cm) of the terrain column that contains (x, z): exactly what the mesh shows. */
export function terrainTopAt(x: number, z: number): number {
  const i = Math.floor(x / TERRAIN_VOX)
  const k = Math.floor(z / TERRAIN_VOX)
  return TERRAIN_VOX * Math.round(groundHeight((i + 0.5) * TERRAIN_VOX, (k + 0.5) * TERRAIN_VOX) / TERRAIN_VOX)
}

function isRiver(x: number, z: number): boolean {
  return Math.abs(x - riverCenterX(z)) < RIVER_HALF + 0.6 && z < -44
}

/** The valley floor: grass over dirt over stone, a river bed, and a jagged near ledge. Origin = world origin. */
export function buildTerrain(): VoxelGrid {
  const g = new VoxelGrid()
  for (let i = -34; i <= 33; i++) {
    for (let k = -76; k <= FRONT_K; k++) {
      if (k === FRONT_K && hash2(i, 5, 3) < 0.4) continue // jagged ledge
      const cx = (i + 0.5) * TERRAIN_VOX
      const cz = (k + 0.5) * TERRAIN_VOX
      const top = Math.round(groundHeight(cx, cz) / TERRAIN_VOX) - 1
      const dx = Math.abs(cx - riverCenterX(cz))
      for (let j = BOTTOM_J; j <= top; j++) {
        const depth = top - j
        let c: number
        if (depth === 0) {
          if (dx < RIVER_HALF + 0.6) c = hash2(i, k, 1) < 0.5 ? C.SAND : C.STONE
          else if (dx < RIVER_HALF + 2.2) c = C.SAND
          else {
            const r = hash2(i, k, 2)
            c = r < 0.4 ? C.GRASS_A : r < 0.8 ? C.GRASS_B : C.GRASS_C
          }
        } else if (depth <= 2) c = hash2(i, j * 7 + k, 4) < 0.7 ? C.DIRT : C.DIRT_DK
        else c = hash2(i, j * 13 + k, 6) < 0.75 ? C.STONE : C.STONE_DK
        g.set(i, j, k, c)
      }
    }
  }
  return g
}

/** River surface (separate mesh so it can shimmer) + the waterfall curtain down the near ledge. */
export function buildWater(): VoxelGrid {
  const g = new VoxelGrid()
  const wj = Math.round(WATER_TOP_Y / TERRAIN_VOX) - 1 // voxel row whose top is WATER_TOP_Y
  for (let i = -34; i <= 33; i++) {
    for (let k = -76; k <= FRONT_K; k++) {
      const cx = (i + 0.5) * TERRAIN_VOX
      const cz = (k + 0.5) * TERRAIN_VOX
      if (!isRiver(cx, cz)) continue
      const top = Math.round(groundHeight(cx, cz) / TERRAIN_VOX) - 1
      for (let j = top + 1; j <= wj; j++) g.set(i, j, k, hash2(i, k, 9) < 0.25 ? C.WATER_LT : C.WATER)
    }
  }
  // waterfall: one voxel in front of the ledge, falling below the view
  const fx = riverCenterX(-46)
  for (let i = Math.floor((fx - RIVER_HALF) / TERRAIN_VOX); i <= Math.floor((fx + RIVER_HALF) / TERRAIN_VOX); i++) {
    for (let j = BOTTOM_J; j <= wj; j++) g.set(i, j, FRONT_K + 1, (i + j) % 3 === 0 ? C.WATER_LT : C.WATER)
  }
  return g
}

/** Far hills and snowy peaks behind the valley (5 cm voxels). */
export function buildMountains(): VoxelGrid {
  const g = new VoxelGrid()
  const n = valueNoise2(31)
  const n2 = valueNoise2(43)
  for (let i = -36; i <= 35; i++) {
    for (let k = -56; k <= -30; k++) {
      const cx = (i + 0.5) * MOUNTAIN_VOX
      const cz = (k + 0.5) * MOUNTAIN_VOX
      const f = clamp01((-cz - 148) / 55)
      const ridge = 1 - Math.abs(2 * n(cx / 45, cz / 45) - 1)
      const h = -23 + f * (6 + 38 * ridge * ridge + 10 * n2(cx / 18, cz / 18)) + Math.max(0, Math.abs(cx) - 60) * 0.12
      const top = Math.round(h / MOUNTAIN_VOX) - 1
      for (let j = -6; j <= top; j++) {
        const y = (j + 1) * MOUNTAIN_VOX
        let c: number = C.STONE
        if (j === top) c = y > 16 ? C.SNOW : y > 4 ? (hash2(i, k, 8) < 0.6 ? C.STONE : C.STONE_DK) : hash2(i, k, 7) < 0.5 ? C.PINE : C.GRASS_C
        else if (j === top - 1 && y > 14) c = C.SNOW
        else if (hash2(i, j * 3 + k, 5) < 0.3) c = C.STONE_DK
        g.set(i, j, k, c)
      }
    }
  }
  return g
}

// ---- props (0.5 cm voxels, world-anchored grid) ------------------------------------------------------------------

const P = (cm: number): number => Math.round(cm / PROP_VOX)

function blob(g: VoxelGrid, cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, pick: (x: number, y: number, z: number) => number): void {
  for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let z = Math.floor(cz - rz); z <= Math.ceil(cz + rz); z++) {
        const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / rz) ** 2
        if (d <= 1) g.set(x, y, z, pick(x, y, z))
      }
}

/** Round leafy tree or pine at world (x, z) cm, standing on the terrain. `size` ~ 1 (village) to 2 (foreground). */
export function addTree(g: VoxelGrid, x: number, z: number, size: number, pine: boolean, seed: number): void {
  const bx = P(x)
  const bz = P(z)
  const by = P(terrainTopAt(x, z))
  const trunkH = Math.round((pine ? 3 : 5) * size)
  for (let y = by; y < by + trunkH; y++) {
    g.set(bx, y, bz, C.WOOD_DK)
    if (size > 1.4) {
      g.set(bx + 1, y, bz, C.WOOD_DK)
      g.set(bx, y, bz + 1, C.WOOD_DK)
      g.set(bx + 1, y, bz + 1, C.WOOD)
    }
  }
  const r = rng(seed)
  if (pine) {
    const layers = Math.round(4 * size)
    for (let t = 0; t < layers; t++) {
      const rad = (layers - t) * 0.9 + 0.6
      const y = by + trunkH - 1 + t * 2
      blob(g, bx, y, bz, rad, 1.2, rad, () => (r() < 0.8 ? C.PINE : C.LEAF_A))
    }
    g.set(bx, by + trunkH - 1 + layers * 2, bz, C.PINE)
  } else {
    const rad = 3.2 * size
    const cy = by + trunkH + rad * 0.6
    blob(g, bx, cy, bz, rad, rad * 0.85, rad, () => (r() < 0.55 ? C.LEAF_A : C.LEAF_B))
    blob(g, bx + rad * 0.5, cy + rad * 0.45, bz - rad * 0.3, rad * 0.6, rad * 0.55, rad * 0.6, () => (r() < 0.4 ? C.LEAF_A : C.LEAF_B))
    if (r() < 0.5) g.set(bx - Math.round(rad * 0.7), Math.round(cy), bz + Math.round(rad * 0.6), C.CORAL) // an apple
  }
}

function insideVillagePlot(x: number, z: number, margin: number): boolean {
  return CITY_MODULES.some((m) => Math.abs(x - m.center.x) < m.size.w / 2 + margin && Math.abs(z - m.center.z) < m.size.d / 2 + margin)
}

/** Trees, flowers and rocks: near-field framing on the ledge, a few village trees, pines on the far hills. */
export function buildProps(): VoxelGrid {
  const g = new VoxelGrid()
  // foreground framing (big, partly out of view = depth)
  addTree(g, -18, -50, 2.0, false, 1)
  addTree(g, -11.5, -55, 1.2, false, 2)
  addTree(g, 25, -55, 1.8, false, 3)
  // village trees
  const village: [number, number, boolean][] = [
    [-23, -76, false], [-6, -92, false], [12, -93, true], [-24, -88, true], [3, -60, false], [-9, -60, false],
  ]
  village.forEach(([x, z, pine], i) => addTree(g, x, z, 1, pine, 10 + i))
  // far pines on the hills, skipping the river and the plateau
  const r = rng(77)
  let placed = 0
  for (let tries = 0; tries < 400 && placed < 34; tries++) {
    const x = -60 + r() * 120
    const z = -98 - r() * 50
    if (isRiver(x, z) || Math.abs(x - riverCenterX(z)) < 6) continue
    addTree(g, x, z, 0.9 + r() * 0.5, r() < 0.75, 100 + tries)
    placed++
  }
  // flowers and pebbles on the meadow between the ledge and the village
  for (let tries = 0; tries < 520; tries++) {
    const x = -34 + r() * 66
    const z = -47 - r() * 50
    if (isRiver(x, z) || insideVillagePlot(x, z, 1.5) || Math.abs(x - riverCenterX(z)) < 4.5) continue
    const y = P(terrainTopAt(x, z))
    const roll = r()
    if (roll < 0.62) {
      g.set(P(x), y, P(z), C.GRASS_B)
      g.set(P(x), y + 1, P(z), roll < 0.3 ? C.PINK : roll < 0.52 ? C.YELLOW : C.CLOUD)
    } else if (roll < 0.8) {
      g.set(P(x), y, P(z), C.GRASS_A)
      g.set(P(x), y + 1, P(z), C.GRASS_B)
    } else {
      g.box(P(x), y, P(z), P(x) + 1, y, P(z) + (roll < 0.9 ? 1 : 0), C.STONE)
    }
  }
  return g
}

// ---- village buildings (0.5 cm voxels, local grid 0..14 x 0..14; origin at plot centre bottom) -------------------

export type BuildingRole = ModuleLayoutSpec["role"]
/** Mesh origin that centres a 15x15 footprint on the plot. */
export const BUILDING_ORIGIN: [number, number, number] = [-3.75, 0, -3.75]

function gable(g: VoxelGrid, x0: number, x1: number, z0: number, z1: number, y0: number, c: number): number {
  let t = 0
  while (z0 + t <= z1 - t) {
    g.box(x0, y0 + t, z0 + t, x1, y0 + t, z1 - t, c)
    t++
  }
  return y0 + t
}

function cylinder(g: VoxelGrid, cx: number, cz: number, r: number, y0: number, y1: number, pick: (y: number) => number): void {
  for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++)
    for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++)
      if ((x - cx) ** 2 + (z - cz) ** 2 <= r * r) for (let y = y0; y <= y1; y++) g.set(x, y, z, pick(y))
}

/** Building for a module role; `tier` 0..2 grows it with the module's real file count. Front faces +Z (the wearer). */
export function buildBuilding(role: BuildingRole, tier: number): VoxelGrid {
  const g = new VoxelGrid()
  const up = Math.max(0, Math.min(2, tier)) * 2
  if (role === "Logic") {
    // code workshop: brick walls, red roof, smoking chimney, workbench and anvil outside
    g.box(0, 0, 1, 14, 0, 13, C.STONE)
    g.box(1, 1, 2, 12, 6 + up, 11, C.BRICK)
    for (const [x, z] of [[1, 2], [12, 2], [1, 11], [12, 11]]) g.box(x, 1, z, x, 6 + up, z, C.WOOD_DK)
    g.box(1, 6 + up, 11, 12, 6 + up, 11, C.WOOD_DK)
    g.box(6, 1, 11, 7, 4, 11, C.WOOD_DK)
    g.box(2, 3 + up, 11, 4, 4 + up, 11, C.GLOW)
    g.box(9, 3 + up, 11, 11, 4 + up, 11, C.GLOW)
    g.box(1, 3, 5, 1, 4, 8, C.GLOW)
    gable(g, 0, 13, 1, 12, 7 + up, C.ROOF_RED)
    g.box(9, 7 + up, 4, 10, 14 + up, 5, C.BRICK)
    g.box(9, 15 + up, 4, 10, 15 + up, 5, C.STONE_DK)
    g.box(13, 1, 12, 14, 1, 13, C.STONE_DK)
    g.box(13, 2, 12, 14, 2, 12, C.STONE)
    g.box(0, 1, 12, 0, 2, 13, C.WOOD)
  } else if (role === "Tests") {
    // watchtower: stone courses, glowing slits, crenellated top (the status lamp is a separate object above)
    g.box(3, 0, 3, 11, 2, 11, C.STONE_DK)
    for (let y = 3; y <= 15 + up; y++) g.box(4, y, 4, 10, y, 10, y % 4 === 0 ? C.STONE_DK : C.STONE)
    g.box(6, 1, 11, 8, 3, 11, C.WOOD_DK)
    g.box(7, 6, 10, 7, 8, 10, C.GLOW)
    g.box(7, 11 + up, 10, 7, 13 + up, 10, C.GLOW)
    g.box(3, 16 + up, 3, 11, 16 + up, 11, C.STONE)
    for (let x = 3; x <= 11; x++)
      for (let z = 3; z <= 11; z++)
        if ((x === 3 || x === 11 || z === 3 || z === 11) && (x + z) % 2 === 0) g.set(x, 17 + up, z, C.STONE)
    g.box(0, 1, 12, 1, 1, 13, C.STONE)
  } else if (role === "Assets") {
    // barn: plank walls, big door, teal roof, crates and a hay bale
    g.box(0, 0, 1, 14, 0, 13, C.DIRT)
    g.box(1, 1, 2, 13, 5 + up, 11, C.WOOD)
    for (let x = 1; x <= 13; x += 3) g.box(x, 1, 11, x, 5 + up, 11, C.WOOD_DK)
    g.box(5, 1, 11, 9, 4 + up, 11, C.WOOD_DK)
    g.box(5, 4 + up, 11, 9, 4 + up, 11, C.PLASTER)
    gable(g, 0, 14, 1, 12, 6 + up, C.ROOF_TEAL)
    g.box(0, 1, 12, 1, 2, 13, C.WOOD)
    g.box(0, 3, 12, 0, 3, 12, C.GOLD)
    g.box(12, 1, 12, 14, 2, 13, C.YELLOW)
  } else if (role === "API") {
    // windmill: stone base, plaster tower, dark cap (the sails are a separate spinning object)
    cylinder(g, 7, 7, 4.6, 0, 5, () => C.STONE)
    cylinder(g, 7, 7, 3.6, 6, 12 + up, () => C.PLASTER)
    for (let t = 0; t < 4; t++) cylinder(g, 7, 7, 3.9 - t, 13 + up + t, 13 + up + t, () => C.STONE_DK)
    g.box(6, 1, 11, 8, 3, 11, C.WOOD_DK)
    g.box(7, 8, 10, 7, 9, 10, C.GLOW)
    g.box(6, 13 + up, 10, 8, 14 + up, 11, C.WOOD_DK)
  } else if (role === "Data") {
    // granary: banded silo with a golden cone roof and a lean-to
    cylinder(g, 7, 7, 4.2, 0, 11 + up, (y) => (y === 4 || y === 8 ? C.GOLD : C.PLASTER))
    for (let t = 0; t < 5; t++) cylinder(g, 7, 7, 4.8 - t, 12 + up + t, 12 + up + t, () => C.GOLD)
    g.box(6, 1, 11, 8, 3, 11, C.WOOD_DK)
    g.box(11, 1, 2, 14, 4, 6, C.WOOD)
    g.box(11, 5, 2, 14, 5, 6, C.ROOF_RED)
  } else {
    // UI cottage: plaster and timber, big warm windows, blue roof, flower boxes, picket fence
    g.box(1, 0, 2, 13, 0, 12, C.STONE)
    g.box(2, 1, 3, 12, 6 + up, 11, C.PLASTER)
    for (const [x, z] of [[2, 3], [12, 3], [2, 11], [12, 11], [7, 11]]) g.box(x, 1, z, x, 6 + up, z, C.WOOD_DK)
    g.box(3, 3, 11, 5, 5, 11, C.GLOW)
    g.box(9, 3, 11, 11, 5, 11, C.GLOW)
    g.box(3, 2, 12, 5, 2, 12, C.WOOD)
    g.box(9, 2, 12, 11, 2, 12, C.WOOD)
    for (const x of [3, 5, 9, 11]) g.set(x, 3, 12, x % 4 === 3 ? C.PINK : C.YELLOW)
    g.box(6, 1, 11, 8, 2, 11, C.WOOD)
    gable(g, 1, 13, 2, 12, 7 + up, C.ROOF_BLUE)
    g.box(4, 7 + up, 5, 4, 11 + up, 5, C.STONE)
    for (let x = 0; x <= 14; x += 2) g.box(x, 1, 14, x, 2, 14, C.PLASTER)
  }
  return g
}

/** Four windmill sails around a hub at the origin, in the XY plane (spins about +Z). */
export function buildWindmillSails(): VoxelGrid {
  const g = new VoxelGrid()
  g.box(-1, -1, 0, 1, 1, 1, C.WOOD_DK)
  for (let a = 0; a < 4; a++) {
    for (let t = 2; t <= 10; t++) {
      const along = (dx: number): [number, number] => {
        if (a === 0) return [dx, t]
        if (a === 1) return [t, -dx]
        if (a === 2) return [-dx, -t]
        return [-t, dx]
      }
      const [x0, y0] = along(0)
      g.set(x0, y0, 0, C.WOOD)
      if (t >= 4) {
        const [x1, y1] = along(1)
        const [x2, y2] = along(2)
        g.set(x1, y1, 0, C.PLASTER)
        g.set(x2, y2, 0, t % 3 === 0 ? C.WOOD : C.PLASTER)
      }
    }
  }
  return g
}

// ---- floating project islands (0.5 cm voxels, local origin = island centre, grass top at +2.5 cm) ------------------

export const ISLAND_RADIUS_VOX = 11
export const ISLAND_TOP_CM = 2.5

export interface IslandArtSpec {
  readonly seed: number
  readonly houses: number
  readonly roof: number
  readonly sample: boolean
}

/** Floating island: grass disc, layered rocky underside, a tree, one tiny house per module (max 8), a waterfall. */
export function buildIsland(spec: IslandArtSpec): VoxelGrid {
  const g = new VoxelGrid()
  const r = rng(spec.seed)
  const R = ISLAND_RADIUS_VOX
  const top = 4 // grass row; origin offset puts its top face at +2.5 cm
  const depth = 15
  const edge: number[] = []
  for (let a = 0; a < 32; a++) edge.push(R - r() * 1.8)
  const radiusAt = (x: number, z: number): number => {
    const ang = Math.atan2(z, x)
    const idx = ((Math.round(((ang + Math.PI) / (2 * Math.PI)) * 32) % 32) + 32) % 32
    return edge[idx]
  }
  for (let x = -R; x <= R; x++)
    for (let z = -R; z <= R; z++) {
      const d = Math.hypot(x, z)
      const er = radiusAt(x, z)
      if (d > er) continue
      g.set(x, top, z, r() < 0.5 ? C.GRASS_A : C.GRASS_B)
      g.set(x, top - 1, z, C.DIRT)
      g.set(x, top - 2, z, r() < 0.6 ? C.DIRT : C.DIRT_DK)
      for (let t = 3; t <= depth; t++) {
        const rr = er * Math.pow(1 - t / (depth + 1), 0.75)
        if (d <= rr) g.set(x, top - t, z, r() < 0.55 ? C.STONE : r() < 0.6 ? C.STONE_DK : C.DIRT_DK)
      }
    }
  if (spec.sample) {
    // made-up world: a violet crystal spire and two tents (no real modules)
    for (let y = 1; y <= 9; y++) {
      const w = y < 7 ? 1 : 0
      g.box(-w, top + y, -w, w, top + y, w, y > 7 ? C.CLOUD : C.VIOLET)
    }
    g.box(4, top + 1, 2, 6, top + 1, 4, C.PINK)
    g.box(5, top + 2, 2, 5, top + 2, 4, C.PINK)
    g.box(-6, top + 1, 3, -4, top + 1, 5, C.YELLOW)
    g.box(-5, top + 2, 3, -5, top + 2, 5, C.YELLOW)
  } else {
    // a tree at the heart and a ring of tiny houses = the repo's real module count
    for (let y = 1; y <= 3; y++) g.set(0, top + y, 0, C.WOOD_DK)
    blob(g, 0, top + 5, 0, 2.6, 2.2, 2.6, () => (r() < 0.5 ? C.LEAF_A : C.LEAF_B))
    const n = Math.max(1, Math.min(8, spec.houses))
    for (let h = 0; h < n; h++) {
      const ang = (h / n) * Math.PI * 2 + 0.4
      const hx = Math.round(Math.cos(ang) * 6.5)
      const hz = Math.round(Math.sin(ang) * 6.5)
      g.box(hx, top + 1, hz, hx + 1, top + 2, hz + 1, C.PLASTER)
      g.set(hx, top + 1, hz + 1, C.GLOW)
      g.box(hx, top + 3, hz, hx + 1, top + 3, hz + 1, spec.roof)
    }
  }
  // stream to the front-right rim, then a waterfall down the side
  const sx = 7
  const sz = 7
  for (let t = 0; t <= 4; t++) g.set(sx - 4 + t, top, sz - 4 + t, C.WATER)
  for (let y = top; y >= top - 12; y--) g.set(sx + 1, y, sz + 1, y % 3 === 0 ? C.WATER_LT : C.WATER)
  return g
}

/** Mesh origin so an island grid's grass top sits at ISLAND_TOP_CM above the island centre. */
export const ISLAND_ORIGIN: [number, number, number] = [0, ISLAND_TOP_CM - 5 * PROP_VOX, 0]

// ---- sky, workers, small props -----------------------------------------------------------------------------------

export function buildCloud(seed: number): VoxelGrid {
  const g = new VoxelGrid()
  const r = rng(seed)
  const parts = 3 + Math.floor(r() * 2)
  for (let p = 0; p < parts; p++) {
    const cx = (p - parts / 2) * 3.2 + r() * 1.5
    blob(g, cx, r() * 1.2, r() * 1.5, 3 + r() * 2, 1.6 + r() * 0.9, 2.4 + r(), () => C.CLOUD)
  }
  return g
}

/** Voxel worker (feet at y = 0, faces +Z). Builder wears a gold hard hat; helper wears a white cap. */
export function buildWorker(body: number, hat: number): VoxelGrid {
  const g = new VoxelGrid()
  g.box(0, 0, 1, 1, 2, 2, C.DARK)
  g.box(3, 0, 1, 4, 2, 2, C.DARK)
  g.box(0, 3, 0, 4, 6, 3, body)
  g.box(-1, 3, 1, -1, 6, 2, body)
  g.box(5, 3, 1, 5, 6, 2, body)
  g.box(0, 7, 0, 4, 10, 3, C.SKIN)
  g.set(1, 9, 3, C.DARK)
  g.set(3, 9, 3, C.DARK)
  g.box(-1, 11, -1, 5, 11, 4, hat)
  g.box(0, 12, 0, 4, 12, 3, hat)
  return g
}
export const WORKER_ORIGIN: [number, number, number] = [-2.5 * WORKER_VOX, 0, -2 * WORKER_VOX]

/** Something to carry: a crate (file change). */
export function buildCrate(): VoxelGrid {
  const g = new VoxelGrid()
  g.box(0, 0, 0, 3, 3, 3, C.WOOD)
  g.box(0, 2, 0, 3, 2, 3, C.GOLD)
  return g
}

/** A single soft cube (smoke puff, water droplet, firefly) at the given colour. */
export function buildPuff(color: number): VoxelGrid {
  const g = new VoxelGrid()
  g.set(0, 0, 0, color)
  return g
}

/** Stepping-stone path along local +Z, `lengthCm` long, centred on the origin. Dotted when the link is unverified. */
export function buildPath(lengthCm: number, verified: boolean, seed: number): VoxelGrid {
  const g = new VoxelGrid()
  const r = rng(seed)
  const n = Math.max(1, Math.floor(lengthCm / PROP_VOX))
  for (let k = 0; k < n; k++) {
    if (!verified && k % 4 >= 2) continue
    if (verified && k % 5 === 4) continue
    for (let x = -1; x <= 1; x++) {
      if (Math.abs(x) === 1 && r() < 0.3) continue
      g.set(x, 0, k, r() < 0.5 ? C.SAND : C.STONE)
    }
  }
  return g
}
export function pathOrigin(lengthCm: number): [number, number, number] {
  return [-0.5 * PROP_VOX, -0.42, -lengthCm / 2]
}

/** Amber hourglass for Rewind (local origin = centre). */
export function buildHourglass(): VoxelGrid {
  const g = new VoxelGrid()
  g.box(-3, -5, -3, 3, -5, 3, C.WOOD_DK)
  g.box(-3, 5, -3, 3, 5, 3, C.WOOD_DK)
  for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) g.box(x, -4, z, x, 4, z, C.WOOD)
  for (let y = -4; y <= 4; y++) {
    const w = Math.max(0, Math.round(Math.abs(y) * 0.55))
    g.box(-w, y, -w, w, y, w, y < 0 ? C.GOLD : y === 0 ? C.YELLOW : C.WATER_LT)
  }
  return g
}

/** Warning lantern for a failing check (local origin = centre). */
export function buildWarning(): VoxelGrid {
  const g = new VoxelGrid()
  for (let y = -2; y <= 2; y++) {
    const w = 2 - Math.abs(y)
    g.box(-w, y, -w, w, y, w, C.CORAL)
  }
  g.set(0, 3, 0, C.YELLOW)
  return g
}
