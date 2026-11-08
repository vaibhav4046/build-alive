// BUILD ALIVE ("Walk inside what AI is building") — Deterministic 154s Spatial AI Observatory Film Engine
// Pure function of time t (seconds): zero Date.now(), zero Math.random(), zero blank frames, zero ramp-toy filler.
// Renders on a 960x540 high-DPI canvas scaled 2x to 1920x1080.
(() => {
  "use strict"
  const W = 960, H = 540
  const cv = document.getElementById("px")
  const ctx = cv.getContext("2d")

  const T = (window.FILM_T = {
    intro: [0, 3],
    act1A: [3, 14],    // Terminal Scroll Flood
    act1B: [14, 25],   // Invisible Cross-Module Blast Radius
    act1C: [25, 36],   // Blind Shell Prompt vs Putting on Spectacles
    act2A: [36, 56],   // 3D Architecture City, 3 Project Islands & Neural Dependency Bridges
    act2B: [56, 80],   // Multi-Agent Vessels (Antigravity + Judge), File Edit Pulse & Causal Fault Beam
    act2C: [80, 104],  // 4D Rewind Crystal Scrubbing, Side-by-Side AST Diff & Socratic Learning Atelier
    act2D: [104, 128], // Cryptographic Safe Action Gate (SHA-256 Nonce) & City-Wide Emerald Repair
    act3: [128, 142],  // Live Windows Multi-Agent Bridge Telemetry (84 Antigravity + 4 Claude + Codex)
    end: [142, 154],   // End Card + 3D Observatory Halo
    total: 154,
  })

  const P = {
    bg: "#060a14",
    bg2: "#0b1224",
    panel: "rgba(10, 17, 34, 0.90)",
    panelDark: "rgba(5, 9, 18, 0.94)",
    shelf: "#121a2e",
    shelfEdge: "#263861",
    cyan: "#47ebff",
    cyanDim: "rgba(71, 235, 255, 0.22)",
    mint: "#3df5ad",
    mintDim: "rgba(61, 245, 173, 0.22)",
    amber: "#ffc83d",
    amberDim: "rgba(255, 200, 61, 0.24)",
    coral: "#ff5c52",
    coralDim: "rgba(255, 92, 82, 0.26)",
    violet: "#c28aff",
    violetDim: "rgba(194, 138, 255, 0.24)",
    slate: "#23304c",
    slateLight: "#3b4f7a",
    white: "#f4f7ff",
    muted: "#95a5c6",
    dim: "#546484",
  }

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
  const seg = (t, a, b) => clamp((t - a) / (b - a))
  const ease = (t) => t * t * (3 - 2 * t)
  const lerp = (a, b, t) => a + (b - a) * t

  // ---- Low-level drawing helpers ---------------------------------------------------------------------------
  function box(x, y, w, h, fill, stroke, lw = 1.5, r = 6) {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    if (fill) {
      ctx.fillStyle = fill
      ctx.fill()
    }
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = lw
      ctx.stroke()
    }
  }

  function text(str, x, y, size = 13, color = P.white, align = "left", weight = "600") {
    ctx.font = `${weight} ${size}px Consolas, "Space Mono", monospace`
    ctx.fillStyle = color
    ctx.textAlign = align
    ctx.textBaseline = "middle"
    ctx.fillText(str, x, y)
  }

  function glowLine(x0, y0, x1, y1, color, width = 2.5, glow = 10, dash = null) {
    ctx.save()
    if (dash) ctx.setLineDash(dash)
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.shadowColor = color
    ctx.shadowBlur = glow
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    ctx.restore()
  }

  function drawGridBackground(t, horizonY = 148) {
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, "#050811")
    grad.addColorStop(0.55, "#091124")
    grad.addColorStop(1, "#060b17")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Subtle spatial depth grid
    ctx.strokeStyle = "rgba(71, 235, 255, 0.055)"
    ctx.lineWidth = 1
    for (let x = -320; x <= W + 320; x += 64) {
      ctx.beginPath()
      ctx.moveTo(W / 2 + (x - W / 2) * 0.28, horizonY)
      ctx.lineTo(x, H)
      ctx.stroke()
    }
    const shift = (t * 18) % 28
    for (let y = horizonY; y < H; y += 28) {
      const yy = y + shift * ((y - horizonY) / (H - horizonY))
      ctx.beginPath()
      ctx.moveTo(0, yy)
      ctx.lineTo(W, yy)
      ctx.stroke()
    }
  }

  // ---- 3D Isometric / Perspective Projection for BUILD ALIVE Desk Workbench -------------------------------
  // Maps actual BuildAliveLayout.ts desk coordinates (x in [-34..34], y in [-30..10], z in [-84..-56])
  // onto the 960x540 viewport with gentle camera orbit so the user sees deep inside the 3D architecture.
  function project3D(xCm, yCm, zCm, camYaw = 0, camPitch = 0.44) {
    const relZ = zCm - (-70) // centered around DeskShelf z = -70 cm
    const relY = yCm - (-22)
    const cosY = Math.cos(camYaw), sinY = Math.sin(camYaw)
    const rx = xCm * cosY - relZ * sinY
    const rz = xCm * sinY + relZ * cosY
    const depth = 98 + rz * 0.85
    const scale = 640 / Math.max(38, depth)
    const sx = 312 + rx * scale * 1.08
    const sy = 292 - (relY * Math.cos(camPitch) - rz * Math.sin(camPitch)) * scale * 1.05
    return { x: sx, y: sy, s: scale }
  }

  function drawPrism3D(xCm, yCm, zCm, wCm, hCm, dCm, topCol, sideCol, edgeCol, camYaw, pulse = 1) {
    const hw = (wCm * pulse) / 2
    const hh = (hCm * pulse) / 2
    const hd = (dCm * pulse) / 2
    const p = (dx, dy, dz) => project3D(xCm + dx, yCm + dy, zCm + dz, camYaw)

    const topFL = p(-hw, hh, hd), topFR = p(hw, hh, hd), topBR = p(hw, hh, -hd), topBL = p(-hw, hh, -hd)
    const botFL = p(-hw, -hh, hd), botFR = p(hw, -hh, hd), botBR = p(hw, -hh, -hd)

    // Front face
    ctx.beginPath()
    ctx.moveTo(topFL.x, topFL.y); ctx.lineTo(topFR.x, topFR.y)
    ctx.lineTo(botFR.x, botFR.y); ctx.lineTo(botFL.x, botFL.y); ctx.closePath()
    ctx.fillStyle = sideCol; ctx.fill()
    ctx.strokeStyle = edgeCol; ctx.lineWidth = 1.4; ctx.stroke()

    // Right face
    ctx.beginPath()
    ctx.moveTo(topFR.x, topFR.y); ctx.lineTo(topBR.x, topBR.y)
    ctx.lineTo(botBR.x, botBR.y); ctx.lineTo(botFR.x, botFR.y); ctx.closePath()
    ctx.fillStyle = sideCol; ctx.fill()
    ctx.strokeStyle = edgeCol; ctx.lineWidth = 1.2; ctx.stroke()

    // Top face
    ctx.beginPath()
    ctx.moveTo(topFL.x, topFL.y); ctx.lineTo(topFR.x, topFR.y)
    ctx.lineTo(topBR.x, topBR.y); ctx.lineTo(topBL.x, topBL.y); ctx.closePath()
    ctx.fillStyle = topCol; ctx.fill()
    ctx.strokeStyle = edgeCol; ctx.lineWidth = 1.6; ctx.stroke()

    return { topCenter: p(0, hh, 0), center: p(0, 0, 0) }
  }

  // Exact 6 modules from BuildAliveLayout.ts (spaced clearly in 3D depth for zero badge overlap)
  const MODULES = [
    { id: "client-ui", label: "UI:Client", file: "client/ui.tsx", x: -15, y: -21.0, z: -64, w: 6.2, h: 4.2, d: 5.0 },
    { id: "server-lobby", label: "Logic:Lobby", file: "server/lobby.ts", x: 0, y: -21.0, z: -64, w: 6.6, h: 4.8, d: 5.0 },
    { id: "ws-gateway", label: "API:WS", file: "server/ws.ts", x: 15, y: -21.0, z: -64, w: 6.2, h: 4.2, d: 5.0 },
    { id: "state-store", label: "Data:State", file: "state/store.ts", x: -15, y: -17.5, z: -80, w: 6.2, h: 5.0, d: 5.0 },
    { id: "db-schema", label: "Assets:DB", file: "db/schema.sql", x: 0, y: -17.5, z: -80, w: 6.2, h: 5.0, d: 5.0 },
    { id: "test-suite", label: "Tests:Room03", file: "tests/room.test.ts", x: 15, y: -17.5, z: -80, w: 6.5, h: 5.0, d: 5.0 },
  ]

  const BRIDGES = [
    ["client-ui", "server-lobby", "joinRoom()"],
    ["server-lobby", "ws-gateway", "broadcastState()"],
    ["server-lobby", "state-store", "mutateRoom()"],
    ["state-store", "db-schema", "persistSnapshot()"],
    ["ws-gateway", "test-suite", "assertCapacity(4)"],
  ]

  const ISLANDS = [
    { id: "lobby-sync", label: "Island 1: LobbySync", x: -25, y: -21.8, z: -64, col: P.cyan },
    { id: "edge-guard", label: "Island 2: EdgeGuard", x: -25, y: -21.8, z: -73, col: P.violet },
    { id: "earthproof-rover", label: "Island 3: Rover Sim", x: -25, y: -21.8, z: -82, col: P.mint },
  ]

  const RAIL = [
    { id: "Step", x: -24, z: -59, col: P.cyan },
    { id: "Inspect", x: -12, z: -59, col: P.white },
    { id: "Learn", x: 0, z: -59, col: P.violet },
    { id: "Approve", x: 12, z: -59, col: P.mint },
    { id: "Reset", x: 24, z: -59, col: P.amber },
  ]

  // ---- Intro (0..3s): Spectacles Optical Boot & Live Multi-Agent Lock --------------------------------------
  function renderIntro(lt, t) {
    drawGridBackground(t, 180)
    const k = ease(seg(lt, 0.1, 1.4))
    ctx.save()
    ctx.globalAlpha = k

    // Spectacles Dual Waveguide Frame
    box(170, 95, 280, 190, "rgba(71, 235, 255, 0.06)", P.cyan, 3, 38)
    box(510, 95, 280, 190, "rgba(71, 235, 255, 0.06)", P.cyan, 3, 38)
    glowLine(450, 175, 510, 175, P.cyan, 4, 12)

    text("SNAP SPECTACLES AR • 36.6° VERTICAL FOV", W / 2, 56, 15, P.cyan, "center", "700")
    text("BUILD ALIVE", W / 2, 345, 54, P.white, "center", "700")
    text("WALK INSIDE WHAT YOUR LLM & CODING AGENTS ARE BUILDING", W / 2, 392, 17, P.mint, "center", "700")
    text("LIVE BRIDGE: ANTIGRAVITY (84 SESSIONS) • CLAUDE CODE (4) • CODEX • 127.0.0.1:8787", W / 2, 430, 13, P.amber, "center")
    ctx.restore()
  }

  // ---- Act I (3..36s): Why 2D Flat Screens Fail for Multi-Agent LLM Engineering ----------------------------
  function renderAct1(t) {
    drawGridBackground(t, 220)

    // Top Header Banner
    box(36, 20, W - 72, 42, P.panelDark, P.coral, 1.5, 6)
    text("THE 2D TERMINAL BLINDFOLD • WHY FLAT LOGS FAIL WHEN AI AGENTS WRITE SOFTWARE", 56, 41, 14, P.coral, "left", "700")
    text(`T+${t.toFixed(1)}s`, W - 56, 41, 13, P.muted, "right")

    if (t < T.act1A[1]) {
      // Scene 1A (3..14s): Terminal Scroll Flood
      const lt = t - T.act1A[0]
      box(48, 78, 560, 390, P.panelDark, P.slateLight, 2, 8)
      box(48, 78, 560, 30, "#141e36", null, 0, 8)
      text("zsh — claude-code / antigravity-agent (214 lines/sec)", 68, 93, 12, P.muted)

      const logs = [
        "[antigravity #809] tool_call: read_file(server/lobby.ts, lines 1..140)",
        "[claude-code #412] subagent_spawned: researcher -> scanning 48 imports",
        "[antigravity #810] tool_call: edit_file(server/lobby.ts) +14/-12 lines",
        "[codex-exec  #104] applying AST patch: room capacity guard",
        "  - if (room.players.length > MAX_PLAYERS) return reject()",
        "  + if (room.players.length >= 4) return false // <-- OFF-BY-ONE MUTATION!",
        "[antigravity #811] tool_call: edit_file(server/ws-gateway.ts)",
        "[antigravity #812] tool_call: write_file(state/store.ts)",
        "[claude-code #415] streaming 1,840 tokens of chain-of-thought...",
        "[antigravity #813] tool_call: run_command(npm test --silent)",
        "[ws-gateway  #814] broadcastState() desync on player #4 join",
        "[test-runner #815] FAIL tests/room-capacity.test.mjs (expected 4, got 3)",
      ]
      const scrollOffset = Math.floor(lt * 6)
      for (let i = 0; i < 11; i++) {
        const idx = (i + scrollOffset) % logs.length
        const lineStr = logs[idx]
        const isBug = lineStr.includes("OFF-BY-ONE") || lineStr.includes("FAIL")
        const y = 128 + i * 30
        if (isBug) box(58, y - 11, 540, 22, P.coralDim, P.coral, 1, 4)
        text(lineStr, 66, y, 12, isBug ? P.coral : P.white)
      }

      // Right diagnosis card
      box(632, 78, 280, 390, P.panel, P.coral, 2, 8)
      text("FAILURE MODE #1", 654, 112, 13, P.coral, "left", "700")
      text("SCROLL FLOOD", 654, 138, 24, P.white, "left", "700")
      text("4 parallel LLM agents emit", 654, 182, 13, P.muted)
      text("hundreds of tool calls/min.", 654, 202, 13, P.muted)
      text("A subtle `>= 4` off-by-one", 654, 238, 13, P.amber)
      text("mutation in `server/lobby.ts`", 654, 258, 13, P.amber)
      text("scrolls off-screen in 0.4s.", 654, 278, 13, P.amber)
      box(654, 320, 236, 118, "rgba(255, 92, 82, 0.12)", P.coral, 1.5, 6)
      text("HUMAN COMPREHENSION:", 670, 348, 12, P.coral, "left", "700")
      text("0% spatial awareness", 670, 374, 15, P.white, "left", "700")
      text("No causal link to test-room-03", 670, 400, 12, P.muted)
    } else if (t < T.act1B[1]) {
      // Scene 1B (14..25s): Invisible Cross-Module Blast Radius
      const lt = t - T.act1B[0]
      box(48, 78, 560, 390, P.panelDark, P.amber, 2, 8)
      text("2D IDE VIEW: ONLY 1 TAB VISIBLE AT A TIME (`server/lobby.ts`)", 68, 106, 13, P.amber, "left", "700")

      // Draw 1 open tab vs 5 hidden broken modules in shadow
      box(68, 128, 250, 310, "#101930", P.cyan, 1.5, 6)
      text("OPEN TAB: server/lobby.ts", 84, 152, 12, P.cyan, "left", "700")
      text("export function canJoin(r) {", 84, 186, 12, P.white)
      text("  // LLM edited line 42:", 84, 210, 12, P.muted)
      box(80, 224, 226, 26, P.amberDim, P.amber, 1, 4)
      text("  if (r.players >= 4) return false", 86, 237, 11, P.amber)
      text("  return true;", 84, 268, 12, P.white)
      text("}", 84, 290, 12, P.white)
      text("Looks harmless locally...", 84, 340, 12, P.mint)

      // Hidden blast radius on right half of left panel
      const hidden = [
        { name: "server/ws-gateway.ts", status: "DESYNC: broadcast dropped", y: 145 },
        { name: "state/store.ts", status: "STALE: slot #4 orphaned", y: 215 },
        { name: "client/ui.tsx", status: "FROZEN: spinner locked", y: 285 },
        { name: "tests/room-capacity.test.mjs", status: "FAIL: test-room-03", y: 355 },
      ]
      hidden.forEach((h, i) => {
        const a = ease(seg(lt, 0.8 + i * 0.7, 1.6 + i * 0.7))
        ctx.save()
        ctx.globalAlpha = 0.25 + 0.75 * a
        box(348, h.y, 240, 54, P.coralDim, P.coral, 1.5, 6)
        text(h.name, 362, h.y + 18, 12, P.white, "left", "700")
        text(h.status, 362, h.y + 38, 11, P.coral)
        glowLine(318, 237, 348, h.y + 27, P.coral, 2, 8, [4, 4])
        ctx.restore()
      })

      box(632, 78, 280, 390, P.panel, P.amber, 2, 8)
      text("FAILURE MODE #2", 654, 112, 13, P.amber, "left", "700")
      text("HIDDEN BLAST RADIUS", 654, 138, 21, P.white, "left", "700")
      text("A 1-line edit in `server/lobby`", 654, 182, 13, P.muted)
      text("silently cascades across", 654, 202, 13, P.muted)
      text("4 downstream modules.", 654, 222, 13, P.muted)
      text("In a flat editor, the causal", 654, 260, 13, P.white)
      text("dependency graph is invisible.", 654, 280, 13, P.white)
      box(654, 320, 236, 118, P.amberDim, P.amber, 1.5, 6)
      text("WHAT YOU NEED:", 670, 348, 12, P.amber, "left", "700")
      text("See all 6 modules, live diffs,", 670, 374, 13, P.white)
      text("& causal beams in 3D space.", 670, 396, 13, P.cyan)
    } else {
      // Scene 1C (25..36s): Blind Auto-Run Risk -> Transition to Snap Spectacles
      const lt = t - T.act1C[0]
      box(48, 78, 420, 390, P.panelDark, P.coral, 2, 8)
      text("FAILURE MODE #3: BLIND AUTO-RUN", 68, 112, 14, P.coral, "left", "700")
      box(68, 145, 380, 130, "rgba(255, 92, 82, 0.14)", P.coral, 2, 6)
      text("AGENT REQUESTS SHELL EXECUTION:", 86, 174, 12, P.coral, "left", "700")
      text("$ rm -rf ./dist && npm test --force", 86, 204, 13, P.white, "left", "700")
      text("[Auto-Approve in 2s?]  (y/N)", 86, 238, 13, P.amber)
      text("Approving blind terminal prompts risks", 68, 315, 13, P.muted)
      text("unverified state & arbitrary shell ops.", 68, 337, 13, P.muted)

      // Right side: Putting on Snap Spectacles -> BUILD ALIVE Spatial Transition
      const k = ease(seg(lt, 1.5, 4.0))
      box(492, 78, 420, 390, P.panel, P.cyan, 2.5, 8)
      text("THE SOLUTION: PUT ON SNAP SPECTACLES", 514, 112, 14, P.cyan, "left", "700")
      text("BUILD ALIVE SPATIAL WORKBENCH", 514, 140, 20, P.white, "left", "700")

      // Mini 3D preview inside the right card
      ctx.save()
      ctx.beginPath(); ctx.roundRect(512, 165, 380, 210, 8); ctx.clip()
      box(512, 165, 380, 210, "#071022", P.cyan, 1.5, 8)
      for (let i = 0; i < 6; i++) {
        const mx = 560 + (i % 3) * 115
        const my = 225 + Math.floor(i / 3) * 85
        const col = i === 1 ? P.amber : i === 5 ? P.coral : P.mint
        box(mx, my, 82, 46, "rgba(18, 28, 52, 0.9)", col, 2, 5)
        text(MODULES[i].label, mx + 41, my + 23, 11, col, "center", "700")
      }
      glowLine(658, 248, 831, 310, P.coral, 3, 10)
      ctx.restore()

      text("• 6 Volumetric Modules + 5 Dependency Bridges", 514, 400, 12, P.mint)
      text("• 4D Rewind Crystal + Cryptographic Action Gate", 514, 422, 12, P.cyan)
      text(`• Optical Lock: ${(k * 100).toFixed(0)}% ENGAGED`, 514, 444, 12, P.amber, "left", "700")
    }
  }

  // ---- Act II (36..128s): Deep Inside BUILD ALIVE 3D Workbench in Spectacles Preview -----------------------
  function renderAct2(t) {
    drawGridBackground(t, 128)
    const camYaw = Math.sin((t - 36) * 0.16) * 0.14

    //Determine exact phase & state from time t
    let phaseTitle = "PHASE 1 • 3D ARCHITECTURE CITY & NEURAL DEPENDENCY BRIDGES"
    let modeBadge = "LIVE_VERIFIED • OVERVIEW"
    let cursorSeq = 1
    let editedLobby = false
    let failedRoom03 = false
    let showSubagent = false
    let showCausalBeam = false
    let selectedMod = null
    let learningMode = false
    let predictionSolved = false
    let approvalStage = 0 // 0=none, 1=staged, 2=pinching, 3=repaired
    let repairedAll = false

    if (t < T.act2A[1]) {
      // 36..56s: Architecture City & Bridges
      const lt = t - T.act2A[0]
      cursorSeq = lt < 8 ? 0 : 1
      selectedMod = lt > 12 ? "client-ui" : null
    } else if (t < T.act2B[1]) {
      // 56..80s: Multi-Agent Vessels, File Edit Pulse & Causal Fault Beam
      const lt = t - T.act2B[0]
      phaseTitle = "PHASE 2 • MULTI-AGENT VESSELS, AST EDIT PULSE & CAUSAL FAULT BEAM"
      editedLobby = true
      cursorSeq = lt < 6 ? 2 : lt < 14 ? 3 : 4
      failedRoom03 = lt >= 6
      showCausalBeam = lt >= 9
      showSubagent = lt >= 13
      modeBadge = failedRoom03 ? "LIVE_VERIFIED • ERROR TRACE" : "LIVE_VERIFIED • AST EDIT"
      selectedMod = lt >= 16 ? "server-lobby" : null
    } else if (t < T.act2C[1]) {
      // 80..104s: 4D Rewind Crystal Diff Scrubbing & Socratic Learning Atelier
      const lt = t - T.act2C[0]
      phaseTitle = "PHASE 3 • 4D REWIND CRYSTAL DIFF SCRUBBING & LEARNING ATELIER"
      editedLobby = true
      failedRoom03 = true
      showCausalBeam = true
      showSubagent = true
      selectedMod = "server-lobby"
      if (lt < 11) {
        cursorSeq = lt < 5 ? 2 : 3
        modeBadge = `4D REWIND SCRUB • SEQ #${cursorSeq}`
      } else {
        learningMode = true
        predictionSolved = lt >= 17.5
        cursorSeq = 4
        modeBadge = "LEARNING ATELIER • BLAST-RADIUS PREDICTION"
      }
    } else {
      // 104..128s: Cryptographic Safe Action Gate & City-Wide Repair
      const lt = t - T.act2D[0]
      phaseTitle = "PHASE 4 • CRYPTOGRAPHIC ACTION GATE (SHA-256) & CITY-WIDE REPAIR"
      showSubagent = true
      if (lt < 8) {
        editedLobby = true
        failedRoom03 = true
        showCausalBeam = true
        approvalStage = 1
        cursorSeq = 4
        modeBadge = "APPROVAL_PENDING • NONCE 8f4a9c02"
      } else if (lt < 13) {
        editedLobby = true
        failedRoom03 = true
        showCausalBeam = true
        approvalStage = 2
        cursorSeq = 5
        modeBadge = "SIGNING RECEIPT • CONFIRM_PINCH_APPROVE"
      } else {
        repairedAll = true
        approvalStage = 3
        cursorSeq = 6
        modeBadge = "VERIFIED PASS 12/12 • ALL DISTRICTS HEALTHY"
      }
    }

    // 1. Spectacles Optical HUD Top Bar & Provenance Banner (F01) — Clean non-overlapping columns
    box(24, 14, W - 48, 36, P.panelDark, P.cyan, 1.5, 6)
    text("SPECTACLES AR PREVIEW", 38, 32, 12, P.cyan, "left", "700")
    text(phaseTitle, 465, 32, 11.5, P.white, "center", "700")
    text(modeBadge, W - 38, 32, 11.5, failedRoom03 ? P.coral : repairedAll ? P.mint : P.amber, "right", "700")

    // 2. 3D DeskShelf Base (DESK_CENTER: 0, -24, -70; DESK_SIZE: 66 x 1.6 x 28)
    drawPrism3D(0, -24.5, -70, 68, 1.6, 30, "rgba(18, 28, 52, 0.86)", "#0d1528", P.shelfEdge, camYaw)

    // 3. 3 Project Islands on Left Flank
    ISLANDS.forEach((isl, idx) => {
      const active = idx === 0
      const p = drawPrism3D(
        isl.x, isl.y, isl.z, 9.5, 2.0, 6.2,
        active ? "rgba(71, 235, 255, 0.25)" : "rgba(35, 48, 76, 0.65)",
        "#101a33",
        active ? isl.col : P.slateLight,
        camYaw
      )
      text(isl.label, p.topCenter.x, p.topCenter.y - 8, 10, active ? isl.col : P.muted, "center", "700")
    })

    // 4. 5 Neural Dependency Bridges + Flowing AST Token Packets
    const modMap = {}
    MODULES.forEach((m) => { modMap[m.id] = m })

    BRIDGES.forEach(([fromId, toId, callSig], bIdx) => {
      const mA = modMap[fromId], mB = modMap[toId]
      const pA = project3D(mA.x, mA.y + 0.5, mA.z, camYaw)
      const pB = project3D(mB.x, mB.y + 0.5, mB.z, camYaw)
      const isFaultBridge = failedRoom03 && ((fromId === "server-lobby" && toId === "ws-gateway") || (fromId === "ws-gateway" && toId === "test-suite"))
      const bCol = isFaultBridge ? P.coral : repairedAll ? P.mint : P.cyan
      glowLine(pA.x, pA.y, pB.x, pB.y, bCol, isFaultBridge ? 3.2 : 2.0, isFaultBridge ? 12 : 6)

      // Flowing token packet along bridge
      const u = (t * 0.85 + bIdx * 0.21) % 1
      const px = lerp(pA.x, pB.x, u)
      const py = lerp(pA.y, pB.y, u)
      ctx.beginPath()
      ctx.arc(px, py, 4.2, 0, Math.PI * 2)
      ctx.fillStyle = P.white
      ctx.shadowColor = bCol
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.shadowBlur = 0

      if (t < T.act2A[1] || isFaultBridge) {
        text(callSig, (pA.x + pB.x) / 2, (pA.y + pB.y) / 2 - 8, 9.5, bCol, "center", "700")
      }
    })

    // 5. 6 Architecture City Modules (3x2 District Grid)
    const modScreen = {}
    MODULES.forEach((m) => {
      const isFail = failedRoom03 && m.id === "test-suite"
      const isEdit = editedLobby && m.id === "server-lobby" && !repairedAll
      const isSel = selectedMod === m.id
      const lift = isSel ? 1.15 : 1.0
      const topCol = isFail ? P.coralDim : isEdit ? P.amberDim : P.mintDim
      const edgeCol = isFail ? P.coral : isEdit ? P.amber : P.mint
      const prefix = isFail ? "[FAIL]" : isEdit ? "[CHG]" : "[PASS]"

      const proj = drawPrism3D(m.x, m.y, m.z, m.w, m.h, m.d, topCol, "#131f3a", edgeCol, camYaw, lift)
      modScreen[m.id] = proj

      // Floating 3D Badge above module
      const bx = proj.topCenter.x, by = proj.topCenter.y - 14
      box(bx - 54, by - 11, 108, 20, P.panelDark, edgeCol, 1.2, 4)
      text(`${prefix} ${m.label}`, bx, by, 10, edgeCol, "center", "700")
      text(m.file, bx, proj.center.y + 10, 9, P.white, "center")
    })

    // 6. FaultMarker_Room03 & Causal Fault Laser Beam
    if (failedRoom03) {
      const fm = drawPrism3D(23.5, -14.5, -80, 2.6, 5.2, 2.6, P.coralDim, "#4a1218", P.coral, camYaw, 1 + 0.08 * Math.sin(t * 6))
      box(fm.topCenter.x - 58, fm.topCenter.y - 26, 116, 19, P.panelDark, P.coral, 1.5, 4)
      text("[FAIL] test-room-03", fm.topCenter.x, fm.topCenter.y - 16, 10, P.coral, "center", "700")
    }

    if (showCausalBeam) {
      const pFail = modScreen["test-suite"].topCenter
      const pApi = modScreen["ws-gateway"].topCenter
      const pLobby = modScreen["server-lobby"].topCenter
      const pulseW = 3.5 + 1.2 * Math.sin(t * 7)
      glowLine(pFail.x, pFail.y, pApi.x, pApi.y, P.coral, pulseW, 16)
      glowLine(pApi.x, pApi.y, pLobby.x, pLobby.y, P.coral, pulseW, 16)
      box((pFail.x + pLobby.x) / 2 - 96, (pFail.y + pLobby.y) / 2 - 26, 192, 20, P.panelDark, P.coral, 1.5, 4)
      text("CAUSAL FAULT BEAM: Room03 ← Lobby", (pFail.x + pLobby.x) / 2, (pFail.y + pLobby.y) / 2 - 16, 10, P.coral, "center", "700")
    }

    // 7. Primary Agent Vessel (Antigravity) & Subagent Vessel (Adversarial Verifier)
    const activeTargetId = failedRoom03 && t < 70 ? "test-suite" : selectedMod || "server-lobby"
    const targetMod = modMap[activeTargetId] || MODULES[1]
    const hoverY = targetMod.y + 6.8 + Math.sin(t * 3.2) * 0.6
    const pv = drawPrism3D(targetMod.x, hoverY, targetMod.z, 2.8, 3.8, 2.8, P.cyanDim, "#10324a", P.cyan, camYaw)
    box(pv.topCenter.x - 74, pv.topCenter.y - 24, 148, 19, P.panelDark, P.cyan, 1.3, 4)
    text(`[AGT] Antigravity #${810 + cursorSeq}`, pv.topCenter.x, pv.topCenter.y - 14, 10, P.cyan, "center", "700")

    if (showSubagent) {
      const subTarget = repairedAll ? MODULES[Math.floor(t * 2) % 6] : modMap["test-suite"]
      const sv = drawPrism3D(subTarget.x - 3.5, subTarget.y + 6.2 + Math.cos(t * 3) * 0.5, subTarget.z, 2.5, 3.4, 2.5, P.violetDim, "#2a1648", P.violet, camYaw)
      box(sv.topCenter.x - 76, sv.topCenter.y - 24, 152, 19, P.panelDark, P.violet, 1.3, 4)
      text("[AGT] Subagent Verifier", sv.topCenter.x, sv.topCenter.y - 14, 10, P.violet, "center", "700")
    }

    // 8. 4D Rewind Crystal (x = 26, y = -18, z = -66)
    const rcPulse = (t >= T.act2C[0] && t < T.act2C[0] + 11) ? 1.22 : 1.0
    const rc = drawPrism3D(25, -18.5, -66, 3.2, 4.2, 3.2, P.amberDim, "#3d2b0a", P.amber, camYaw, rcPulse)
    box(rc.topCenter.x - 62, rc.topCenter.y - 22, 124, 18, P.panelDark, P.amber, 1.2, 4)
    text("[CHG] Rewind Crystal", rc.topCenter.x, rc.topCenter.y - 13, 9.5, P.amber, "center", "700")

    // 9. Front Ergonomic Control Rail (5 UIKit Buttons at z = -55 cm)
    RAIL.forEach((btn) => {
      const isPressed =
        (btn.id === "Step" && t >= 56 && t < 62) ||
        (btn.id === "Inspect" && t >= 72 && t < 80) ||
        (btn.id === "Learn" && learningMode) ||
        (btn.id === "Approve" && approvalStage >= 2)
      const bp = project3D(btn.x * 0.92, -24.2, -54, camYaw)
      box(bp.x - 36, bp.y - 13, 72, 26, isPressed ? btn.col : P.panelDark, btn.col, isPressed ? 2.5 : 1.5, 6)
      text(btn.id, bp.x, bp.y, 11, isPressed ? P.bg : btn.col, "center", "700")

      // Draw AR Hand Pinch Reticle when interacting
      if (isPressed) {
        ctx.beginPath()
        ctx.arc(bp.x + 18, bp.y - 6, 11 + 3 * Math.sin(t * 10), 0, Math.PI * 2)
        ctx.strokeStyle = P.white
        ctx.lineWidth = 2.2
        ctx.stroke()
        text("PINCH", bp.x + 18, bp.y - 24, 9, P.white, "center", "700")
      }
    })

    // Also show pinch reticle on RewindCrystal during 80..91s
    if (t >= T.act2C[0] && t < T.act2C[0] + 11) {
      ctx.beginPath()
      ctx.arc(rc.center.x, rc.center.y, 14 + 3 * Math.sin(t * 10), 0, Math.PI * 2)
      ctx.strokeStyle = P.amber
      ctx.lineWidth = 2.5
      ctx.stroke()
      text("SCRUB SEQ #3 → #2", rc.center.x, rc.center.y + 26, 10, P.amber, "center", "700")
    }

    // 10. Billboarded Glass Card (`BuildAliveCard` with +0.6 cm Z-lift on Right Side of Viewport)
    const cx = 618, cy = 66, cw = 318, ch = 396
    const borderCol = learningMode ? P.violet : failedRoom03 ? P.coral : repairedAll ? P.mint : P.cyan
    box(cx, cy, cw, ch, "rgba(8, 14, 28, 0.93)", borderCol, 2.2, 10)
    box(cx + 10, cy + 10, cw - 20, 28, "rgba(255,255,255,0.04)", null, 0, 6)
    text("BUILD ALIVE GLASS CARD (+0.6cm Z-LIFT)", cx + cw / 2, cy + 24, 10.5, P.muted, "center", "700")

    if (learningMode) {
      text("LEARNING ATELIER: Off-by-One Guard", cx + 18, cy + 58, 13, P.violet, "left", "700")
      text("PROMPT: `server/lobby.ts` changed `>`", cx + 18, cy + 84, 11.5, P.white)
      text("to `>= 4`. Which downstream module", cx + 18, cy + 102, 11.5, P.white)
      text("breaks first when player #4 joins?", cx + 18, cy + 120, 11.5, P.white)

      box(cx + 16, cy + 140, cw - 32, 74, P.panelDark, predictionSolved ? P.mint : P.amber, 1.5, 6)
      if (!predictionSolved) {
        text("AWAITING SPATIAL PREDICTION...", cx + 28, cy + 164, 11.5, P.amber, "left", "700")
        text("Pinch `Tests:Room03` or `Learn`", cx + 28, cy + 188, 11.5, P.white)
      } else {
        text("✓ PREDICTION VERIFIED: test-suite", cx + 28, cy + 164, 11.5, P.mint, "left", "700")
        text("4th player rejected at boundary!", cx + 28, cy + 188, 11.5, P.white)
      }

      text("WHY IT MATTERS (SOCRATIC BRIEF):", cx + 18, cy + 236, 11, P.cyan, "left", "700")
      text("Boundary mutations in shared lobby", cx + 18, cy + 256, 11, P.muted)
      text("validators silently break capacity", cx + 18, cy + 274, 11, P.muted)
      text("contracts across WebSocket rooms.", cx + 18, cy + 292, 11, P.muted)
      box(cx + 16, cy + 312, cw - 32, 32, P.violetDim, P.violet, 1, 5)
      text("Tier: architectural_tradeoff (F29)", cx + cw / 2, cy + 328, 11, P.violet, "center", "700")
    } else if (approvalStage > 0) {
      text(repairedAll ? "VERIFIED PASS: 12/12 TESTS" : "SAFE ACTION GATE (HUMAN-IN-LOOP)", cx + 18, cy + 58, 13, repairedAll ? P.mint : P.amber, "left", "700")
      text("Allowlisted Action: `run_known_test`", cx + 18, cy + 84, 11.5, P.white)
      text("Target: `tests/room-capacity.test.mjs`", cx + 18, cy + 104, 11.5, P.cyan)

      box(cx + 16, cy + 124, cw - 32, 92, P.panelDark, repairedAll ? P.mint : P.amber, 1.5, 6)
      text("CRYPTOGRAPHIC RECEIPT (F31/F32):", cx + 28, cy + 146, 11, P.amber, "left", "700")
      text("Gesture: CONFIRM_PINCH_APPROVE", cx + 28, cy + 168, 11, P.white)
      text("Single-Use Nonce: 8f4a9c02-7d1e", cx + 28, cy + 186, 11, P.mint)
      text("Arbitrary Shell: BLOCKED BY POLICY", cx + 28, cy + 204, 10.5, P.coral, "left", "700")

      box(cx + 16, cy + 230, cw - 32, 110, P.panelDark, P.cyan, 1.2, 6)
      text("AST REPAIR VERIFIED:", cx + 28, cy + 252, 11, P.cyan, "left", "700")
      text("- if (players.length >= 4) return false", cx + 28, cy + 274, 10.5, P.coral)
      text("+ if (players.length > 4) return false", cx + 28, cy + 294, 10.5, P.mint)
      text(repairedAll ? "Result: 12/12 PASS (0 regressions)" : "Executing sandboxed test runner...", cx + 28, cy + 318, 11, repairedAll ? P.mint : P.amber, "left", "700")
    } else {
      text(failedRoom03 ? "FAILURE ALERT: test-room-03" : "LIVE AST DIFF & CAUSAL TRACE", cx + 18, cy + 58, 13, failedRoom03 ? P.coral : P.cyan, "left", "700")
      text(`Active Event #${cursorSeq}: ${failedRoom03 ? "test_completed (FAIL)" : editedLobby ? "tool_finished (edit_file)" : "inspect_repo"}`, cx + 18, cy + 84, 11.5, P.white)
      text("Module: `server/lobby.ts` → `Room03`", cx + 18, cy + 104, 11.5, P.muted)

      // Side-by-side / inline AST diff box
      box(cx + 16, cy + 124, cw - 32, 104, P.panelDark, editedLobby ? P.amber : P.slateLight, 1.5, 6)
      text("SIDE-BY-SIDE AST DIFF (server/lobby.ts):", cx + 28, cy + 146, 10.5, P.amber, "left", "700")
      box(cx + 24, cy + 160, cw - 48, 24, P.coralDim, null, 0, 4)
      text("- if (players.length > 4) return false", cx + 32, cy + 172, 10.5, P.coral)
      box(cx + 24, cy + 190, cw - 48, 24, P.mintDim, null, 0, 4)
      text("+ if (players.length >= 4) return false", cx + 32, cy + 202, 10.5, P.mint)

      // Causal chain explanation
      box(cx + 16, cy + 242, cw - 32, 98, P.panelDark, failedRoom03 ? P.coral : P.cyan, 1.2, 6)
      text("CAUSAL GRAPH TRACE (F19):", cx + 28, cy + 264, 11, P.cyan, "left", "700")
      text("1. `server/lobby.ts` mutated guard", cx + 28, cy + 284, 10.5, P.white)
      text("2. `ws-gateway.ts` dropped 4th join", cx + 28, cy + 302, 10.5, P.white)
      text("3. `test-room-03` failed assertion", cx + 28, cy + 320, 10.5, failedRoom03 ? P.coral : P.mint, "left", "700")
    }

    // Bottom provenance row on glass card
    box(cx + 16, cy + 352, cw - 32, 30, "#050914", P.slateLight, 1, 5)
    text(`SIMULATED IN PREVIEW • HASH ${ (0x81a4f0 + cursorSeq * 137).toString(16) }`, cx + cw / 2, cy + 367, 10, P.cyan, "center", "700")
  }

  // ---- Act III (128..142s): Live Windows Multi-Agent Session Telemetry Matrix ------------------------------
  function renderAct3(t) {
    drawGridBackground(t, 160)
    box(36, 20, W - 72, 42, P.panelDark, P.violet, 1.8, 6)
    text("LIVE WINDOWS MULTI-AGENT BRIDGE • ws://127.0.0.1:8787/build-alive (LIVE_VERIFIED)", 54, 41, 14, P.violet, "left", "700")
    text("DISCOVERY: 14.7 ms", W - 54, 41, 13, P.mint, "right", "700")

    // 3 Columns for Antigravity, Claude Code, and OpenAI Codex
    const providers = [
      {
        title: "GOOGLE ANTIGRAVITY",
        count: "84 LIVE TRANSCRIPTS",
        col: P.cyan,
        activeId: "ebc49ffb-1ff7-47ff-b06f-fe425801a26f",
        items: [
          "step #813: run_command(bridge/start-live.mjs)",
          "step #814: edit_file(BuildAliveSceneUI.ts)",
          "step #815: lensifyts compile -> 0 errors",
          "step #816: sweep -> 2,223 assertions PASS",
        ],
      },
      {
        title: "ANTHROPIC CLAUDE CODE",
        count: "4 ACTIVE SESSIONS",
        col: P.violet,
        activeId: "02579be4-c216-4bd7-a03f-11a512a21b23",
        items: [
          "~/.claude/projects/*.jsonl tailed live",
          "subagent: Adversarial Hackathon Judge",
          "thinking blocks stripped (F33 privacy)",
          "secret tokens scrubbed: [REDACTED_SECRET]",
        ],
      },
      {
        title: "OPENAI CODEX CLI",
        count: "SANDBOX TELEMETRY",
        col: P.mint,
        activeId: "codex-win64-session-live",
        items: [
          "~/.codex/sessions/*.jsonl normalized",
          "v:1 AgentEvent schema validation PASS",
          "dedup & out-of-order buffer verified",
          "p50 = 0.04 ms | p95 = 0.13 ms | 0 allocs",
        ],
      },
    ]

    providers.forEach((p, idx) => {
      const x = 42 + idx * 298
      box(x, 82, 280, 260, P.panel, p.col, 2, 8)
      text(p.title, x + 18, 110, 14, p.col, "left", "700")
      text(p.count, x + 18, 132, 12, P.white, "left", "700")
      text(`ID: ${p.activeId.slice(0, 24)}...`, x + 18, 154, 10.5, P.muted)
      p.items.forEach((it, j) => {
        box(x + 14, 174 + j * 38, 252, 30, P.panelDark, P.slateLight, 1, 5)
        text(it, x + 22, 189 + j * 38, 9.8, P.white)
      })
    })

    // Bottom Verification Bar
    box(42, 360, W - 84, 104, P.panelDark, P.mint, 2, 8)
    text("END-TO-END VERIFICATION DISCIPLINE • 174,521 TOTAL AUTOMATED ASSERTIONS (0 FAILURES)", 64, 388, 14, P.mint, "left", "700")
    text("• 72 Capabilities (F01-F72) & 22 Single-Component LEAF Scenarios (L01-L22) + 9 Preserved Rover Scenarios (C1-C7)", 64, 416, 12, P.white)
    text("• Zero Per-Frame Allocations in tick(dt) • F33 Secret & Path Redaction • Cryptographic Nonce Approval Gate", 64, 440, 12, P.cyan)
  }

  // ---- End Card (142..154s): Ambient 3D Observatory Halo Behind HTML Titles --------------------------------
  function renderEnd(t) {
    drawGridBackground(t, 200)
    const camYaw = t * 0.25
    // Draw a subtle, low-elevation 3D city at the bottom of the frame so the HTML titles shine cleanly above
    ctx.save()
    ctx.translate(0, 110)
    ctx.globalAlpha = 0.55
    drawPrism3D(0, -24.5, -70, 68, 1.6, 30, "rgba(18, 28, 52, 0.8)", "#0d1528", P.shelfEdge, camYaw)
    MODULES.forEach((m) => {
      drawPrism3D(m.x, m.y, m.z, m.w, m.h, m.d, P.mintDim, "#131f3a", P.mint, camYaw, 1.0)
    })
    ctx.restore()
  }

  // ---- Master Seek Dispatcher ------------------------------------------------------------------------------
  function renderAt(t) {
    ctx.clearRect(0, 0, W, H)
    if (t < T.intro[1]) renderIntro(t - T.intro[0], t)
    else if (t < T.act1C[1]) renderAct1(t)
    else if (t < T.act2D[1]) renderAct2(t)
    else if (t < T.act3[1]) renderAct3(t)
    else renderEnd(t)
  }

  window.addEventListener("hf-seek", (e) => renderAt(e.detail.time))
  renderAt(0)
  window.__film = { renderAt }
})()
