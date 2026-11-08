// EarthProof demo film: pixel-art scenes drawn on a 320x180 canvas, scaled 6x with nearest-neighbour by CSS.
// Everything is a pure function of time t (seconds) so every render is identical. No Date.now, no Math.random.
// The real Lens Studio preview footage is a <video> layer in index.html; this file draws everything else.
(() => {
  "use strict"
  const W = 320, H = 180
  const cv = document.getElementById("px")
  const ctx = cv.getContext("2d")
  ctx.imageSmoothingEnabled = false

  // ---- timeline (seconds). index.html uses the same numbers for the video layers and audio. -----------------
  const T = window.FILM_T = {
    intro: [0, 3], A: [3, 20], B: [20, 37], C: [37, 54],
    real: [54, 134], concept: [134, 146], end: [146, 165], total: 165,
  }
  const VIG = 17 // vignette length

  // ---- palette -------------------------------------------------------------------------------------------
  const P = {
    ink: "#070b16", night: "#0e1530", wallA: "#1a2548", wallA2: "#222f5a", floorA: "#242a4f", floorA2: "#2d3562",
    wallB: "#432c5e", wallB2: "#51376e", floorB: "#2f2244", floorB2: "#3a2a55",
    skyC1: "#27456b", skyC2: "#e0996a", grassC: "#2c5a3a", grassC2: "#3b7048", shed: "#8a5a36", shed2: "#5e3d25",
    wood: "#7c5332", wood2: "#58381f", metal: "#9aa5c4", metal2: "#6a7494",
    cyan: "#5be7ff", cyan2: "#27a3c6", amber: "#ffc83d", amber2: "#c98a14", red: "#ff6258", red2: "#b13a33",
    white: "#f4f7ff", gray: "#8f99b8", dark: "#1a1d2e", green: "#4fcf7b", green2: "#2c8f52", clay: "#c4673e",
  }
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
  const seg = (t, a, b) => clamp((t - a) / (b - a))
  const ease = (t) => t * t * (3 - 2 * t)
  const lerp = (a, b, t) => a + (b - a) * t
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)) }
  const dot = (x, y, c) => R(x, y, 1, 1, c)
  const alpha = (a, fn) => { const g = ctx.globalAlpha; ctx.globalAlpha = clamp(a); fn(); ctx.globalAlpha = g }
  function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
  const STARS = (() => { const r = mulberry32(7); return Array.from({length: 46}, () => ({x: Math.floor(r() * W), y: Math.floor(r() * 110), p: r() * 6.28, s: 0.6 + r() * 1.4})) })()

  function line(x0, y0, x1, y1, c, th = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1)
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
    let err = dx + dy
    for (;;) {
      R(x0, y0, th, th, c)
      if (x0 === x1 && y0 === y1) break
      const e2 = 2 * err
      if (e2 >= dy) { err += dy; x0 += sx }
      if (e2 <= dx) { err += dx; y0 += sy }
    }
  }
  const GLY = {
    "0": ["111", "101", "101", "101", "111"], "1": ["010", "110", "010", "010", "111"], "2": ["111", "001", "111", "100", "111"],
    "3": ["111", "001", "111", "001", "111"], "4": ["101", "101", "111", "001", "001"], "5": ["111", "100", "111", "001", "111"],
    "6": ["111", "100", "111", "101", "111"], "7": ["111", "001", "010", "010", "010"], "8": ["111", "101", "111", "101", "111"],
    "9": ["111", "101", "111", "001", "111"], ".": ["000", "000", "000", "000", "010"], "x": ["000", "101", "010", "101", "000"],
  }
  function txt(s, x, y, c) {
    let cx = x
    for (const ch of s) {
      const g = GLY[ch]
      if (g) g.forEach((row, j) => { for (let i = 0; i < 3; i++) if (row[i] === "1") dot(cx + i, y + j, c) })
      cx += 4
    }
  }
  const ICON = {
    bang: ["0001000", "0001000", "0001000", "0001000", "0000000", "0001000", "0000000"],
    ask: ["0011100", "0100010", "0000010", "0001100", "0001000", "0000000", "0001000"],
    tick: ["0000001", "0000011", "1000110", "1101100", "0111000", "0010000", "0000000"],
  }
  function icon(rows, x, y, c) { rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === "1") dot(x + i, y + j, c) }) }
  function bubble(kind, x, y, t, col) { // speech bubble centred on x, above y; pops in with a small overshoot
    const k = ease(clamp(t)) * (1 + 0.15 * Math.sin(clamp(t) * 3.14))
    if (k <= 0.05) return
    const w = Math.round(13 * k), h = Math.round(13 * k)
    const bx = Math.round(x - w / 2), by = Math.round(y - h - 4)
    R(bx + 1, by, w - 2, h, P.white); R(bx, by + 1, w, h - 2, P.white); R(x - 1, by + h, 3, 2, P.white); R(x, by + h + 2, 1, 1, P.white)
    if (k > 0.9) icon(ICON[kind], bx + 3, by + 3, col)
  }

  // ---- backgrounds -----------------------------------------------------------------------------------------
  function bg(kind, t) {
    if (kind === "A") {
      R(0, 0, W, 150, P.wallA); for (let y = 0; y < 150; y += 10) R(0, y, W, 5, P.wallA2)
      R(0, 150, W, 30, P.floorA); for (let x = 0; x < W; x += 28) R(x, 150, 1, 30, P.floorA2)
      R(236, 20, 52, 40, P.night) // window with stars
      STARS.slice(0, 14).forEach((s) => { if (s.x > 0 && s.y < 40) dot(236 + (s.x % 50) + 1, 20 + (s.y % 38) + 1, Math.sin(t * s.s + s.p) > 0 ? P.white : P.gray) })
      R(235, 19, 54, 1, P.metal2); R(235, 60, 54, 1, P.metal2); R(235, 19, 1, 42, P.metal2); R(288, 19, 1, 42, P.metal2); R(261, 20, 1, 40, P.metal2)
    } else if (kind === "B") {
      R(0, 0, W, 150, P.wallB); for (let x = 0; x < W; x += 16) R(x, 0, 2, 150, P.wallB2)
      R(0, 150, W, 30, P.floorB); for (let y = 150; y < H; y += 8) R(0, y, W, 1, P.floorB2)
      R(24, 30, 30, 24, P.wood2); R(26, 32, 26, 20, P.skyC2); R(26, 44, 26, 8, P.grassC) // picture frame
      R(70, 118, 5, 32, P.wood2); R(64, 112, 17, 4, P.wood) // side table + small lamp base
      R(68, 100, 9, 12, P.amber); R(70, 98, 5, 2, P.amber2)
    } else {
      for (let y = 0; y < 120; y++) { const k = y / 120; R(0, y, W, 1, k < 0.6 ? P.skyC1 : P.skyC2) }
      R(0, 120, W, 60, P.grassC); for (let x = 0; x < W; x += 12) R(x, 120 + ((x * 7) % 20), 5, 2, P.grassC2)
      for (let x = 6; x < 130; x += 20) { R(x, 108, 3, 18, P.wood2); R(x - 2, 112, 18, 2, P.wood) } // fence
      R(256, 54, 64, 74, P.shed); for (let y = 54; y < 128; y += 8) R(256, y, 64, 1, P.shed2) // shed
      R(250, 46, 70, 10, P.shed2); R(268, 78, 30, 50, P.dark) // roof + dark doorway
    }
  }

  // ---- people ----------------------------------------------------------------------------------------------
  const WHO = {
    teen: {skin: "#d79a6c", hair: "#3a2a22", style: "spiky", shirt: "#ff8a3d", shirt2: "#cc6a24", pants: "#2b3350", scale: 0.92},
    mill: {skin: "#f1c9a2", hair: "#2a1d18", style: "short", shirt: "#2fb5a8", shirt2: "#1f857c", pants: "#3a3f66", scale: 1},
    elder: {skin: "#9a6a48", hair: "#cfd6e6", style: "gray", shirt: "#a58ad8", shirt2: "#7d63ad", pants: "#4a4f6e", scale: 0.97},
  }
  // pose: down | phone | type | reach | up ; mood: neutral | worry | happy ; gl: glasses on 0..1
  function person(who, x, feetY, f, pose, mood, gl, t) {
    const o = WHO[who], s = o.scale
    const bob = Math.round(Math.sin(t * 3) * 0.6)
    const legH = Math.round(11 * s), torsoH = Math.round(12 * s), headS = 9
    const legTop = feetY - legH, torsoTop = legTop - torsoH + bob, headTop = torsoTop - headS + 2
    // legs, shoes
    R(x - 5, legTop, 4, legH, o.pants); R(x + 1, legTop, 4, legH, o.pants)
    R(x - 6 + (f > 0 ? 1 : 0), feetY - 1, 6, 2, P.dark); R(x + 0 + (f > 0 ? 1 : 0), feetY - 1, 6, 2, P.dark)
    // torso
    R(x - 6, torsoTop, 12, torsoH, o.shirt); R(x - 6, torsoTop + torsoH - 3, 12, 3, o.shirt2)
    // far arm (behind) and near arm
    const sh = torsoTop + 2
    const arm = (side, mode) => { // side -1/+1 relative to facing
      const ax = x + side * 7 * (side === f ? 1 : 1)
      if (mode === "down") R(ax - 1, sh, 3, 10, o.shirt2)
      else if (mode === "up") { R(ax - 1, sh - 9, 3, 11, o.shirt2); R(ax - 1, sh - 11, 3, 3, o.skin || o.skin) }
      else if (mode === "forward") { const len = 9; R(f > 0 ? ax : ax - len, sh + 4, len, 3, o.shirt2); R(f > 0 ? ax + len : ax - len - 2, sh + 4, 2, 3, o.skin) }
      else if (mode === "face") { R(ax - 1, sh - 2, 3, 6, o.shirt2); R(ax - 1 + f * 2, sh - 5, 3, 4, o.shirt2); R(ax + f * 3, sh - 8, 3, 3, o.skin) }
    }
    const near = f
    const far = -f
    arm(far, pose === "up" ? "up" : pose === "type" ? "forward" : "down")
    arm(near, pose === "up" ? "up" : pose === "phone" ? "face" : pose === "type" || pose === "reach" ? "forward" : "down")
    // head
    R(x - 4, headTop, headS, headS, o.skin)
    if (o.style === "spiky") { R(x - 5, headTop - 2, 11, 4, o.hair); [-4, -1, 2, 4].forEach((d) => R(x + d, headTop - 4, 2, 2, o.hair)) }
    else if (o.style === "short") { R(x - 5, headTop - 1, 11, 4, o.hair); R(x - 5, headTop + 3, 1, 3, o.hair); R(x + 5, headTop + 3, 1, 3, o.hair) }
    else { R(x - 5, headTop - 1, 11, 3, o.hair); R(x - 5, headTop + 2, 2, 4, o.hair); R(x + 4, headTop + 2, 2, 4, o.hair) }
    const blink = (t % 4) < 0.12
    const ey = headTop + 4
    if (!blink) { R(x - 3 + f, ey, 2, 2, P.dark); R(x + 1 + f, ey, 2, 2, P.dark) } else { R(x - 3 + f, ey + 1, 2, 1, P.dark); R(x + 1 + f, ey + 1, 2, 1, P.dark) }
    if (mood === "happy") { R(x - 2 + f, headTop + 7, 5, 1, P.dark); dot(x - 3 + f, headTop + 6, P.dark); dot(x + 3 + f, headTop + 6, P.dark) }
    else if (mood === "worry") { R(x - 1 + f, headTop + 7, 3, 1, P.dark); dot(x - 2 + f, headTop + 8, P.dark); dot(x + 2 + f, headTop + 8, P.dark) }
    else R(x - 1 + f, headTop + 7, 3, 1, P.dark)
    if (gl > 0) alpha(gl, () => { R(x - 4 + f, ey - 1, 4, 3, P.cyan); R(x + 1 + f, ey - 1, 4, 3, P.cyan); R(x + f, ey, 1, 1, P.cyan2); R(x - 5 + f, ey, 1, 1, P.cyan2); R(x + 5 + f, ey, 1, 1, P.cyan2) })
    if (pose === "phone") R(x + f * 8 - 2, headTop + 1, 4, 7, P.dark), R(x + f * 8 - 1, headTop + 2, 2, 5, P.cyan)
    return {headTop, torsoTop}
  }

  // ---- props -----------------------------------------------------------------------------------------------
  const TABLE_Y = 132
  const RAMP = {x0: 165, shallowDx: 36, shallowRise: 6, steepDx: 54, steepRise: 26, topX: 255, landing: 15}
  const rampH = (x) => {
    if (x <= RAMP.x0) return 0
    if (x <= RAMP.x0 + RAMP.shallowDx) return (x - RAMP.x0) / RAMP.shallowDx * RAMP.shallowRise
    if (x <= RAMP.topX) return RAMP.shallowRise + (x - RAMP.x0 - RAMP.shallowDx) / RAMP.steepDx * RAMP.steepRise
    return RAMP.shallowRise + RAMP.steepRise
  }
  const STALL_X = RAMP.x0 + RAMP.shallowDx // junction of the two sections
  const START_X = 138, END_X = 262
  function desk(kind, t) { // table with ramp
    R(112, TABLE_Y, 200, 8, P.wood); R(112, TABLE_Y + 8, 200, 2, P.wood2); R(120, TABLE_Y + 10, 5, 18, P.wood2); R(300, TABLE_Y + 10, 5, 18, P.wood2)
    for (let x = RAMP.x0; x <= RAMP.topX + RAMP.landing; x++) { const h = rampH(x); R(x, TABLE_Y - h, 1, h, kind === "C" ? P.wood : P.metal); R(x, TABLE_Y - h, 1, 1, P.white) }
    R(RAMP.topX, TABLE_Y - rampH(RAMP.topX) - 1, RAMP.landing + 1, 1, P.cyan)
  }
  function block(x, y, col, col2) { R(x, y, 6, 6, col); R(x, y + 4, 6, 2, col2); R(x + 1, y + 1, 2, 1, P.white) }
  function wheel(cx, cy, ang, spin) {
    R(cx - 2, cy - 3, 5, 7, P.dark); R(cx - 3, cy - 2, 7, 5, P.dark); R(cx - 2, cy - 2, 5, 5, "#33406b")
    const a = spin ? ang : 0
    dot(cx + Math.round(Math.cos(a) * 2), cy + Math.round(Math.sin(a) * 2), P.white); dot(cx, cy, P.cyan)
  }
  function rover(kind, x, ang, spin, mount) { // x = front wheel contact; body on slope; mount: "small"|"geared"
    const fx = x, rx = x - 14
    const fy = TABLE_Y - rampH(fx), ry = TABLE_Y - rampH(rx)
    for (let c = rx - 4; c <= fx + 4; c++) {
      const k = clamp((c - rx) / (fx - rx), -0.3, 1.3), by = ry + (fy - ry) * k
      R(c, by - 10, 1, 6, kind === "C" ? P.wood2 : P.white)
      if (kind === "C") R(c, by - 11, 1, 1, P.wood)
    }
    if (kind === "C") { const mx = rx + 6, my = ry + (fy - ry) * 0.45; R(mx - 3, my - 18, 11, 8, P.clay); R(mx - 5, my - 22, 15, 6, P.green); R(mx - 2, my - 25, 4, 4, P.green2); R(mx + 4, my - 24, 5, 5, P.green2) }
    wheel(rx, ry - 3, ang, spin); wheel(fx, fy - 3, ang, spin)
    const mx = rx + 5, my = ry + (fy - ry) * 0.35 - 15
    return {x: mx, y: my + 3, fy}
  }
  function drawBlockOnRover(pos, mount) { if (mount === "small") block(pos.x - 3, pos.y - 3, P.amber, P.amber2); else block(pos.x - 3, pos.y - 3, P.cyan, P.cyan2) }

  function shelf(t, sag, thick, potX) {
    const x0 = 196, x1 = 306, y0 = 92
    const brx = 214
    for (let x = x0; x <= x1; x++) { const k = (x - x0) / (x1 - x0), y = y0 + sag * k; R(x, y, 1, 4, P.wood); R(x, y, 1, 1, P.white) }
    R(x0 - 6, y0 - 12, 6, 70, P.gray) // wall rail
    if (thick) { line(brx, y0 + 4, brx, y0 + 40, P.cyan, 3); line(brx, y0 + 40, brx + 34, y0 + 4 + sag * 0.3, P.cyan, 3); R(brx - 2, y0 + 4, 40, 2, P.cyan2) }
    else { line(brx, y0 + 4, brx, y0 + 36, P.amber, 1); line(brx, y0 + 36, brx + 30, y0 + 4 + sag * 0.25, P.amber, 1) }
    const py = y0 + sag * ((potX - x0) / (x1 - x0)) - 11
    R(potX - 6, py + 2, 13, 9, P.clay); R(potX - 7, py, 15, 3, P.clay)
    R(potX - 5, py - 7, 3, 8, P.green); R(potX, py - 10, 3, 11, P.green2); R(potX + 4, py - 6, 3, 7, P.green)
    return {jointX: brx, jointY: y0 + 4, tipX: potX, tipY: py}
  }

  // ---- gadgets and HUD -------------------------------------------------------------------------------------
  function phoneIcon(x, y, c) { R(x + 3, y, 5, 10, c); R(x + 4, y + 1, 3, 7, P.ink) }
  function laptopIcon(x, y, c) { R(x + 1, y + 1, 9, 6, c); R(x + 2, y + 2, 7, 4, P.ink); R(x, y + 7, 11, 2, c) }
  function glassesIcon(x, y, c) { R(x, y + 2, 5, 4, c); R(x + 6, y + 2, 5, 4, c); R(x + 1, y + 3, 3, 2, P.ink); R(x + 7, y + 3, 3, 2, P.ink); R(x + 5, y + 3, 1, 1, c) }
  function deviceRail(active, t) {
    const ics = [phoneIcon, laptopIcon, glassesIcon]
    ics.forEach((fn, i) => {
      const x = 8 + i * 17, on = i === active
      R(x - 2, 6, 15, 15, on ? P.cyan : P.metal2); R(x - 1, 7, 13, 13, P.ink)
      fn(x, 9, on ? P.cyan : P.gray)
    })
  }
  function insetPhone(t) { // phone viewfinder: sees the problem, cannot say why
    R(8, 26, 60, 42, P.metal2); R(9, 27, 58, 40, P.ink)
    ;[[11, 29], [60, 29], [11, 60], [60, 60]].forEach(([cx, cy], i) => { R(cx, cy, 5, 1, P.cyan); R(cx, cy, 1, 5, P.cyan); R(cx + (i % 2 ? 0 : 4), cy + (i > 1 ? 0 : 4), 1, 1, P.ink) })
    R(24, 52, 28, 3, P.metal); line(30, 52, 44, 44, P.metal, 1); R(42, 47, 8, 4, P.white)
    bubble("ask", 54, 38, 0.5 + 0.5 * Math.sin(t * 4), P.red2)
  }
  function insetLaptop(t) { // chart that does not explain: a flat noisy line and a question mark
    R(8, 26, 60, 42, P.metal2); R(9, 27, 58, 40, P.ink); R(14, 32, 1, 30, P.gray); R(14, 62, 48, 1, P.gray)
    for (let x = 0; x < 44; x++) dot(16 + x, 47 + Math.round(Math.sin(x * 0.9 + Math.floor(t * 6)) * 1.2), P.cyan)
    bubble("ask", 54, 44, 0.5 + 0.5 * Math.sin(t * 4 + 1), P.red2)
  }
  function arFrame(a, t) { // the glasses view: cyan corner brackets and a faint scan line
    alpha(a, () => {
      ;[[4, 4, 1, 1], [W - 24, 4, -1, 1], [4, H - 6, 1, -1], [W - 24, H - 6, -1, -1]].forEach(([x, y, sx, sy]) => { R(x, y, 20, 2, P.cyan); R(sx > 0 ? x : x + 18, sy > 0 ? y : y - 18, 2, 20, P.cyan) })
      alpha(0.08, () => R(0, Math.round((t * 40) % H), W, 2, P.cyan))
    })
  }
  function beam(x0, y0, x1, y1, t) {
    const th = 2 + (Math.sin(t * 7) > 0 ? 1 : 0)
    line(x0, y0, x1, y1, P.red, th); line(x0, y0 - 1, x1, y1 - 1, P.red2, 1)
    R(x0 - 2, y0 - 2, 5, 5, P.red); R(x1 - 2, y1 - 2, 5, 5, P.red)
  }
  const SCALE_BAR = 3.8
  function chip(x, y, need, has, showMargin) {
    const w = 80
    x = Math.min(x, W - w - 8)
    R(x, y, w, 26, P.ink); R(x, y, w, 1, P.red); R(x, y + 25, w, 1, P.red); R(x, y, 1, 26, P.red); R(x + w - 1, y, 1, 26, P.red)
    R(x + 4, y + 5, Math.round(need * SCALE_BAR), 4, P.white); txt(need.toFixed(1), x + 8 + Math.round(need * SCALE_BAR), y + 4, P.white)
    R(x + 4, y + 15, Math.round(has * SCALE_BAR), 4, has >= need ? P.cyan : P.amber); txt(has.toFixed(1), x + 8 + Math.round(has * SCALE_BAR), y + 14, has >= need ? P.cyan : P.amber)
    if (showMargin) txt("2.1x", x + w - 20, y + 19, P.cyan)
  }
  function badge(a, x, y) { // proof: tick badge with margin
    if (a <= 0) return
    const k = ease(clamp(a)) * (1 + 0.12 * Math.sin(clamp(a) * 3.14))
    const w = Math.round(46 * k), h = Math.round(22 * k)
    R(x - w / 2, y - h / 2, w, h, P.ink); R(x - w / 2, y - h / 2, w, 1, P.cyan); R(x - w / 2, y + h / 2 - 1, w, 1, P.cyan); R(x - w / 2, y - h / 2, 1, h, P.cyan); R(x + w / 2 - 1, y - h / 2, 1, h, P.cyan)
    if (k > 0.9) { icon(ICON.tick, Math.round(x - w / 2 + 5), Math.round(y - 3), P.green); txt("2.1x", Math.round(x - 6), Math.round(y - 3), P.cyan) }
  }

  // ---- vignettes ---------------------------------------------------------------------------------------------
  const P1 = 3.8, P2 = 6.6, P3 = 9.4, SWAP0 = 12.6, SWAP1 = 14.0, RUN1 = 16.6
  function vignette(kind, who, lt, t) {
    const shelfKind = kind === "B"
    bg(kind, t)
    // phases for the character
    const phase = lt < P1 ? 0 : lt < P2 ? 1 : lt < P3 ? 2 : lt < SWAP0 ? 3 : lt < SWAP1 ? 4 : 5
    const failedAt = 2.6
    const mood = lt > 15.6 ? "happy" : lt > failedAt ? "worry" : "neutral"
    let pose = "down", f = 1, gl = 0
    if (phase === 1) pose = "phone"
    if (phase === 2) { pose = "type"; f = -1 }
    if (phase >= 3) gl = ease(seg(lt, P3, P3 + 0.8))
    if (phase === 3 && lt < P3 + 0.8) pose = "phone"
    if (phase === 4) pose = "reach"
    if (lt > 16.2) pose = "up"
    const charX = 98
    // laptop desk (left)
    R(26, 128, 50, 4, P.wood); R(30, 132, 4, 20, P.wood2); R(68, 132, 4, 20, P.wood2)
    R(36, 112, 24, 15, P.metal2); R(38, 114, 20, 11, P.ink); R(33, 127, 30, 2, P.metal)
    if (phase === 2) for (let i = 0; i < 18; i++) dot(40 + i, 120 + Math.round(Math.sin(i + Math.floor(t * 4)) * 1.2), P.cyan)
    if (phase !== 3 && phase !== 4 && phase !== 5) { /* glasses rest on the desk until put on */ glassesIcon(66, 122, P.cyan2) }

    let partPos = null, stall = null
    if (!shelfKind) {
      desk(kind, t)
      // tray with the geared block
      R(116, TABLE_Y - 2, 34, 2, P.metal2)
      const swapK = ease(seg(lt, SWAP0, SWAP1))
      let x = START_X, spin = false, ang = 0
      if (lt < 0.6) x = START_X
      else if (lt < SWAP0) { const a = ease(seg(lt, 0.6, 2.6)); x = lerp(START_X, STALL_X, a); spin = lt > 0.6 }
      else if (lt < SWAP1) { x = STALL_X; spin = true }
      else { x = lerp(START_X, END_X, ease(seg(lt, SWAP1 + 0.2, RUN1))); spin = lt < RUN1 }
      ang = t * (lt < SWAP1 ? 14 : 4)
      const shake = (lt > 2.6 && lt < SWAP0) ? Math.round(Math.sin(t * 40)) : 0
      const pos = rover(kind, x + shake * 0, ang, spin, lt < SWAP1 ? "small" : "geared")
      // blocks: small (amber) rides the rover until the swap; geared (cyan) sits in the tray until the swap
      const trayX = 122, trayY = TABLE_Y - 9
      if (lt < SWAP0) { drawBlockOnRover(pos, "small"); block(trayX + 14, trayY, P.cyan, P.cyan2) }
      else if (lt < SWAP1) {
        const a = swapK, arc = Math.sin(a * 3.14) * 12
        block(lerp(pos.x - 3, trayX, a), lerp(pos.y - 3, trayY, a) - arc, P.amber, P.amber2)
        block(lerp(trayX + 14, pos.x - 3, a), lerp(trayY, pos.y - 3, a) - arc, P.cyan, P.cyan2)
      } else { drawBlockOnRover(pos, "geared"); block(trayX, trayY, P.amber, P.amber2) }
      const poleBase = TABLE_Y - rampH(STALL_X)
      R(STALL_X + 1, poleBase - 24, 2, 24, P.red2); R(STALL_X + 1, poleBase - 26, 5, 3, P.red) // red stall marker pole
      partPos = pos; stall = {x: STALL_X + 3, y: poleBase - 25}
      if (lt > 2.7 && lt < SWAP0) { const p0 = pos.fy; bubble("bang", pos.x, pos.y - 14, seg(lt, 2.7, 3.1), P.red) }
    } else {
      const sag = lt < 0.8 ? 0 : lt < 2.8 ? ease(seg(lt, 0.8, 2.8)) * 9 : lt < SWAP1 ? 9 : lerp(9, 0, ease(seg(lt, SWAP1, SWAP1 + 0.9)))
      const thick = lt >= SWAP1 - 0.2
      const potX = lt < 2.8 ? lerp(262, 282, ease(seg(lt, 0.8, 2.8))) : lt < SWAP1 ? 282 : lerp(282, 258, ease(seg(lt, SWAP1 + 0.2, SWAP1 + 1.6)))
      // tray on the floor with the thick bracket until it flies up
      R(116, TABLE_Y + 8, 40, 3, P.metal2)
      const a = ease(seg(lt, SWAP0, SWAP1)), arc = Math.sin(a * 3.14) * 14
      if (lt < SWAP0) { line(128, TABLE_Y + 6, 128, TABLE_Y - 10, P.cyan, 3); line(128, TABLE_Y - 10, 148, TABLE_Y + 6, P.cyan, 3) }
      else if (lt < SWAP1) { const bx = lerp(128, 214, a), by = lerp(TABLE_Y - 10, 96, a) - arc; line(bx, by, bx, by + 24, P.cyan, 3); line(bx, by + 24, bx + 20, by, P.cyan, 3); line(214 - 0, 96 + 0, 214, 130, P.amber, 1) }
      const info = shelf(t, sag, lt >= SWAP1 - 0.2 && lt >= SWAP1, potX)
      partPos = {x: 214, y: 112}; stall = {x: 244, y: 92 + sag * 0.45 + 2}
      if (lt > 2.9 && lt < SWAP0) bubble("bang", info.tipX, info.tipY - 14, seg(lt, 2.9, 3.3), P.red)
      if (lt >= SWAP0 && lt < SWAP1) { /* old thin bracket stays drawn by shelf() until swap ends */ }
    }
    // character, devices
    person(who, phase === 2 ? 92 : charX, 168, f, pose, mood, gl, t)
    deviceRail(phase === 1 ? 0 : phase === 2 ? 1 : phase >= 3 && lt < RUN1 ? 2 : -1, t)
    if (phase === 1) insetPhone(t)
    if (phase === 2) insetLaptop(t)
    // glasses view: frame, beam, evidence
    const arOn = lt >= P3 + 0.8 && lt < RUN1 + 0.6
    if (arOn) {
      const a = seg(lt, P3 + 0.8, P3 + 1.4) * (lt > RUN1 ? 1 - seg(lt, RUN1, RUN1 + 0.6) : 1)
      arFrame(a, t)
      if (lt < SWAP0) {
        const ev = seg(lt, P3 + 1.6, P3 + 2.0)
        if (ev > 0) alpha(ev, () => { beam(stall.x, stall.y, partPos.x, partPos.y, t); chip(stall.x + 12, stall.y - 46, 7.9, 4.0, false) })
      }
    }
    if (lt > SWAP1 + 1.4) badge(seg(lt, RUN1 - 0.6, RUN1 + 0.1), shelfKind ? 262 : 262, shelfKind ? 70 : 78)
    if (lt >= SWAP1 + 1.4 && lt < RUN1 + 1) alpha(0.9, () => chip(188, 40, 7.9, 17.0, true))
  }

  // ---- other scenes ----------------------------------------------------------------------------------------
  function sky(t, a) {
    R(0, 0, W, H, P.night)
    STARS.forEach((s) => { const on = Math.sin(t * s.s + s.p) > -0.2; if (on) dot(s.x, s.y, s.s > 1.4 ? P.white : P.gray) })
    return a
  }
  function intro(lt, t) {
    sky(t, 1)
    const a = ease(seg(lt, 0.4, 1.4)) * (1 - ease(seg(lt, 2.4, 3)))
    alpha(a, () => { glassesIcon(150, 82, P.cyan); R(144, 80, 1, 1, P.cyan); const g = Math.sin(t * 3) > 0.7 ? P.white : P.cyan; dot(160, 78, g) })
  }
  function concept(lt, t) { // stylised glasses-view concept: the stalled course seen through a visor
    R(0, 0, W, H, P.ink)
    const sway = Math.round(Math.sin(t * 1.2) * 2)
    ctx.save()
    ctx.beginPath(); ctx.roundRect(24, 22, 272, 136, 40); ctx.clip()
    ctx.translate(sway, 0)
    bg("A", t); desk("A", t)
    const pos = rover("A", STALL_X, t * 14, true, "small"); drawBlockOnRover(pos, "small")
    const poleBase = TABLE_Y - rampH(STALL_X)
    R(STALL_X + 1, poleBase - 24, 2, 24, P.red2); R(STALL_X + 1, poleBase - 26, 5, 3, P.red)
    const st = {x: STALL_X + 3, y: poleBase - 25}
    beam(st.x, st.y, pos.x, pos.y, t); chip(st.x + 12, st.y - 30, 7.9, 4.0, false)
    ctx.restore()
    ctx.strokeStyle = P.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(24, 22, 272, 136, 40); ctx.stroke()
    alpha(0.15, () => R(24, Math.round(22 + ((t * 30) % 136)), 272, 2, P.cyan))
  }
  function endScene(lt, t) {
    sky(t, 1)
    const people = [["teen", 80, "A"], ["mill", 160, "B"], ["elder", 240, "C"]]
    people.forEach(([who, x], i) => {
      const k = ease(seg(lt, 0.4 + i * 0.4, 1.2 + i * 0.4))
      if (k <= 0) return
      R(x - 22, 140, 44, 4, P.wood)
      alpha(k, () => { person(who, x, 140, 1, i === 1 ? "up" : "down", "happy", 1, t + i); badge(k, x, 78) })
    })
  }

  // ---- seek ------------------------------------------------------------------------------------------------------
  function renderAt(t) {
    ctx.clearRect(0, 0, W, H)
    if (t < T.intro[1]) intro(t - T.intro[0], t)
    else if (t < T.A[0] + VIG) vignette("A", "teen", t - T.A[0], t)
    else if (t < T.B[0] + VIG) vignette("B", "mill", t - T.B[0], t)
    else if (t < T.C[0] + VIG) vignette("C", "elder", t - T.C[0], t)
    else if (t >= T.concept[0] && t < T.concept[1]) concept(t - T.concept[0], t)
    else if (t >= T.end[0]) endScene(t - T.end[0], t)
    else R(0, 0, W, H, P.ink) // the real footage layer covers this span
  }
  window.addEventListener("hf-seek", (e) => renderAt(e.detail.time))
  renderAt(0)
  window.__film = {renderAt}
})()
