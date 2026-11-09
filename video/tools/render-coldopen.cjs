// Steps coldopen.js render(t) at 30 fps in headless Chromium and writes 480x270 PNG frames.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright")
const fs = require("fs"), path = require("path")
const SRC = path.join(__dirname, "..", "assets", "coldopen.js")
const OUT = path.join(__dirname, "frames")
;(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT)
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setContent('<canvas id="px" width="480" height="270"></canvas>')
  await page.addScriptTag({ content: fs.readFileSync(SRC, "utf8") })
  const dur = await page.evaluate(() => window.__coldopen.DURATION)
  const n = Math.round(dur * 30)
  for (let i = 0; i < n; i++) {
    const url = await page.evaluate((t) => { window.__coldopen.render(t); return document.getElementById("px").toDataURL("image/png") }, i / 30)
    fs.writeFileSync(path.join(OUT, `f${String(i).padStart(4, "0")}.png`), Buffer.from(url.split(",")[1], "base64"))
  }
  await browser.close()
  console.log("frames", n)
})()
