// BUILD ALIVE - wordless pixel-art intro (0..22.6 s). Pure function of time t; no clocks, no Math.random.
// 480x270 canvas shown at 4x with nearest-neighbour scaling. Dissolves block-by-block (transparent) into the real footage below.
(() => {
  "use strict"
  const W = 480, H = 270
  const cv = document.getElementById("px")
  const ctx = cv.getContext("2d")
  const C = {
    bg: "#060a14", sky1: "#0b1226", sky2: "#14204a", star: "#dfe8ff", cyan: "#47ebff", cyanD: "#1d6f86", cyanDD: "#134a5c",
    amber: "#ffc83d", amberD: "#9a7421", amberDD: "#5e4713", mint: "#3df5ad", mintD: "#1f9a6d", mintDD: "#14634a",
    coral: "#ff5c52", coralD: "#a3302b", violet: "#c28aff", violetD: "#7d52b8", white: "#f4f7ff",
    grass: "#3fb64b", grassD: "#2a7f35", dirt: "#6b4a2e", dirtD: "#4a321d", wood: "#a98457", woodD: "#7a5c3a", woodDD: "#5a4129",
  }
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
  const seg = (t, a, b) => clamp((t - a) / (b - a))
  const ease = (x) => x * x * (3 - 2 * x)
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) }
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h) }

  const GLYPH = {
    B: ["1111.", "1...1", "1...1", "1111.", "1...1", "1...1", "1111."],
    U: ["1...1", "1...1", "1...1", "1...1", "1...1", "1...1", ".111."],
    I: [".111.", "..1..", "..1..", "..1..", "..1..", "..1..", ".111."],
    L: ["1....", "1....", "1....", "1....", "1....", "1....", "11111"],
    D: ["1111.", "1...1", "1...1", "1...1", "1...1", "1...1", "1111."],
    A: [".111.", "1...1", "1...1", "11111", "1...1", "1...1", "1...1"],
    V: ["1...1", "1...1", "1...1", "1...1", "1...1", ".1.1.", "..1.."],
    E: ["11111", "1....", "1....", "1111.", "1....", "1....", "11111"],
  }
  function glyph(ch, x, y, s, col) {
    const g = GLYPH[ch]
    for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (g[r][c] === "1") R(x + c * s, y + r * s, s, s, col)
  }

  // Islands: three project islands on the desk, each with a small block-city.
  const ISL = [
    { x0: 50, x1: 150, hi: C.cyan, mid: C.cyanD, lo: C.cyanDD, t0: 3.0 },
    { x0: 190, x1: 290, hi: C.amber, mid: C.amberD, lo: C.amberDD, t0: 4.4 },
    { x0: 330, x1: 430, hi: C.mint, mid: C.mintD, lo: C.mintDD, t0: 5.8 },
  ]
  const TOP = 196
  const BLD = []
  ISL.forEach((il, ii) => {
    const spec = [[8, 14, 30], [26, 12, 46], [42, 16, 24], [62, 12, 38], [78, 14, 20]]
    spec.forEach(([dx, w, h], k) => BLD.push({ isl: ii, x: il.x0 + dx, w, h, t: il.t0 + k * 0.42, id: ii * 5 + k, il }))
  })
  const FAULT = BLD[12] // third building on island 3
  const BOT_KEYS = [[9.4, 64], [11.0, 100], [12.4, 238], [14.0, 300], [15.0, 365 + 7]]
  function botX(t) {
    if (t <= BOT_KEYS[0][0]) return BOT_KEYS[0][1]
    for (let i = 1; i < BOT_KEYS.length; i++) {
      if (t <= BOT_KEYS[i][0]) {
        const a = BOT_KEYS[i - 1], b = BOT_KEYS[i]
        return a[1] + (b[1] - a[1]) * ease(seg(t, a[0], b[0]))
      }
    }
    return BOT_KEYS[BOT_KEYS.length - 1][1]
  }

  function sky(t) {
    for (let y = 0; y < 200; y += 8) {
      const f = y / 200
      R(0, y, W, 8, f < 0.5 ? C.bg : f < 0.78 ? C.sky1 : C.sky2)
    }
    for (let i = 0; i < 80; i++) {
      const x = Math.floor(hash(i * 2) * W), y = Math.floor(hash(i * 2 + 1) * 150)
      const tw = Math.sin(t * (1.1 + hash(i) * 1.6) + i * 3.1)
      if (tw > -0.2) R(x, y, 1, 1, tw > 0.6 ? C.star : "#7d8fbe")
    }
  }

  function desk() {
    R(0, 214, W, 6, C.wood)
    R(0, 214, W, 1, "#c9a46f")
    R(0, 220, W, 50, C.woodD)
    for (let y = 226; y < 270; y += 9) R(0, y, W, 1, C.woodDD)
    for (let x = 30; x < W; x += 97) R(x, 220, 1, 50, C.woodDD)
  }

  function island(il) {
    const w = il.x1 - il.x0
    R(il.x0, TOP, w, 3, C.grass)
    R(il.x0, TOP + 3, w, 2, C.grassD)
    R(il.x0, TOP + 5, w, 13, C.dirt)
    R(il.x0 + 6, TOP + 18, w - 12, 0, C.dirt)
    for (let x = il.x0 + 4; x < il.x1; x += 9) R(x, TOP + 8 + ((x * 7) % 6), 3, 2, C.dirtD)
  }

  function building(b, t, bx) {
    const g = ease(seg(t, b.t, b.t + 0.9))
    const h = Math.floor((g * b.h) / 4) * 4
    if (h <= 0) return
    let body = b.il.mid, cap = b.il.hi
    const flash = t > 9.4 && Math.abs(bx - (b.x + b.w / 2)) < 9
    if (b === FAULT) {
      if (t >= 14.0 && t < 16.4) { const on = Math.floor(t * 4) % 2 === 0; body = on ? C.coralD : C.coral; cap = C.coral }
      else if (t >= 16.4) { body = C.mintD; cap = C.mint }
    }
    R(b.x, TOP - h, b.w, h, body)
    R(b.x, TOP - h, b.w, 3, flash ? C.amber : cap)
    R(b.x + b.w - 2, TOP - h, 2, h, b.il.lo)
    for (let y = TOP - h + 6; y < TOP - 4; y += 6) for (let x = b.x + 3; x < b.x + b.w - 4; x += 5) {
      if (hash(b.id * 17 + x * 3 + y) > 0.45 && g >= 1) R(x, y, 2, 2, hash(x + y + Math.floor(t * 0.7)) > 0.82 ? C.white : b.il.hi)
    }
  }

  function bridges(t) {
    const a = ease(seg(t, 8.4, 9.4))
    if (a <= 0) return
    for (let k = 0; k < 2; k++) {
      const x0 = k === 0 ? 150 : 290, x1 = k === 0 ? 190 : 330
      for (let x = x0; x < x1; x += 4) R(x, TOP - 3, 3, 2, (x - x0 + Math.floor(t * 20)) % 12 < 4 ? C.cyan : C.cyanD)
    }
    const a2 = ease(seg(t, 9.0, 10.6))
    const n = Math.floor(48 * a2)
    for (let i = 0; i < n; i++) {
      const u = i / 48, x = 100 + 280 * u, y = TOP - 24 - 70 * Math.sin(Math.PI * u)
      R(x, y, 2, 2, (i + Math.floor(t * 16)) % 6 < 2 ? C.violet : C.violetD)
    }
  }

  const BOT = [
    "....X....", "...XXX...", "..XXXXX..", ".XWXXXWX.", ".XXXXXXX.", "..XXXXX..", ".XXDXDXX.", ".X.XXX.X.", "...X.X...",
  ]
  function bot(t) {
    if (t < 9.4) return
    const bx = botX(t)
    const hover = 150 + (Math.floor(t * 4) % 2) * 2 - 10 * (1 - ease(seg(t, 9.4, 10.2)))
    const S = 2
    BOT.forEach((row, r) => { for (let c = 0; c < 9; c++) {
      const ch = row[c]
      if (ch === ".") continue
      R(bx - 9 + c * S, hover + r * S, S, S, ch === "W" ? C.cyan : ch === "D" ? C.violetD : C.violet)
    } })
    // repair beam on the faulty building (14.9 -> 16.4)
    if (t > 14.9 && t < 16.4) {
      const top = TOP - FAULT.h
      for (let y = hover + 20; y < top; y += 4) R(bx - 1, y, 2, 2, (Math.floor((y + t * 40) / 4) % 2) ? C.coral : C.mint)
    }
    // sparkle when repaired
    if (t >= 16.4 && t < 17.3) {
      const u = (t - 16.4) / 0.9
      for (let i = 0; i < 14; i++) {
        const ang = hash(i) * 6.283, d = 4 + u * 26 * (0.5 + hash(i + 9))
        R(FAULT.x + FAULT.w / 2 + Math.cos(ang) * d, TOP - FAULT.h - 4 + Math.sin(ang) * d, 2, 2, i % 2 ? C.mint : C.white)
      }
    }
  }

  function spectacles(t) {
    const g = ease(seg(t, 17.0, 18.2))
    if (g <= 0) return
    const x = 195, y = -26 + g * 52
    R(x, y + 4, 90, 3, C.white)               // bridge/top rim
    R(x - 14, y + 4, 14, 3, "#8a97bb")          // left arm
    R(x + 90, y + 4, 14, 3, "#8a97bb")          // right arm
    const glow = 0.6 + 0.4 * (Math.floor(t * 3) % 2)
    for (const lx of [x + 2, x + 50]) {
      R(lx, y + 7, 38, 20, C.white)
      R(lx + 2, y + 9, 34, 16, glow > 0.8 ? C.cyan : "#2aa9bd")
      R(lx + 5, y + 11, 8, 2, C.white)
    }
    R(x + 40, y + 10, 10, 3, C.white)
  }

  function title(t) {
    const word = "BUILD ALIVE"
    const s = 5, adv = 30, total = word.length * adv - 5
    const x0 = Math.round((W - total) / 2), y0 = 84
    for (let i = 0; i < word.length; i++) {
      const ch = word[i]
      if (ch === " ") continue
      if (t < 18.8 + i * 0.14) continue
      glyph(ch, x0 + i * adv + 2, y0 + 2, s, C.cyanD)
      glyph(ch, x0 + i * adv, y0, s, C.white)
    }
  }

  function render(t) {
    ctx.clearRect(0, 0, W, H)
    sky(t)
    ISL.forEach(island)
    desk()
    const bx = botX(t)
    BLD.forEach((b) => building(b, t, t >= 9.4 ? bx : -99))
    bridges(t)
    bot(t)
    spectacles(t)
    title(t)
    const fade = 1 - seg(t, 0, 1.3)
    if (fade > 0) { ctx.globalAlpha = fade; R(0, 0, W, H, C.bg); ctx.globalAlpha = 1 }
    // block dissolve into the real footage underneath (21.0 -> 22.5)
    const d = seg(t, 21.0, 22.5)
    if (d > 0) {
      for (let by = 0; by < H; by += 8) for (let bxx = 0; bxx < W; bxx += 8) {
        if (hash(bxx * 0.13 + by * 1.7) < d * 1.08) ctx.clearRect(bxx, by, 8, 8)
      }
    }
  }

  window.addEventListener("hf-seek", (e) => render(e.detail.time))
  render(0)
  window.__intro = { render }
})()
