// Frosted-glass tinted marks: the ORIGINAL simple-icons path geometry (unmodified, only scaled uniformly to fit and re-filled with a vivid tint)
// on a flat frosted-glass face. Only providers that simple-icons carries get a mark; the rest keep their vivid letter badge in the Lens.
const si = require("simple-icons")
const {Resvg} = require("@resvg/resvg-js")
const fs = require("fs")
const path = require("path")
const out = "D:/earthproof/lens/EarthProof/Assets/Textures/logos"

const TINTS = [
  {id: "claude-code", icon: si.siClaude, tint: "#FF5C38"}, // flame orange (provider colour in the Lens)
  {id: "opencode", icon: si.siOpencode, tint: "#1A99FF"}, // electric blue
]
const FACE = "#DCE6F2" // frosted glass face (flat, so it blends with the chip behind it)

for (const t of TINTS) {
  // path data only: simple-icons gives one <path d="..."/> in a 24x24 box; no geometry change, just uniform scale + a tint fill
  const d = /<path d="([^"]+)"/.exec(t.icon.svg)[1]
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" fill="${FACE}"/>` +
    `<g transform="translate(14 14) scale(1.5)"><path d="${d}" fill="${t.tint}"/></g>` +
    `</svg>`
  const png = new Resvg(svg, {fitTo: {mode: "width", value: 256}}).render().asPng()
  fs.writeFileSync(path.join(out, "tint-" + t.id + ".png"), png)
  console.log("wrote tint-" + t.id + ".png (" + png.length + " bytes) from simple-icons " + t.icon.title + " " + t.icon.hex)
}
