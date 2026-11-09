// Frosted-glass remaster of the agent marks: the ORIGINAL simple-icons path geometry (unmodified, uniform scale only),
// re-coloured with a vivid two-tone gradient and a soft glow on a frosted-glass face. Providers without a simple-icons
// mark get a letter badge in the same style so the chip row reads as one family.
// Run from a folder with simple-icons@16.37.0 and @resvg/resvg-js installed: node render-glass-logos.cjs <outDir>
const si = require("simple-icons")
const {Resvg} = require("@resvg/resvg-js")
const fs = require("fs")
const path = require("path")
const out = process.argv[2] || path.join(__dirname, "..", "..", "Assets", "Textures", "logos")

const P = [
  {id: "claude-code", icon: si.siClaude, a: "#FF7A45", b: "#FF2E63"},
  {id: "codex", text: "Cx", a: "#2EE59D", b: "#00B37E"},
  {id: "antigravity", text: "AG", a: "#B07CFF", b: "#6A3DFF"},
  {id: "opencode", icon: si.siOpencode, a: "#38B6FF", b: "#1F5BFF"},
  {id: "hermes", text: "He", a: "#FFD84D", b: "#FF9F1C"},
  {id: "openclaw", text: "Cl", a: "#FF5FA2", b: "#E0115F"},
  {id: "chatgpt-app", text: "Cg", a: "#3FE0D0", b: "#0FA3A3"},
  {id: "grok-bots", text: "Gr", a: "#B8F04A", b: "#5DBB1F"},
  {id: "instinct", text: "In", a: "#FF6BE8", b: "#B620E0"},
  {id: "muse", text: "Mu", a: "#FFB25C", b: "#FF6A1F"},
]
const FACE_TOP = "#EEF3FA", FACE_BOT = "#C9D6E8" // frosted face; mid tone ~#DCE6F2 matches the chip box colour

for (const p of P) {
  const defs =
    `<defs>` +
    `<linearGradient id="face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${FACE_TOP}"/><stop offset="1" stop-color="${FACE_BOT}"/></linearGradient>` +
    `<linearGradient id="ink" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}"/></linearGradient>` +
    `<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${p.a}" stop-opacity="0.45"/><stop offset="1" stop-color="${p.a}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.5"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>` +
    `<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>` +
    `</defs>`
  const face =
    `<rect width="128" height="128" fill="url(#face)"/>` +
    `<rect x="0" y="0" width="128" height="64" fill="url(#sheen)"/>` + // soft top sheen
    `<rect x="3" y="3" width="122" height="122" rx="22" fill="none" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="3"/>` + // bright rim
    `<circle cx="64" cy="66" r="50" fill="url(#glow)"/>`
  let mark
  if (p.icon) {
    const d = /<path d="([^"]+)"/.exec(p.icon.svg)[1]
    const g = `transform="translate(28 30) scale(3)"` // 24 -> 72 px, centred
    mark = `<g ${g} filter="url(#soft)" opacity="0.35"><path d="${d}" fill="${p.b}"/></g><g ${g}><path d="${d}" fill="url(#ink)"/></g>`
  } else {
    const t = `font-family="Segoe UI" font-weight="800" font-size="58" text-anchor="middle" x="64" y="85"`
    mark = `<text ${t} fill="${p.b}" filter="url(#soft)" opacity="0.35">${p.text}</text><text ${t} fill="url(#ink)">${p.text}</text>`
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">${defs}${face}${mark}</svg>`
  const png = new Resvg(svg, {fitTo: {mode: "width", value: 512}, font: {loadSystemFonts: true}}).render().asPng()
  fs.writeFileSync(path.join(out, "glass-" + p.id + ".png"), png)
  console.log("glass-" + p.id + ".png " + (p.icon ? "mark: simple-icons " + p.icon.title : "letters: " + p.text))
}
