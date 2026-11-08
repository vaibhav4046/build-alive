// Generates the VirtualScene `apply` instructions for the EarthProof course from EarthProofLayout/EarthProofSim,
// so positions come from the same numbers the runtime and the tests use.
// Usage: node --no-warnings --import ./devpost/tools/ts-resolve.mjs devpost/tools/gen-scene.mjs > scene.json
import {RAMP, surfaceHeightCm, surfaceXCm} from "../../Assets/Scripts/EarthProofSim.ts"
import * as L from "../../Assets/Scripts/EarthProofLayout.ts"

const DEG = Math.PI / 180
const r = (n) => Math.round(n * 1000) / 1000
const v3 = (x, y, z) => [r(x), r(y), r(z)]
const col = (x, y, z) => ({x, y, z, w: 1})

// existing assets created by the probe apply (box/cylinder meshes, table material, red unlit material)
const BOX = "@id:3593a564-8bc0-4298-a196-4c866f533efe"
const CYL = "@id:f81d35be-a87f-4ee2-8fee-48946b7bd305"
const M = {table: "@id:c849bdc1-71f8-4af2-beaa-fbd9eb272bd1", red: "@id:16b5b739-8e32-4cda-9dfd-38bfac255016"}

const assets = [
  ["ramp", "SimplePBRMaterialPreset", "EP_Ramp", col(0.78, 0.84, 0.9)],
  ["landing", "SimplePBRMaterialPreset", "EP_Landing", col(0.2, 0.85, 0.95)],
  ["body", "SimplePBRMaterialPreset", "EP_RoverBody", col(0.95, 0.97, 1)],
  ["wheel", "SimplePBRMaterialPreset", "EP_Wheel", col(0.15, 0.8, 1)],
  ["spoke", "UnlitMaterialPreset", "EP_Spoke", col(1, 1, 1)],
  ["small", "SimplePBRMaterialPreset", "EP_BlockSmall", col(0.95, 0.6, 0.08)],
  ["geared", "SimplePBRMaterialPreset", "EP_BlockGeared", col(0.1, 0.65, 0.95)],
  ["slot", "SimplePBRMaterialPreset", "EP_Slot", col(0.2, 0.34, 0.4)],
  ["mount", "UnlitMaterialPreset", "EP_Mount", col(1, 0.85, 0.3)],
].map(([k, preset, name, c]) => ({id: `$temp:m_${k}`, preset, name, destinationPath: "Materials", properties: {"passInfos.0.baseColor": c}}))
const mat = (k) => (M[k] ? M[k] : `$temp:m_${k}`)

const create = []
const obj = (id, name, parent, pos, rot = [0, 0, 0], scale = [1, 1, 1], components = [], extra = {}) =>
  create.push({id: `$temp:${id}`, name, parentId: parent ? `$temp:${parent}` : null, transform: {position: pos, rotation: rot, scale}, components, ...extra})
const rmv = (mesh, m) => [{type: "RenderMeshVisual", properties: {mesh, mainMaterial: m}}]
const text = (t, size, color) => [
  {type: "Text", properties: {text: t, size, depthTest: true, "textFill.color": {x: color[0], y: color[1], z: color[2], w: 1}}},
]

obj("root", "EarthProof", null, [0, 0, 0])
obj("course", "Course", "root", [0, 0, 0])
obj("table", "Table", "course", v3(L.TABLE_CENTER.x, L.TABLE_CENTER.y, L.TABLE_CENTER.z), [0, 0, 0], v3(L.TABLE_SIZE.w, L.TABLE_SIZE.h, L.TABLE_SIZE.d), rmv(BOX, mat("table")))
obj("tlabel", "TableLabel", "course", v3(30, L.TABLE_TOP_Y + 0.3, -51), [-75, 0, 0], [1, 1, 1], text("SIMULATED IN PREVIEW", 48, [1, 0.78, 0.2]))

// ramp: planks along each section, plus a flat landing
obj("ramp", "Ramp", "course", [0, 0, 0])
let s0 = 0
RAMP.forEach((sec, i) => {
  const mid = s0 + sec.lengthCm / 2
  const a = sec.angleDeg * DEG
  const mx = L.RAMP_BASE_X + surfaceXCm(mid)
  const my = L.TABLE_TOP_Y + surfaceHeightCm(mid)
  // plank centre sits half a thickness below the surface, along the normal
  const cx = mx + Math.sin(a) * (L.RAMP_THICKNESS_CM / 2)
  const cy = my - Math.cos(a) * (L.RAMP_THICKNESS_CM / 2)
  obj(`ramp${i}`, i === 0 ? "RampShallow" : "RampSteep", "ramp", v3(cx, cy, L.RAMP_Z), [0, 0, sec.angleDeg], v3(sec.lengthCm, L.RAMP_THICKNESS_CM, L.RAMP_WIDTH_CM), rmv(BOX, mat("ramp")))
  s0 += sec.lengthCm
})
const topX = L.RAMP_BASE_X + surfaceXCm(L.RAMP_LENGTH_CM)
const topY = L.TABLE_TOP_Y + surfaceHeightCm(L.RAMP_LENGTH_CM)
obj("rampTop", "RampTop", "ramp", v3(topX + L.LANDING_CM / 2, topY - L.RAMP_THICKNESS_CM / 2, L.RAMP_Z), [0, 0, 0], v3(L.LANDING_CM, L.RAMP_THICKNESS_CM, L.RAMP_WIDTH_CM), rmv(BOX, mat("landing")))
const stallS = RAMP[0].lengthCm
obj("stall", "StallMarker", "ramp", v3(L.RAMP_BASE_X + surfaceXCm(stallS), L.TABLE_TOP_Y + surfaceHeightCm(stallS) + 2, L.STALL_MARKER_Z), [0, 0, 0], [0.8, 4, 0.8], rmv(BOX, mat("red")))

// rover at its start pose
const p = L.roverWorld(L.START_S)
obj("rover", "Rover", "course", v3(p.x, p.y, p.z), [0, 0, p.pitchDeg])
obj("body", "RoverBody", "rover", [0, L.ROVER_BODY.centerY, 0], [0, 0, 0], [L.ROVER_BODY.w, L.ROVER_BODY.h, L.ROVER_BODY.d], rmv(BOX, mat("body")))
for (const [name, sx, sz] of [["Wheel_FL", 1, -1], ["Wheel_FR", 1, 1], ["Wheel_RL", -1, -1], ["Wheel_RR", -1, 1]]) {
  const id = name.toLowerCase()
  obj(id, name, "rover", v3(sx * L.WHEEL.dx, 0, sz * L.WHEEL.dz))
  obj(id + "m", "WheelMesh", id, [0, 0, 0], [90, 0, 0], v3(L.WHEEL.radius * 2, L.WHEEL.width, L.WHEEL.radius * 2), rmv(CYL, mat("wheel")))
  obj(id + "s", "Spoke", id, v3(L.WHEEL.radius * 0.5, 0, sz * (L.WHEEL.width / 2 + 0.1)), [0, 0, 0], [L.WHEEL.radius, 0.7, 0.2], rmv(BOX, mat("spoke")))
}
obj("mount", "MotorMount", "rover", [0, L.MOUNT_LOCAL_Y, 0])
obj("mplate", "MountPlate", "mount", [0, 0.2, 0], [0, 0, 0], [L.BLOCK_SIZE_CM + 0.8, 0.4, L.BLOCK_SIZE_CM + 0.8], rmv(BOX, mat("mount")))
obj("mlabel", "MountLabel", "mount", [0, 9.2, 0], [0, 0, 0], [1, 1, 1], text("Small", 56, [0.4, 0.95, 1]))

// parts tray: plates on the table, small block mounted on the rover, geared block on its slot
obj("tray", "PartsTray", "course", [0, 0, 0])
for (const [key, slot, label, color] of [["small", L.SLOT_SMALL, "Small", "small"], ["geared", L.SLOT_GEARED, "Geared", "geared"]]) {
  obj("slot" + key, "Slot_" + label, "tray", v3(slot.x, slot.y + 0.2, slot.z), [0, 0, 0], v3(L.BLOCK_SIZE_CM + 2, 0.4, L.BLOCK_SIZE_CM + 2), rmv(BOX, mat("slot")))
  const mounted = key === "small"
  obj("block" + key, "MotorBlock_" + label, mounted ? "mount" : "tray",
    mounted ? v3(0, 0.4 + L.BLOCK_SIZE_CM / 2, 0) : v3(slot.x, slot.y + 0.4 + L.BLOCK_SIZE_CM / 2, slot.z),
    [0, 0, 0], v3(L.BLOCK_SIZE_CM, L.BLOCK_SIZE_CM, L.BLOCK_SIZE_CM), rmv(BOX, mat(color)))
  const k = 1 / L.BLOCK_SIZE_CM // undo the block's scale so the label keeps normal size
  obj("blabel" + key, "BlockLabel", "block" + key, [0, 0.95, 0], [0, 0, 0], [k, k, k], text(label, 56, [1, 1, 1]))
}
obj("beam", "EvidenceBeam", "course", v3(0, 0, -60), [0, 0, 0], [0.5, 0.5, 1], rmv(BOX, mat("red")), {enabled: false})
obj("controls", "Controls", "root", [0, 0, 0])
obj("cards", "Cards", "root", [0, 0, 0])

process.stdout.write(JSON.stringify({assets, create}))
