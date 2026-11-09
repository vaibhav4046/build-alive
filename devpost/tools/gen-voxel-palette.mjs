// Writes Assets/Textures/BA_Palette.png from PALETTE x SHADE in Assets/Scripts/BuildAliveVoxel.ts (single source of truth).
// Each colour is an 8x8 px cell; row r holds the colour multiplied by SHADE[r] with a slight cool shift in the shadows.
// Run: node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tools/gen-voxel-palette.mjs
import {mkdirSync, writeFileSync} from "node:fs"
import {deflateSync, crc32} from "node:zlib"
import {PALETTE, SHADE, PAL_COLS} from "../../Assets/Scripts/BuildAliveVoxel.ts"

const CELL = 8
const W = PAL_COLS * CELL
const H = SHADE.length * CELL

const raw = Buffer.alloc(H * (W * 4 + 1))
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0 // filter: none
  const shade = SHADE[Math.floor(y / CELL)]
  const cool = 1 - shade // shadows lean slightly blue so the world reads as lit by a warm sun
  for (let x = 0; x < W; x++) {
    const c = PALETTE[Math.floor(x / CELL)] || [255, 0, 255]
    const o = y * (W * 4 + 1) + 1 + x * 4
    raw[o] = Math.round(Math.min(255, c[0] * shade * (1 - 0.18 * cool)))
    raw[o + 1] = Math.round(Math.min(255, c[1] * shade * (1 - 0.06 * cool)))
    raw[o + 2] = Math.round(Math.min(255, c[2] * shade * (1 + 0.12 * cool)))
    raw[o + 3] = 255
  }
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, "ascii"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td) >>> 0)
  return Buffer.concat([len, td, crc])
}
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0)
ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 6 // RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw)),
  chunk("IEND", Buffer.alloc(0)),
])
mkdirSync(new URL("../../Assets/Textures/", import.meta.url), {recursive: true})
const out = new URL("../../Assets/Textures/BA_Palette.png", import.meta.url)
writeFileSync(out, png)
console.log("wrote", out.pathname, W + "x" + H, png.length, "bytes")
