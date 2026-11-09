// BUILD ALIVE - wordless pixel cold open (0..12.4 s), labelled "concept" in the film. Pure function of time t:
// no clocks, no Math.random. 480x270 canvas shown at 4x, nearest-neighbour. Story: 2 a.m., a vibe coder drowns in a
// long agent session (terminal flood, helper pings, one red failure), puts on original pixel AR glasses (chunky
// Specs-style frame, not any other brand), and a tiny valley of their project blooms above the desk. Then the
// blocks dissolve (transparent) into the real Lens Studio Preview footage underneath.
(() => {
  "use strict"
  const W = 480, H = 270
  const cv = document.getElementById("px")
  const ctx = cv.getContext("2d")
  const C = {
    night: "#0a0f1f", night2: "#121a33", wall: "#171f3b", wallD: "#111833", moon: "#f3f0d8", star: "#dfe8ff",
    city: "#ffd36b", cityD: "#c28a3a", desk: "#7a5636", deskL: "#a77a4c", deskD: "#4e3522",
    screen: "#0e1a2c", glow: "#3c6fa8", term: "#9fe8ff", termD: "#4f9ab8", ok: "#74e8ac", warn: "#ffcc59", red: "#ff5c52",
    hood: "#6c5ce7", hoodD: "#4b3db8", hoodL: "#8e80ff", skin: "#f2c698", skinD: "#c99467", hair: "#2b1d16",
    can: "#ff7a3d", canL: "#ffd0a8", frame: "#e9edf7", frameD: "#9aa4bd", lens: "#5ad7f0", lensL: "#c9f6ff",
    grass: "#70bc54", grassD: "#4f8a3c", dirt: "#9c6e46", roof: "#d65c48", roof2: "#5484cc", roof3: "#40aca0",
    water: "#54acec", gold: "#f8c84c", white: "#fffaf0", violet: "#b088f2", cyan: "#60def2",
  }
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
  const seg = (t, a, b) => clamp((t - a) / (b - a))
  const ease = (x) => x * x * (3 - 2 * x)
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) }
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))) }

  // 3x5 digits for the wall clock
  const DIG = {
    "0": ["111", "101", "101", "101", "111"], "1": ["010", "110", "010", "010", "111"], "2": ["111", "001", "111", "100", "111"],
    "7": ["111", "001", "010", "010", "010"], ":": ["0", "1", "0", "1", "0"],
  }
  function digits(str, x, y, s, col) {
    let cx = x
    for (const ch of str) {
      const g = DIG[ch]
      for (let r = 0; r < 5; r++) for (let c = 0; c < g[r].length; c++) if (g[r][c] === "1") R(cx + c * s, y + r * s, s, s, col)
      cx += (g[0].length + 1) * s
    }
  }

  function room(t) {
    R(0, 0, W, H, C.wall)
    for (let y = 0; y < 170; y += 10) R(0, y, W, 1, C.wallD)
    const wx = 336, wy = 22, ww = 128, wh = 96
    R(wx - 4, wy - 4, ww + 8, wh + 8, C.deskD)
    R(wx, wy, ww, wh, C.night)
    R(wx, wy + wh * 0.55, ww, wh * 0.45, C.night2)
    R(wx + 108, wy + 14, 14, 14, C.moon)
    R(wx + 104, wy + 18, 6, 6, C.night)
    for (let i = 0; i < 22; i++) {
      const tw = Math.sin(t * (1 + hash(i) * 2) + i)
      if (tw > 0) R(wx + 4 + hash(i * 3) * (ww - 8), wy + 4 + hash(i * 5) * 40, 1, 1, C.star)
    }
    for (let i = 0; i < 18; i++) {
      const bx = wx + i * 9, bh = 10 + hash(i * 7) * 26
      R(bx, wy + wh - bh, 8, bh, "#0c1328")
      for (let k = 0; k < 4; k++) if (hash(i * 11 + k) > 0.5) R(bx + 2 + (k % 2) * 3, wy + wh - bh + 3 + Math.floor(k / 2) * 6, 2, 2, hash(i + k + Math.floor(t)) > 0.3 ? C.city : C.cityD)
    }
    R(wx + ww / 2 - 1, wy, 2, wh, C.deskD)
    R(206, 30, 52, 22, "#0d1430")
    digits("2:07", 211, 35, 3, Math.floor(t * 2) % 2 ? C.red : "#ff8a80")
    R(0, 170, W, 8, C.deskL)
    R(0, 178, W, 92, C.desk)
    for (let y = 186; y < H; y += 12) R(0, y, W, 1, C.deskD)
  }

  const LX = 140, LY = 92, LW = 150, LH = 78
  function laptop(t) {
    const fail = t >= 5.0 && t < 7.0
    R(LX - 4, LY - 4, LW + 8, LH + 8, "#2a3150")
    R(LX, LY, LW, LH, C.screen)
    ctx.globalAlpha = 0.18 + (fail ? 0.12 * (Math.floor(t * 6) % 2) : 0)
    R(LX - 30, LY - 30, LW + 60, LH + 40, fail ? C.red : C.glow)
    ctx.globalAlpha = 1
    const tabs = 2 + Math.floor(seg(t, 1.0, 4.6) * 5)
    for (let i = 0; i < tabs; i++) R(LX + 3 + i * 21, LY + 3, 19, 5, i === tabs - 1 ? C.term : C.termD)
    const speed = 6 + 40 * ease(seg(t, 0.8, 4.8))
    const scroll = Math.floor(t * speed)
    for (let row = 0; row < 15; row++) {
      const n = scroll + row
      const len = 20 + hash(n * 3.7) * 110
      let col = hash(n * 1.3) > 0.85 ? C.ok : hash(n * 2.1) > 0.9 ? C.warn : C.termD
      if (fail && row === 14) col = C.red
      R(LX + 5, LY + 12 + row * 4, Math.min(len, LW - 10), 2, col)
    }
    if (fail) {
      R(LX + 3, LY + 64, LW - 6, 10, Math.floor(t * 6) % 2 ? C.red : "#a3302b")
      R(LX + 8, LY + 67, 4, 4, C.white)
    }
    R(LX - 10, 170, LW + 20, 4, "#3a4266")
  }

  function pings(t) {
    const n = Math.floor(seg(t, 1.6, 4.8) * 7)
    for (let i = 0; i < n; i++) {
      const y = LY + 4 + i * 10
      R(LX + LW + 8, y, 16, 7, i % 3 === 2 ? C.violet : C.cyan)
      R(LX + LW + 10, y + 2, 3, 3, C.white)
    }
  }

  function coder(t) {
    const slump = ease(seg(t, 5.2, 6.0)) * (1 - ease(seg(t, 7.0, 7.6)))
    const lift = ease(seg(t, 7.4, 8.4))
    const bx = 100, by = 104 + slump * 6
    R(bx - 18, 120, 8, 52, "#262c47")
    R(bx - 18, 150, 44, 6, "#262c47")
    R(bx - 10, by + 14, 34, 40, C.hood)
    R(bx - 10, by + 14, 34, 4, C.hoodL)
    R(bx + 18, by + 18, 6, 32, C.hoodD)
    const armY = by + 30 - lift * 30
    R(bx + 20, armY, 34 - lift * 18, 6, C.hood)
    R(bx + 52 - lift * 18, armY - 1, 6, 6, C.skin)
    const hx = bx - 2, hy = by - 8 + slump * 4
    R(hx - 4, hy - 4, 30, 30, C.hoodD)
    R(hx, hy, 22, 22, C.skin)
    R(hx, hy, 22, 6, C.hair)
    R(hx - 2, hy + 2, 6, 10, C.hair)
    R(hx + 16, hy + 10, 2, 2, "#1a1a2a")
    R(hx + 18, hy + 17, 3, 1, C.skinD)
    R(hx + 4, hy + 6, 6, 12, "#30364f")
    R(hx + 6, hy - 6, 2, 12, "#30364f")
    R(318, 158, 9, 13, C.can)
    R(318, 158, 9, 2, C.canL)
    return {hx, hy}
  }

  function glasses(t, head) {
    const g = ease(seg(t, 6.6, 8.4))
    if (g <= 0) return
    const tx = head.hx + 12, ty = head.hy + 7
    const sx = 230, sy = 30
    const x = sx + (tx - sx) * g, y = sy + (ty - sy) * g
    const s = 1 - 0.55 * g
    const fw = 64 * s, fh = 18 * s
    R(x - fw / 2 - 6 * s, y + 3 * s, 8 * s, 4 * s, C.frameD)
    R(x - fw / 2, y, fw, fh, C.frame)
    const lw = fw * 0.42, lh = fh * 0.62
    const lc = Math.floor(t * 3) % 2 ? C.lens : "#3fb8cf"
    R(x - fw / 2 + fw * 0.05, y + fh * 0.18, lw, lh, lc)
    R(x + fw * 0.03, y + fh * 0.18, lw, lh, lc)
    R(x - fw / 2 + fw * 0.08, y + fh * 0.25, lw * 0.25, 1, C.lensL)
    R(x - fw / 2 + 1, y + 1, 2, 2, "#1a1a2a")
    R(x + fw / 2 - 3, y + 1, 2, 2, "#1a1a2a")
  }

  function bloom(t) {
    const g = ease(seg(t, 8.6, 10.2))
    if (g <= 0) return
    ctx.globalAlpha = 0.12 * g
    R(0, 0, W, H, C.cyan)
    ctx.globalAlpha = 1
    const isl = [
      {x: 200, y: 64, roof: C.roof, d: 0}, {x: 290, y: 50, roof: C.roof2, d: 0.25}, {x: 380, y: 68, roof: C.roof3, d: 0.5},
    ]
    for (const il of isl) {
      const k = ease(seg(t, 8.6 + il.d, 9.8 + il.d))
      if (k <= 0) continue
      const bob = Math.sin(t * 2 + il.x) * 1.5
      const w = 46 * k, y = il.y + bob + (1 - k) * 20
      R(il.x - w / 2, y, w, 4, C.grass)
      R(il.x - w / 2, y + 4, w, 3, C.grassD)
      for (let r = 0; r < 4; r++) R(il.x - w / 2 + r * 5 * k, y + 7 + r * 3, w - r * 10 * k, 3, r % 2 ? C.dirt : "#7c563a")
      if (k > 0.7) {
        for (let h = 0; h < 3; h++) {
          const hx = il.x - 14 + h * 12
          R(hx, y - 6, 7, 6, C.white)
          R(hx - 1, y - 9, 9, 3, il.roof)
          R(hx + 2, y - 4, 2, 2, C.gold)
        }
        R(il.x + 20, y + 4, 2, 12, C.water)
      }
    }
    if (t > 9.6) {
      const wx = 270 + ((t - 9.6) * 14) % 40
      R(wx, 41, 4, 5, C.cyan)
      R(wx, 38, 4, 3, C.skin)
      R(wx - 1, 37, 6, 1, C.gold)
      R(wx + 4, 42, 3, 3, "#ac7a4c")
    }
  }

  function render(t) {
    ctx.clearRect(0, 0, W, H)
    R(0, 0, W, H, C.wall)
    ctx.save()
    ctx.translate(0, 40)
    room(t)
    laptop(t)
    pings(t)
    const head = coder(t)
    glasses(t, head)
    bloom(t)
    ctx.restore()
    const fade = 1 - seg(t, 0, 1.0)
    if (fade > 0) { ctx.globalAlpha = fade; R(0, 0, W, H, "#000000"); ctx.globalAlpha = 1 }
    const d = seg(t, 10.9, 12.4)
    if (d > 0) {
      for (let by = 0; by < H; by += 8) for (let bx = 0; bx < W; bx += 8) {
        if (hash(bx * 0.13 + by * 1.7) < d * 1.08) ctx.clearRect(bx, by, 8, 8)
      }
    }
  }

  window.__coldopen = {render, DURATION: 12.4}
  if (cv) render(0)
})()
