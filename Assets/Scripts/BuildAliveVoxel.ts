// BuildAliveVoxel: pure voxel grid + face-culled mesh data for the BUILD ALIVE miniature world.
// One palette texture (BA_Palette.png, generated from PALETTE by devpost/tools/gen-voxel-palette.mjs) holds every
// colour in 6 baked shade rows, so a whole district renders as one unlit mesh = one draw call, with crisp voxel shading.
// Pure module (no Lens globals) so Node tests and the Lens share the exact geometry.

export type Rgb = readonly [number, number, number]

/** Original restrained warm palette (sRGB 0-255). Order is the texture column order; append only. */
export const PALETTE: readonly Rgb[] = [
  [112, 188, 84], // 0 grass a
  [128, 202, 92], // 1 grass b
  [98, 172, 76], // 2 grass c
  [156, 110, 70], // 3 dirt
  [124, 86, 58], // 4 dirt dark
  [156, 156, 166], // 5 stone
  [118, 118, 132], // 6 stone dark
  [232, 208, 152], // 7 sand
  [84, 172, 236], // 8 water
  [150, 214, 250], // 9 water light
  [242, 246, 252], // 10 snow
  [172, 122, 76], // 11 wood
  [124, 86, 54], // 12 wood dark
  [72, 158, 74], // 13 leaf a
  [100, 184, 86], // 14 leaf b
  [214, 92, 72], // 15 roof red
  [84, 132, 204], // 16 roof blue
  [64, 172, 160], // 17 roof teal
  [240, 228, 204], // 18 plaster
  [192, 114, 82], // 19 brick
  [248, 200, 76], // 20 gold
  [255, 220, 128], // 21 warm window glow
  [96, 222, 242], // 22 cyan
  [255, 112, 98], // 23 coral
  [176, 136, 242], // 24 violet
  [116, 232, 172], // 25 mint
  [252, 252, 255], // 26 cloud
  [250, 152, 192], // 27 flower pink
  [255, 232, 104], // 28 flower yellow
  [242, 198, 152], // 29 skin
  [66, 70, 86], // 30 dark
  [50, 124, 84], // 31 pine
]

export const C = {
  GRASS_A: 0, GRASS_B: 1, GRASS_C: 2, DIRT: 3, DIRT_DK: 4, STONE: 5, STONE_DK: 6, SAND: 7,
  WATER: 8, WATER_LT: 9, SNOW: 10, WOOD: 11, WOOD_DK: 12, LEAF_A: 13, LEAF_B: 14, ROOF_RED: 15,
  ROOF_BLUE: 16, ROOF_TEAL: 17, PLASTER: 18, BRICK: 19, GOLD: 20, GLOW: 21, CYAN: 22, CORAL: 23,
  VIOLET: 24, MINT: 25, CLOUD: 26, PINK: 27, YELLOW: 28, SKIN: 29, DARK: 30, PINE: 31,
} as const

export const PAL_COLS = 32
/** Shade row per face direction: +Y top, +Z (faces the wearer), -X (key light from the left), +X, -Z, -Y. */
export const SHADE: readonly number[] = [1.0, 0.86, 0.93, 0.72, 0.62, 0.5]
export const PAL_ROWS = SHADE.length

// face order matches SHADE rows
const DIRS: readonly [number, number, number][] = [
  [0, 1, 0], [0, 0, 1], [-1, 0, 0], [1, 0, 0], [0, 0, -1], [0, -1, 0],
]
// 4 corners per face (unit cube 0..1), counter-clockwise when seen from outside
const FACE_CORNERS: readonly (readonly [number, number, number][])[] = [
  [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], // +Y
  [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], // +Z
  [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], // -X
  [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], // +X
  [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], // -Z
  [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], // -Y
]

const OFF = 512
const SPAN = 1024
function key(x: number, y: number, z: number): number {
  return ((x + OFF) * SPAN + (y + OFF)) * SPAN + (z + OFF)
}

/** Sparse voxel grid of palette indices. Coordinates are integers in [-512, 511]. */
export class VoxelGrid {
  private readonly cells = new Map<number, number>()

  set(x: number, y: number, z: number, color: number): void {
    if (x < -OFF || x >= OFF || y < -OFF || y >= OFF || z < -OFF || z >= OFF) return
    this.cells.set(key(x, y, z), color)
  }

  get(x: number, y: number, z: number): number {
    const v = this.cells.get(key(x, y, z))
    return v === undefined ? -1 : v
  }

  clear(x: number, y: number, z: number): void {
    this.cells.delete(key(x, y, z))
  }

  /** Inclusive box fill. */
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: number): void {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
        for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) this.set(x, y, z, color)
  }

  get size(): number {
    return this.cells.size
  }

  forEach(fn: (x: number, y: number, z: number, color: number) => void): void {
    this.cells.forEach((color, k) => {
      const z = (k % SPAN) - OFF
      const y = (Math.floor(k / SPAN) % SPAN) - OFF
      const x = Math.floor(k / (SPAN * SPAN)) - OFF
      fn(x, y, z, color)
    })
  }
}

export interface VoxelMeshChunk {
  /** Interleaved position(3, cm) normal(3) uv(2). */
  readonly verts: number[]
  readonly indices: number[]
}

export const FLOATS_PER_VERT = 8
const MAX_VERTS_PER_CHUNK = 65532

/** Palette UV for a colour + face row (cell centre; v = 0 is the bottom of the texture). */
export function paletteUv(color: number, row: number): [number, number] {
  return [(color + 0.5) / PAL_COLS, 1 - (row + 0.5) / PAL_ROWS]
}

/**
 * Emits only faces whose neighbour is empty. `voxelCm` is the edge length; `origin` is the cm position of voxel (0,0,0)'s
 * minimum corner. Splits into UInt16-indexable chunks.
 */
export function buildVoxelMesh(grid: VoxelGrid, voxelCm: number, origin: [number, number, number] = [0, 0, 0]): VoxelMeshChunk[] {
  const chunks: VoxelMeshChunk[] = []
  let verts: number[] = []
  let indices: number[] = []
  let vCount = 0
  grid.forEach((x, y, z, color) => {
    for (let f = 0; f < 6; f++) {
      const d = DIRS[f]
      if (grid.get(x + d[0], y + d[1], z + d[2]) >= 0) continue
      if (vCount + 4 > MAX_VERTS_PER_CHUNK) {
        chunks.push({verts, indices})
        verts = []
        indices = []
        vCount = 0
      }
      const uv = paletteUv(color, f)
      const corners = FACE_CORNERS[f]
      for (let c = 0; c < 4; c++) {
        verts.push(
          origin[0] + (x + corners[c][0]) * voxelCm,
          origin[1] + (y + corners[c][1]) * voxelCm,
          origin[2] + (z + corners[c][2]) * voxelCm,
          d[0], d[1], d[2],
          uv[0], uv[1],
        )
      }
      indices.push(vCount, vCount + 1, vCount + 2, vCount, vCount + 2, vCount + 3)
      vCount += 4
    }
  })
  if (vCount > 0) chunks.push({verts, indices})
  return chunks
}

/** Deterministic small PRNG (mulberry32) so the world is identical every launch. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Smooth value noise in [0,1] on an integer lattice (seeded), for terrain heights. */
export function valueNoise2(seed: number): (x: number, z: number) => number {
  const h = (ix: number, iz: number): number => {
    let n = (ix * 374761393 + iz * 668265263 + seed * 2147483647) | 0
    n = Math.imul(n ^ (n >>> 13), 1274126177)
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296
  }
  const s = (t: number): number => t * t * (3 - 2 * t)
  return (x: number, z: number): number => {
    const ix = Math.floor(x)
    const iz = Math.floor(z)
    const fx = s(x - ix)
    const fz = s(z - iz)
    const a = h(ix, iz) + (h(ix + 1, iz) - h(ix, iz)) * fx
    const b = h(ix, iz + 1) + (h(ix + 1, iz + 1) - h(ix, iz + 1)) * fx
    return a + (b - a) * fz
  }
}
