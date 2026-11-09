// Usage: npm i simple-icons@16.37.0 @resvg/resvg-js (in a scratch dir), then node render-logos.cjs. Regenerates Assets/Textures/logos/*.png.
// Renders agent logo badges: real simple-icons marks (unrecoloured, official hex) on a white rounded badge, and neutral monograms for
// brands that simple-icons does not carry. Output: D:/earthproof/lens/EarthProof/Assets/Textures/logos/*.png (256x256)
const si = require("simple-icons")
const {Resvg} = require("@resvg/resvg-js")
const fs = require("fs")
const path = require("path")
const out = "D:/earthproof/lens/EarthProof/Assets/Textures/logos"
fs.mkdirSync(out, {recursive: true})

const REAL = [
  {id: "claude-code", icon: si.siClaude},
  {id: "opencode", icon: si.siOpencode},
]
const MONOGRAMS = [
  {id: "codex", text: "Cx"},
  {id: "antigravity", text: "Ag"},
  {id: "hermes", text: "He"},
  {id: "openclaw", text: "Oc"},
  {id: "chatgpt-app", text: "Cg"},
  {id: "grok-bots", text: "Gr"},
  {id: "instinct", text: "In"},
  {id: "muse", text: "Mu"},
]
const meta = []

function renderPng(svg, file) {
  const png = new Resvg(svg, {fitTo: {mode: "width", value: 256}, font: {loadSystemFonts: true, defaultFontFamily: "Arial"}}).render().asPng()
  fs.writeFileSync(path.join(out, file), png)
}

for (const r of REAL) {
  // brand mark centred on a white rounded badge so dark marks stay visible on an additive display; the mark itself is never recoloured
  const inner = r.icon.svg.replace(/<title>.*?<\/title>/, "").replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#FFFFFF"/><g transform="translate(14 14) scale(1.5)" fill="#${r.icon.hex}">${inner}</g></svg>`
  renderPng(svg, r.id + ".png")
  meta.push({id: r.id, kind: "simple-icons", title: r.icon.title, hex: r.icon.hex, source: r.icon.source})
}
for (const m of MONOGRAMS) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#3A3F47"/><text x="32" y="43" font-family="Arial, sans-serif" font-size="28" font-weight="700" text-anchor="middle" fill="#FFFFFF">${m.text}</text></svg>`
  renderPng(svg, m.id + ".png")
  meta.push({id: m.id, kind: "generated-monogram", text: m.text})
}
fs.writeFileSync(path.join(out, "_logos.json"), JSON.stringify({simpleIconsVersion: "16.37.0", note: "marks are trademarks of their owners; nominative use only; unrecoloured", logos: meta}, null, 2))
console.log(meta.map((x) => x.id + ":" + x.kind).join(" | "))
