// BuildAliveSceneUI.ts
// Constructs and updates the desk-scale 3D BUILD ALIVE Voxel AI Universe inside the Lens Studio scene.
// Pre-allocates all 3D voxel meshes (Multi-layer Voxel Continent, River/Waterfall, Voxel Trees,
// 3 Floating Project Islands with Portal Arches, 6 Recognizable Miniature Voxel Buildings:
//   - Module_Client: Setup & Voice Observatory
//   - Module_Lobby: Code Workshop & Anvil Forge with reactive Diff Block
//   - Module_WSServer: Open-Roof Command Factory with physical conveyor cubes
//   - Module_SharedState: Loop Engineering Forge with orbiting minecart
//   - Module_DBMock: Learning Academy with floating knowledge crystal
//   - Module_TestSuite: Testing Tower with 4 reactive pass/fail lamp cubes,
// 5 Voxel Redstone Bridges, 2 Articulated Voxel AI-Worker Characters, RewindCrystal,
// FaultMarker_Room03, CausalFaultBeam, DataFlowPacket, 8 Voxel Ambient Particles),
// 5 UIKit front-rail Buttons, ProvenanceBanner, and Progressive-Disclosure Frosted-Glass Card.
// Zero per-frame object allocations; preserves all existing EarthProof Rover objects untouched.

import {Billboard} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard"
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {ElementContent} from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexAlign, FlexDirection, FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {AllowlistedActionId, BuildAliveEngine, DEMO_PROJECTS} from "./BuildAliveCore"
import {
  AGENT_PRIMARY_HOME,
  AGENT_SUB_HOME,
  AGENT_VESSEL_SIZE,
  BoxSizeCm,
  BUILD_ALIVE_CARD_POS,
  BUILD_ALIVE_CARD_WIDTH_CM,
  CITY_BRIDGES,
  CITY_MODULES,
  DESK_CENTER,
  DESK_SIZE,
  FAULT_MARKER_POS,
  FAULT_MARKER_SIZE,
  PROJECT_ISLANDS,
  PROVENANCE_BANNER_POS,
  RAIL_CONTROLS,
  REWIND_CRYSTAL,
  Vec3Cm,
} from "./BuildAliveLayout"
import {BuildAliveTransport} from "./BuildAliveTransport"

export interface BuildAlivePressRecord {
  readonly kind: "step" | "inspect" | "learn" | "approve" | "reset" | "island" | "module" | "rewind"
  readonly target: string
  readonly pressMs: number
  readonly frameMs: number
  readonly latencyMs: number
}

// Voxel Palette
const COLOR_CYAN = new vec4(0.28, 0.92, 1.0, 1.0)
const COLOR_MINT = new vec4(0.24, 0.96, 0.68, 1.0)
const COLOR_AMBER = new vec4(1.0, 0.78, 0.22, 1.0)
const COLOR_CORAL = new vec4(1.0, 0.38, 0.34, 1.0)
const COLOR_VIOLET = new vec4(0.76, 0.54, 1.0, 1.0)
const COLOR_SLATE = new vec4(0.24, 0.27, 0.34, 1.0)
const COLOR_STONE_DARK = new vec4(0.16, 0.18, 0.23, 1.0)
const COLOR_GRASS = new vec4(0.32, 0.76, 0.26, 1.0)
const COLOR_GRASS_BRIGHT = new vec4(0.40, 0.84, 0.32, 1.0)
const COLOR_DIRT = new vec4(0.52, 0.35, 0.20, 1.0)
const COLOR_OAK = new vec4(0.68, 0.48, 0.26, 1.0)
const COLOR_OAK_DARK = new vec4(0.45, 0.30, 0.15, 1.0)
const COLOR_COPPER = new vec4(0.88, 0.50, 0.26, 1.0)
const COLOR_WATER = new vec4(0.20, 0.62, 0.96, 1.0)
const COLOR_GOLD = new vec4(0.98, 0.80, 0.20, 1.0)
const COLOR_QUARTZ = new vec4(0.90, 0.93, 0.96, 1.0)
const COLOR_WHITE = new vec4(0.96, 0.98, 1.0, 1.0)
const COLOR_CAPTION = new vec4(0.78, 0.86, 0.96, 0.85)

const CARD_CONTENT_Z_CM = 0.6
const CARD_PAD_CM = 0.85
const CARD_ROW_GAP_CM = 0.22
const BUTTON_LABEL_SIZE = 50

interface ModuleVisual {
  readonly moduleId: string
  readonly root: SceneObject
  readonly rmv: RenderMeshVisual | null
  readonly accentRmv: RenderMeshVisual | null
  readonly lampRmvs: RenderMeshVisual[]
  readonly movingPart: SceneObject | null
  readonly badgeText: Text
  readonly baseSize: BoxSizeCm
}

export class BuildAliveSceneUI {
  readonly engine = new BuildAliveEngine()
  readonly transport = new BuildAliveTransport(this.engine)
  readonly latencyLog: BuildAlivePressRecord[] = []

  private host!: BaseScriptComponent
  private rootObj!: SceneObject
  private boxMesh: RenderMesh | null = null
  private cylMesh: RenderMesh | null = null
  private baseMat: Material | null = null

  private provenanceText!: Text
  private islandObjects: Record<string, SceneObject> = {}
  private islandPortals: Record<string, RenderMeshVisual | null> = {}
  private moduleVisuals: Record<string, ModuleVisual> = {}
  private bridgeObjects: Record<string, SceneObject> = {}
  private primaryVessel!: SceneObject
  private primaryRightArm!: SceneObject
  private subVessel!: SceneObject
  private subRightArm!: SceneObject
  private rewindCrystal!: SceneObject
  private faultMarker!: SceneObject
  private causalBeam!: SceneObject
  private causalBeamLen = 1
  private dataPacket!: SceneObject
  private voxelParticles: SceneObject[] = []
  private particleHomePos: Vec3Cm[] = []
  private cardRoot!: SceneObject
  private cardRows: Text[] = []
  private cardRowObjects: SceneObject[] = []
  private buttons: Record<string, Button> = {}
  private pendingPresses: {kind: BuildAlivePressRecord["kind"]; target: string; pressMs: number}[] = []
  private pulseClock = 0
  private autoDemoClock = 0
  private autoDemoPhase = 0
  private leafOrUserTouched = false
  private disclosureTier: "WORLD" | "INSPECT" | "ENGINEER" = "WORLD"
  private onPlayAudio: (() => void) | null = null
  private lastRequestId: string | null = null
  private lastNonce: string | null = null
  private scratchScale: vec3 = new vec3(1, 1, 1)
  private scratchPos: vec3 = new vec3(0, 0, 0)

  init(
    host: BaseScriptComponent,
    boxSource: SceneObject,
    cylSource: SceneObject,
    onSelectEarthProofFallback?: () => void,
    internetModule: InternetModule | null = null,
    onPlayAudio?: () => void,
  ): void {
    this.host = host
    this.onPlayAudio = onPlayAudio || null
    const boxRmv = boxSource.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null
    const cylRmv = cylSource.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null
    this.boxMesh = boxRmv ? boxRmv.mesh : null
    this.cylMesh = cylRmv ? cylRmv.mesh : this.boxMesh
    this.baseMat = boxRmv && boxRmv.mainMaterial ? boxRmv.mainMaterial : null

    this.rootObj = global.scene.createSceneObject("BuildAliveRoot")
    this.rootObj.setParent(host.getSceneObject())
    this.rootObj.getTransform().setLocalPosition(vec3.zero())

    this.transport.onStateChanged = () => this.syncVisuals()

    this.buildShelfAndProvenance()
    this.buildIslands(onSelectEarthProofFallback)
    this.buildArchitectureCity()
    this.buildVesselsAndMarkers()
    this.buildControlRail()
    this.buildGlassCard()
    if (internetModule) {
      this.transport.connect(internetModule)
    }
    this.syncVisuals()
  }

  // ---- public programmatic & SIK handlers (used by UIKit buttons and LEAF L01-L22) ---------------

  handleStep(pressMs: number = Date.now()) {
    this.markPress("step", "BA_StepButton", pressMs)
    this.engine.stepForward()
    const snap = this.engine.snapshot()
    if (snap.activeFailures.length > 0) {
      this.disclosureTier = "INSPECT"
    }
    this.syncVisuals()
    return snap
  }

  handleInspect(moduleId: string = "server-lobby", pressMs: number = Date.now()) {
    this.markPress("inspect", moduleId, pressMs)
    const prevSelected = this.engine.snapshot().selectedModuleId
    this.engine.selectModule(moduleId)
    if (prevSelected === moduleId && this.disclosureTier === "INSPECT") {
      this.disclosureTier = "ENGINEER"
    } else {
      this.disclosureTier = "INSPECT"
    }
    this.syncVisuals()
    return this.engine.snapshot()
  }

  handleLearn(guessedModuleId?: string, pressMs: number = Date.now()) {
    this.markPress("learn", "BA_LearnButton", pressMs)
    this.disclosureTier = "INSPECT"
    const snap = this.engine.snapshot()
    if (guessedModuleId) {
      if (snap.sceneMode !== "LEARN") this.engine.enterLearningMode()
      this.engine.submitPrediction(guessedModuleId)
    } else if (snap.sceneMode !== "LEARN") {
      this.engine.enterLearningMode()
    } else {
      const expected = this.engine.activeLearningCase.expectedFailedModuleId
      this.engine.submitPrediction(expected)
    }
    this.syncVisuals()
    return this.engine.snapshot()
  }

  handleStageAction(actionId: AllowlistedActionId = "run_known_test") {
    this.disclosureTier = "INSPECT"
    const res = this.engine.proposeSafeAction(actionId, "tests/room-capacity.test.mjs")
    if (res.ok && res.request) {
      this.lastRequestId = res.request.requestId
      this.lastNonce = res.request.nonce
    }
    this.syncVisuals()
    return res
  }

  handleApprove(actionId: AllowlistedActionId = "run_known_test", pressMs: number = Date.now()) {
    this.markPress("approve", "BA_ApproveButton", pressMs)
    this.disclosureTier = "INSPECT"
    if (!this.lastRequestId || !this.lastNonce) {
      this.handleStageAction(actionId)
    }
    if (this.lastRequestId && this.lastNonce) {
      if (this.engine.snapshot().connectionState === "OFFLINE") {
        this.engine.handleReconnect(false)
      }
      const res = this.engine.approveAction(this.lastRequestId, "CONFIRM_PINCH_APPROVE", this.lastNonce)
      if (res.ok) {
        this.transport.sendApprovedAction(actionId)
      }
      this.lastRequestId = null
      this.lastNonce = null
    }
    this.syncVisuals()
    return this.engine.snapshot()
  }

  handleReject(pressMs: number = Date.now()) {
    this.markPress("approve", "BA_Reject", pressMs)
    if (this.lastRequestId) {
      this.engine.denyAction(this.lastRequestId, "user_rejected_in_spatial_dock")
      this.lastRequestId = null
      this.lastNonce = null
    }
    this.disclosureTier = "WORLD"
    this.syncVisuals()
    return this.engine.snapshot()
  }

  handleReset(pressMs: number = Date.now()) {
    this.markPress("reset", "BA_ResetButton", pressMs)
    this.lastRequestId = null
    this.lastNonce = null
    this.disclosureTier = "WORLD"
    this.engine.reset()
    this.syncVisuals()
    return this.engine.snapshot()
  }

  handleSelectProject(projectId: string, pressMs: number = Date.now()) {
    this.markPress("island", projectId, pressMs)
    this.engine.selectProject(projectId)
    this.syncVisuals()
    return this.engine.snapshot()
  }

  handleRewind(seq?: number, pressMs: number = Date.now()) {
    this.markPress("rewind", "RewindCrystal", pressMs)
    this.disclosureTier = "ENGINEER"
    if (typeof seq === "number") {
      this.engine.scrubToSeq(seq)
    } else {
      this.engine.stepBackward()
    }
    this.syncVisuals()
    return this.engine.snapshot()
  }

  clearLatencyLog(): void {
    this.latencyLog.length = 0
    this.pendingPresses.length = 0
  }

  tick(dt: number): void {
    this.pulseClock += dt
    this.autoDemoClock += dt
    const snap = this.engine.snapshot()
    if (!snap.reducedMotion) {
      // Animate Fault Marker
      if (this.faultMarker && this.faultMarker.enabled) {
        const pulse = 1 + 0.08 * Math.sin(this.pulseClock * 5)
        this.scratchScale.x = FAULT_MARKER_SIZE.w * pulse
        this.scratchScale.y = FAULT_MARKER_SIZE.h
        this.scratchScale.z = FAULT_MARKER_SIZE.d * pulse
        this.faultMarker.getTransform().setLocalScale(this.scratchScale)
      }
      // Animate Causal Fault Beam
      if (this.causalBeam && this.causalBeam.enabled) {
        const bw = 0.45 + 0.14 * Math.sin(this.pulseClock * 6.5)
        this.scratchScale.x = bw
        this.scratchScale.y = bw
        this.scratchScale.z = this.causalBeamLen
        this.causalBeam.getTransform().setLocalScale(this.scratchScale)
      }
      // Animate Data Flow Packet along active dependency bridges
      if (this.dataPacket) {
        const bIdx = Math.floor(this.pulseClock * 0.9) % CITY_BRIDGES.length
        const b = CITY_BRIDGES[bIdx]
        const fromMod = CITY_MODULES.find((m) => m.moduleId === b.fromModuleId)
        const toMod = CITY_MODULES.find((m) => m.moduleId === b.toModuleId)
        if (fromMod && toMod) {
          const u = (this.pulseClock * 0.9) % 1
          this.scratchPos.x = fromMod.center.x + (toMod.center.x - fromMod.center.x) * u
          this.scratchPos.y = fromMod.center.y + (toMod.center.y - fromMod.center.y) * u + 0.65
          this.scratchPos.z = fromMod.center.z + (toMod.center.z - fromMod.center.z) * u
          this.dataPacket.getTransform().setLocalPosition(this.scratchPos)
        }
      }
      // Animate Voxel AI Worker Arms & Building Kinetic Parts (Conveyor / Loop Cart / Diff Block)
      if (this.primaryRightArm) {
        this.scratchPos.x = 0.38
        this.scratchPos.y = 0.05 + 0.08 * Math.sin(this.pulseClock * 7.0)
        this.scratchPos.z = -0.18
        this.primaryRightArm.getTransform().setLocalPosition(this.scratchPos)
      }
      if (this.subRightArm && this.subVessel && this.subVessel.enabled) {
        this.scratchPos.x = 0.38
        this.scratchPos.y = 0.05 + 0.08 * Math.cos(this.pulseClock * 6.0)
        this.scratchPos.z = -0.18
        this.subRightArm.getTransform().setLocalPosition(this.scratchPos)
      }
      // Loop Forge Orbiting Minecart (shared-state)
      const loopVis = this.moduleVisuals["shared-state"]
      if (loopVis && loopVis.movingPart) {
        const ang = this.pulseClock * 2.4
        this.scratchPos.x = Math.cos(ang) * 0.38
        this.scratchPos.y = 0.62
        this.scratchPos.z = Math.sin(ang) * 0.38
        loopVis.movingPart.getTransform().setLocalPosition(this.scratchPos)
      }
      // Command Factory Conveyor Cube (ws-gateway)
      const cmdVis = this.moduleVisuals["ws-gateway"]
      if (cmdVis && cmdVis.movingPart) {
        const slide = ((this.pulseClock * 0.85) % 1) - 0.5
        this.scratchPos.x = slide * 0.7
        this.scratchPos.y = 0.58
        this.scratchPos.z = 0
        cmdVis.movingPart.getTransform().setLocalPosition(this.scratchPos)
      }
      // Floating Voxel Ambient Particles
      for (let i = 0; i < this.voxelParticles.length; i++) {
        const pObj = this.voxelParticles[i]
        const home = this.particleHomePos[i]
        this.scratchPos.x = home.x + Math.sin(this.pulseClock * 1.2 + i) * 0.6
        this.scratchPos.y = home.y + ((this.pulseClock * 1.4 + i * 0.7) % 3.5)
        this.scratchPos.z = home.z + Math.cos(this.pulseClock * 1.1 + i) * 0.4
        pObj.getTransform().setLocalPosition(this.scratchPos)
      }
    }

    // Calm auto-progression when idle (9.5s per phase)
    if (!this.leafOrUserTouched && this.autoDemoClock >= 2.5) {
      const stepIdx = Math.floor((this.autoDemoClock - 2.5) / 9.5) % 9
      if (stepIdx !== this.autoDemoPhase) {
        this.autoDemoPhase = stepIdx
        if (stepIdx === 0) {
          this.engine.reset()
          this.disclosureTier = "WORLD"
          this.engine.stepForward()
        } else if (stepIdx === 1 || stepIdx === 2) {
          this.disclosureTier = "WORLD"
          this.engine.stepForward()
        } else if (stepIdx === 3) {
          this.engine.stepForward()
          this.disclosureTier = "INSPECT"
        } else if (stepIdx === 4) {
          this.engine.selectModule("server-lobby")
          this.disclosureTier = "ENGINEER"
        } else if (stepIdx === 5) {
          this.engine.enterLearningMode()
          this.disclosureTier = "INSPECT"
        } else if (stepIdx === 6) {
          this.engine.submitPrediction(this.engine.activeLearningCase.expectedFailedModuleId)
        } else if (stepIdx === 7) {
          const stage = this.engine.proposeSafeAction("run_known_test", "tests/room-capacity.test.mjs")
          if (stage.ok && stage.request) {
            if (this.engine.snapshot().connectionState === "OFFLINE") {
              this.engine.handleReconnect(false)
            }
            this.engine.approveAction(stage.request.requestId, "CONFIRM_PINCH_APPROVE", stage.request.nonce)
          }
        } else if (stepIdx === 8) {
          this.engine.reset()
          this.disclosureTier = "WORLD"
        }
        this.syncVisuals()
      }
    }
  }

  flushLatency(): void {
    if (this.pendingPresses.length === 0) return
    const frameMs = Date.now()
    for (const p of this.pendingPresses) {
      this.latencyLog.push({
        kind: p.kind,
        target: p.target,
        pressMs: p.pressMs,
        frameMs,
        latencyMs: frameMs - p.pressMs,
      })
    }
    this.pendingPresses.length = 0
  }

  // ---- voxel world construction -----------------------------------------------------------------

  private buildShelfAndProvenance(): void {
    // Root DeskShelf (preserves exact transform & bounds for LEAF L01)
    const shelf = this.makeBoxObject("DeskShelf", this.rootObj, DESK_CENTER, DESK_SIZE, COLOR_DIRT)

    // Multi-layered Voxel Continent atop DeskShelf
    this.makeBoxObject(
      "VoxelBedrockLayer",
      this.rootObj,
      {x: DESK_CENTER.x, y: DESK_CENTER.y - 1.8, z: DESK_CENTER.z},
      {w: DESK_SIZE.w * 0.94, h: 1.4, d: DESK_SIZE.d * 0.94},
      COLOR_STONE_DARK,
    )
    this.makeBoxObject(
      "VoxelGrassTurf",
      this.rootObj,
      {x: DESK_CENTER.x, y: DESK_CENTER.y + 1.4, z: DESK_CENTER.z},
      {w: DESK_SIZE.w * 0.98, h: 1.0, d: DESK_SIZE.d * 0.98},
      COLOR_GRASS,
    )
    // Raised Citadel Grass Terrace under the 6 City Buildings
    this.makeBoxObject(
      "VoxelCitadelTerrace",
      this.rootObj,
      {x: 0, y: -22.8, z: -72},
      {w: 44, h: 2.2, d: 24},
      COLOR_GRASS_BRIGHT,
    )
    // Glowing Voxel River & Waterfall separating Archipelago from Main Citadel
    this.makeBoxObject(
      "VoxelRiverChannel",
      this.rootObj,
      {x: 0, y: -27.9, z: -58},
      {w: 46, h: 0.5, d: 3.2},
      COLOR_WATER,
    )
    this.makeBoxObject(
      "VoxelWaterfall",
      this.rootObj,
      {x: 2, y: -29.8, z: -45.2},
      {w: 3.4, h: 4.2, d: 0.8},
      COLOR_WATER,
    )

    // Voxel Trees framing the Voxel Continent (outside seated interaction corridors)
    const treeSpots: Vec3Cm[] = [
      {x: -23, y: -26.5, z: -74},
      {x: 23, y: -26.5, z: -74},
      {x: -21, y: -26.5, z: -84},
      {x: 21, y: -26.5, z: -84},
      {x: 0, y: -20.5, z: -84},
    ]
    for (let i = 0; i < treeSpots.length; i++) {
      this.buildVoxelTree("VoxelTree_" + i, treeSpots[i])
    }

    // Pre-allocated Floating Voxel Ambient Particles
    const particleSpots: Vec3Cm[] = [
      {x: -15, y: -15, z: -68},
      {x: -5, y: -14, z: -72},
      {x: 7, y: -15, z: -69},
      {x: 15, y: -14, z: -67},
      {x: -11, y: -20, z: -53},
      {x: 11, y: -20, z: -53},
    ]
    for (let i = 0; i < particleSpots.length; i++) {
      const p = particleSpots[i]
      this.particleHomePos.push(p)
      const pCol = i % 2 === 0 ? COLOR_CYAN : COLOR_MINT
      const pObj = this.makeBoxObject("VoxelParticle_" + i, this.rootObj, p, {w: 0.45, h: 0.45, d: 0.45}, pCol)
      this.voxelParticles.push(pObj)
    }

    // Subtle, non-intrusive Provenance Banner at lower-left desk edge
    const bannerObj = global.scene.createSceneObject("ProvenanceBanner")
    bannerObj.setParent(this.rootObj)
    bannerObj.getTransform().setLocalPosition(
      new vec3(PROVENANCE_BANNER_POS.x, PROVENANCE_BANNER_POS.y, PROVENANCE_BANNER_POS.z),
    )
    bannerObj.createComponent(Billboard.getTypeName())
    this.provenanceText = this.addText(bannerObj, "SIMULATED IN PREVIEW • LOCAL_RECORDED_REPLAY", 24, COLOR_CYAN)
    void shelf
  }

  private buildVoxelTree(name: string, basePos: Vec3Cm): void {
    const treeRoot = global.scene.createSceneObject(name)
    treeRoot.setParent(this.rootObj)
    treeRoot.getTransform().setLocalPosition(new vec3(basePos.x, basePos.y, basePos.z))
    this.makeBoxObject(name + "_Trunk", treeRoot, {x: 0, y: 1.1, z: 0}, {w: 0.9, h: 2.2, d: 0.9}, COLOR_OAK_DARK)
    this.makeBoxObject(name + "_Leaves1", treeRoot, {x: 0, y: 2.6, z: 0}, {w: 2.8, h: 1.4, d: 2.8}, COLOR_GRASS)
    this.makeBoxObject(name + "_Leaves2", treeRoot, {x: 0, y: 3.7, z: 0}, {w: 1.8, h: 1.1, d: 1.8}, COLOR_GRASS_BRIGHT)
  }

  private buildIslands(onSelectEarthProofFallback?: () => void): void {
    for (const slot of PROJECT_ISLANDS) {
      const proj = DEMO_PROJECTS.find((p) => p.projectId === slot.id) || DEMO_PROJECTS[0]
      const accentCol = slot.id === "lobby-sync" ? COLOR_CYAN : slot.id === "edge-guard" ? COLOR_VIOLET : COLOR_MINT

      // Root island object (exact coordinates & size for L02/L03)
      const island = this.makeBoxObject(slot.sceneName, this.rootObj, slot.center, slot.size, COLOR_GRASS)

      // Voxel floating rock underside & dirt layer (relative to island scale)
      this.makeBoxObject(slot.sceneName + "_Dirt", island, {x: 0, y: -0.35, z: 0}, {w: 0.88, h: 0.45, d: 0.88}, COLOR_DIRT)
      this.makeBoxObject(slot.sceneName + "_Spire", island, {x: 0, y: -0.75, z: 0}, {w: 0.52, h: 0.55, d: 0.52}, COLOR_SLATE)

      // Voxel Portal Arch on each Project Island
      this.makeBoxObject(slot.sceneName + "_PillarL", island, {x: -0.28, y: 0.75, z: -0.15}, {w: 0.12, h: 0.65, d: 0.12}, COLOR_QUARTZ)
      this.makeBoxObject(slot.sceneName + "_PillarR", island, {x: 0.28, y: 0.75, z: -0.15}, {w: 0.12, h: 0.65, d: 0.12}, COLOR_QUARTZ)
      this.makeBoxObject(slot.sceneName + "_ArchTop", island, {x: 0, y: 1.12, z: -0.15}, {w: 0.72, h: 0.16, d: 0.16}, COLOR_GOLD)
      const portalCore = this.makeBoxObject(slot.sceneName + "_PortalCore", island, {x: 0, y: 0.75, z: -0.15}, {w: 0.42, h: 0.55, d: 0.06}, accentCol)
      this.islandPortals[slot.id] = portalCore.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null

      // Crisp floating island title above the portal arch
      const labelObj = global.scene.createSceneObject(slot.sceneName + "_Label")
      labelObj.setParent(island)
      labelObj.getTransform().setLocalPosition(new vec3(0, 1.55, 0))
      this.addText(labelObj, proj.title, 26, COLOR_WHITE)

      this.makeInteractable(island, () => {
        this.handleSelectProject(slot.id, Date.now())
        if (slot.id === "earthproof-rover" && onSelectEarthProofFallback) {
          onSelectEarthProofFallback()
        }
      })
      this.islandObjects[slot.id] = island
    }
  }

  private buildArchitectureCity(): void {
    for (const m of CITY_MODULES) {
      // Root module object (keeps exact m.sceneName, m.center, m.size, and collider for L05/L06/L08/L22)
      const obj = this.makeBoxObject(m.sceneName, this.rootObj, m.center, m.size, COLOR_SLATE)
      const rmv = obj.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null
      let accentRmv: RenderMeshVisual | null = null
      const lampRmvs: RenderMeshVisual[] = []
      let movingPart: SceneObject | null = null

      // Build recognizable miniature Voxel Architecture per module role!
      if (m.moduleId === "client-ui") {
        // 1. Setup & Voice Observatory: Oak & Quartz stepped tower + Cyan Beacon
        this.makeBoxObject(m.sceneName + "_Mid", obj, {x: 0, y: 0.58, z: 0}, {w: 0.78, h: 0.36, d: 0.78}, COLOR_OAK)
        this.makeBoxObject(m.sceneName + "_Roof", obj, {x: 0, y: 0.85, z: 0}, {w: 0.56, h: 0.22, d: 0.56}, COLOR_QUARTZ)
        const beacon = this.makeBoxObject(m.sceneName + "_Beacon", obj, {x: 0, y: 1.08, z: 0}, {w: 0.26, h: 0.26, d: 0.26}, COLOR_CYAN)
        accentRmv = beacon.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null
      } else if (m.moduleId === "server-lobby") {
        // 2. Code Workshop & Anvil Forge: Lava Furnace + Voxel Anvil + Reactive Code Diff Cube
        this.makeBoxObject(m.sceneName + "_Furnace", obj, {x: -0.24, y: 0.62, z: 0}, {w: 0.38, h: 0.38, d: 0.42}, COLOR_COPPER)
        this.makeBoxObject(m.sceneName + "_AnvilBase", obj, {x: 0.22, y: 0.56, z: 0}, {w: 0.34, h: 0.22, d: 0.26}, COLOR_STONE_DARK)
        this.makeBoxObject(m.sceneName + "_AnvilTop", obj, {x: 0.22, y: 0.72, z: 0}, {w: 0.44, h: 0.16, d: 0.32}, COLOR_SLATE)
        const diffCube = this.makeBoxObject(m.sceneName + "_DiffBlock", obj, {x: 0.22, y: 1.02, z: 0}, {w: 0.30, h: 0.30, d: 0.30}, COLOR_MINT)
        accentRmv = diffCube.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null
        movingPart = diffCube
      } else if (m.moduleId === "ws-gateway") {
        // 3. Open-Roof Command Factory: Copper/Teal Command Block walls + sliding Conveyor Cube
        this.makeBoxObject(m.sceneName + "_WallL", obj, {x: -0.34, y: 0.64, z: 0}, {w: 0.24, h: 0.42, d: 0.86}, COLOR_COPPER)
        this.makeBoxObject(m.sceneName + "_WallR", obj, {x: 0.34, y: 0.64, z: 0}, {w: 0.24, h: 0.42, d: 0.86}, COLOR_CYAN)
        this.makeBoxObject(m.sceneName + "_Belt", obj, {x: 0, y: 0.48, z: 0}, {w: 0.85, h: 0.08, d: 0.36}, COLOR_STONE_DARK)
        const convCube = this.makeBoxObject(m.sceneName + "_ConveyorCube", obj, {x: 0, y: 0.62, z: 0}, {w: 0.24, h: 0.24, d: 0.24}, COLOR_GOLD)
        accentRmv = convCube.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null
        movingPart = convCube
      } else if (m.moduleId === "shared-state") {
        // 4. Loop Engineering Forge: Gold Track + 4 Pillars + Orbiting Minecart Cube
        this.makeBoxObject(m.sceneName + "_Track", obj, {x: 0, y: 0.52, z: 0}, {w: 0.92, h: 0.12, d: 0.92}, COLOR_GOLD)
        this.makeBoxObject(m.sceneName + "_Core", obj, {x: 0, y: 0.72, z: 0}, {w: 0.32, h: 0.36, d: 0.32}, COLOR_MINT)
        const cart = this.makeBoxObject(m.sceneName + "_LoopCart", obj, {x: 0.36, y: 0.64, z: 0}, {w: 0.24, h: 0.20, d: 0.24}, COLOR_AMBER)
        accentRmv = cart.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null
        movingPart = cart
      } else if (m.moduleId === "db-mock") {
        // 5. Learning Academy: Stepped Sandstone/Bookshelf Temple + Violet Knowledge Crystal
        this.makeBoxObject(m.sceneName + "_Tier1", obj, {x: 0, y: 0.58, z: 0}, {w: 0.82, h: 0.28, d: 0.82}, COLOR_OAK)
        this.makeBoxObject(m.sceneName + "_Tier2", obj, {x: 0, y: 0.80, z: 0}, {w: 0.58, h: 0.24, d: 0.58}, COLOR_GOLD)
        const crystal = this.makeBoxObject(m.sceneName + "_AcademyCrystal", obj, {x: 0, y: 1.08, z: 0}, {w: 0.28, h: 0.28, d: 0.28}, COLOR_VIOLET)
        accentRmv = crystal.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null
        movingPart = crystal
      } else if (m.moduleId === "test-suite") {
        // 6. Testing Tower: Multi-tier Watchtower + 4 Reactive Pass/Fail Lamp Cubes
        this.makeBoxObject(m.sceneName + "_TowerMid", obj, {x: 0, y: 0.65, z: 0}, {w: 0.68, h: 0.48, d: 0.68}, COLOR_QUARTZ)
        const beacon = this.makeBoxObject(m.sceneName + "_TowerBeacon", obj, {x: 0, y: 1.04, z: 0}, {w: 0.36, h: 0.38, d: 0.36}, COLOR_MINT)
        accentRmv = beacon.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null
        const lampOffsets: Vec3Cm[] = [
          {x: -0.32, y: 0.92, z: -0.32},
          {x: 0.32, y: 0.92, z: -0.32},
          {x: -0.32, y: 0.92, z: 0.32},
          {x: 0.32, y: 0.92, z: 0.32},
        ]
        for (let li = 0; li < lampOffsets.length; li++) {
          const lamp = this.makeBoxObject(m.sceneName + "_Lamp" + li, obj, lampOffsets[li], {w: 0.20, h: 0.20, d: 0.20}, COLOR_MINT)
          const lRmv = lamp.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null
          if (lRmv) lampRmvs.push(lRmv)
        }
      }

      // Compact, non-overlapping badge perched cleanly above the voxel roof
      const badgeObj = global.scene.createSceneObject(m.sceneName + "_Badge")
      badgeObj.setParent(obj)
      badgeObj.getTransform().setLocalPosition(new vec3(0, 1.42, 0))
      const badgeText = this.addText(badgeObj, "[PASS] " + m.label, 25, COLOR_WHITE)

      this.makeInteractable(obj, () => {
        const snap = this.engine.snapshot()
        if (snap.sceneMode === "LEARN") {
          this.handleLearn(m.moduleId, Date.now())
        } else {
          this.handleInspect(m.moduleId, Date.now())
        }
      })
      this.moduleVisuals[m.moduleId] = {
        moduleId: m.moduleId,
        root: obj,
        rmv,
        accentRmv,
        lampRmvs,
        movingPart,
        badgeText,
        baseSize: m.size,
      }
    }

    // Voxel Redstone & Gold Rail Bridges connecting City Modules
    for (const b of CITY_BRIDGES) {
      const fromMod = CITY_MODULES.find((m) => m.moduleId === b.fromModuleId)!
      const toMod = CITY_MODULES.find((m) => m.moduleId === b.toModuleId)!
      const a = new vec3(fromMod.center.x, fromMod.center.y, fromMod.center.z)
      const c = new vec3(toMod.center.x, toMod.center.y, toMod.center.z)
      const d = c.sub(a)
      const len = Math.max(0.1, d.length)
      const mid = a.add(c).uniformScale(0.5)

      const bridge = this.makeBoxObject(
        b.sceneName,
        this.rootObj,
        {x: mid.x, y: mid.y, z: mid.z},
        {w: 0.52, h: 0.28, d: len},
        b.verified ? COLOR_GOLD : COLOR_SLATE,
      )
      bridge.getTransform().setLocalRotation(quat.lookAt(d.uniformScale(1 / len), vec3.up()))
      this.bridgeObjects[b.bridgeId] = bridge
    }
  }

  private buildVesselsAndMarkers(): void {
    // 1. Primary AI-Worker Character (Builder Golem)
    this.primaryVessel = this.makeCylinderObject(
      "AgentVessel_Primary",
      this.rootObj,
      AGENT_PRIMARY_HOME,
      AGENT_VESSEL_SIZE,
      COLOR_CYAN,
    )
    this.buildVoxelWorkerParts(this.primaryVessel, "Primary", COLOR_CYAN, COLOR_GOLD, true)
    const pLabel = global.scene.createSceneObject("AgentVessel_Primary_Label")
    pLabel.setParent(this.primaryVessel)
    pLabel.getTransform().setLocalPosition(new vec3(0, 1.38, 0))
    this.addText(pLabel, "[AGT] Builder Bot", 24, COLOR_CYAN)

    // 2. Subagent Verifier AI-Worker Character (Amethyst Judge Golem)
    this.subVessel = this.makeCylinderObject(
      "AgentVessel_Sub01",
      this.rootObj,
      AGENT_SUB_HOME,
      AGENT_VESSEL_SIZE,
      COLOR_VIOLET,
    )
    this.buildVoxelWorkerParts(this.subVessel, "Sub01", COLOR_VIOLET, COLOR_MINT, false)
    const sLabel = global.scene.createSceneObject("AgentVessel_Sub01_Label")
    sLabel.setParent(this.subVessel)
    sLabel.getTransform().setLocalPosition(new vec3(0, 1.38, 0))
    this.addText(sLabel, "[AGT] Verifier Bot", 24, COLOR_VIOLET)

    // 3. Rewind Crystal (Multi-faceted Voxel Time Relic)
    this.rewindCrystal = this.makeBoxObject(
      REWIND_CRYSTAL.sceneName,
      this.rootObj,
      REWIND_CRYSTAL.center,
      REWIND_CRYSTAL.size,
      COLOR_AMBER,
    )
    this.makeBoxObject("RewindCrystal_InnerRing", this.rewindCrystal, {x: 0, y: 0, z: 0}, {w: 1.25, h: 0.32, d: 1.25}, COLOR_GOLD)
    const rLabel = global.scene.createSceneObject("RewindCrystal_Label")
    rLabel.setParent(this.rewindCrystal)
    rLabel.getTransform().setLocalPosition(new vec3(0, 0.95, 0))
    this.addText(rLabel, "[CHG] Rewind", 24, COLOR_AMBER)
    this.makeInteractable(this.rewindCrystal, () => this.handleRewind(undefined, Date.now()))

    // 4. Spatial Fault Marker (above Testing Tower when test-room-03 fails)
    this.faultMarker = this.makeCylinderObject(
      "FaultMarker_Room03",
      this.rootObj,
      FAULT_MARKER_POS,
      FAULT_MARKER_SIZE,
      COLOR_CORAL,
    )
    this.makeBoxObject("FaultMarker_Crown", this.faultMarker, {x: 0, y: 0.45, z: 0}, {w: 0.65, h: 0.45, d: 0.65}, COLOR_AMBER)
    const fLabel = global.scene.createSceneObject("FaultMarker_Label")
    fLabel.setParent(this.faultMarker)
    fLabel.getTransform().setLocalPosition(new vec3(0, 0.95, 0))
    this.addText(fLabel, "[FAIL] test-room-03", 26, COLOR_CORAL)

    // 5. Causal Fault Beam connecting Testing Tower Fault to Lobby Workshop
    const lobbyMod = CITY_MODULES.find((m) => m.moduleId === "server-lobby") || CITY_MODULES[1]
    const fromVec = new vec3(FAULT_MARKER_POS.x, FAULT_MARKER_POS.y, FAULT_MARKER_POS.z)
    const toVec = new vec3(lobbyMod.center.x, lobbyMod.center.y + 1.5, lobbyMod.center.z)
    const diffVec = toVec.sub(fromVec)
    this.causalBeamLen = Math.max(0.1, diffVec.length)
    const midVec = fromVec.add(toVec).uniformScale(0.5)
    this.causalBeam = this.makeBoxObject(
      "CausalFaultBeam",
      this.rootObj,
      {x: midVec.x, y: midVec.y, z: midVec.z},
      {w: 0.42, h: 0.42, d: this.causalBeamLen},
      COLOR_CORAL,
    )
    this.causalBeam.getTransform().setLocalRotation(quat.lookAt(diffVec.uniformScale(1 / this.causalBeamLen), vec3.up()))

    // 6. Animated DataFlowPacket on bridges
    this.dataPacket = this.makeBoxObject(
      "DataFlowPacket",
      this.rootObj,
      {x: lobbyMod.center.x, y: lobbyMod.center.y + 0.65, z: lobbyMod.center.z},
      {w: 0.95, h: 0.95, d: 0.95},
      COLOR_CYAN,
    )
  }

  private buildVoxelWorkerParts(
    vesselRoot: SceneObject,
    prefix: string,
    bodyCol: vec4,
    visorCol: vec4,
    isPrimary: boolean,
  ): void {
    // Voxel Torso, Head, Visor, Arms & Tool relative to vesselRoot
    this.makeBoxObject(prefix + "_Torso", vesselRoot, {x: 0, y: 0.18, z: 0}, {w: 0.52, h: 0.55, d: 0.42}, bodyCol)
    this.makeBoxObject(prefix + "_Head", vesselRoot, {x: 0, y: 0.68, z: 0}, {w: 0.46, h: 0.44, d: 0.44}, COLOR_QUARTZ)
    this.makeBoxObject(prefix + "_Visor", vesselRoot, {x: 0, y: 0.70, z: 0.22}, {w: 0.36, h: 0.16, d: 0.08}, visorCol)
    this.makeBoxObject(prefix + "_LeftArm", vesselRoot, {x: -0.38, y: 0.12, z: 0}, {w: 0.18, h: 0.45, d: 0.18}, bodyCol)
    const rArm = this.makeBoxObject(prefix + "_RightArm", vesselRoot, {x: 0.38, y: 0.12, z: -0.15}, {w: 0.18, h: 0.45, d: 0.18}, bodyCol)
    this.makeBoxObject(prefix + "_Tool", rArm, {x: 0, y: 0.35, z: 0.25}, {w: 0.35, h: 0.25, d: 0.55}, visorCol)
    if (isPrimary) {
      this.primaryRightArm = rArm
    } else {
      this.subRightArm = rArm
    }
  }

  private buildControlRail(): void {
    const rail = global.scene.createSceneObject("BuildAliveControls")
    rail.setParent(this.rootObj)
    rail.getTransform().setLocalPosition(vec3.zero())
    rail.createComponent("Component.Canvas")

    for (const spec of RAIL_CONTROLS) {
      const so = global.scene.createSceneObject(spec.sceneName)
      so.setParent(rail)
      so.getTransform().setLocalPosition(new vec3(spec.center.x, spec.center.y, spec.center.z))

      const btn = so.createComponent(Button.getTypeName()) as Button
      btn.setVariant({
        theme: "SnapOS2",
        shape: "Rectangle",
        style: spec.sceneName === "BA_StepButton" || spec.sceneName === "BA_ApproveButton" ? "Primary" : "PrimaryNeutral",
      })
      btn.size = new vec3(spec.size.w, spec.size.h, 1)
      const content = so.createComponent(ElementContent.getTypeName()) as ElementContent
      content.text = spec.label
      content.textSize = BUTTON_LABEL_SIZE
      btn.initialize()

      btn.onTriggerUp.add(() => {
        const t0 = Date.now()
        if (spec.sceneName === "BA_StepButton") this.handleStep(t0)
        else if (spec.sceneName === "BA_InspectButton") this.handleInspect("server-lobby", t0)
        else if (spec.sceneName === "BA_LearnButton") this.handleLearn(undefined, t0)
        else if (spec.sceneName === "BA_ApproveButton") this.handleApprove("run_known_test", t0)
        else if (spec.sceneName === "BA_ResetButton") this.handleReset(t0)
      })
      this.buttons[spec.sceneName] = btn
    }
  }

  private buildGlassCard(): void {
    this.cardRoot = global.scene.createSceneObject("BuildAliveCard")
    this.cardRoot.setParent(this.rootObj)
    this.cardRoot
      .getTransform()
      .setLocalPosition(new vec3(BUILD_ALIVE_CARD_POS.x, BUILD_ALIVE_CARD_POS.y, BUILD_ALIVE_CARD_POS.z))
    this.cardRoot.createComponent("Component.Canvas")
    this.cardRoot.createComponent(Billboard.getTypeName())
    const plate = this.cardRoot.createComponent(BackPlate.getTypeName()) as BackPlate

    const content = global.scene.createSceneObject("BuildAliveCardContent")
    content.setParent(this.cardRoot)
    content.getTransform().setLocalPosition(new vec3(0, 0, CARD_CONTENT_Z_CM))
    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.width = BUILD_ALIVE_CARD_WIDTH_CM
    flex.height = -1
    flex.direction = FlexDirection.Column
    flex.justifyContent = FlexJustify.Start
    flex.alignItems = FlexAlign.Stretch
    flex.rowGap = CARD_ROW_GAP_CM
    flex.paddingTop = CARD_PAD_CM
    flex.paddingBottom = CARD_PAD_CM
    flex.paddingLeft = CARD_PAD_CM
    flex.paddingRight = CARD_PAD_CM
    flex.onLayoutComplete.add((res) => {
      plate.size = new vec2(res.containerWidth, res.containerHeight)
    })

    const innerW = BUILD_ALIVE_CARD_WIDTH_CM - CARD_PAD_CM * 2
    const rowSpecs = [
      {size: 52, color: COLOR_CYAN, h: 1.75, wrap: false},
      {size: 42, color: COLOR_WHITE, h: 1.45, wrap: true},
      {size: 40, color: COLOR_WHITE, h: 1.45, wrap: true},
      {size: 40, color: COLOR_AMBER, h: 1.45, wrap: true},
      {size: 38, color: COLOR_MINT, h: 1.40, wrap: true},
      {size: 34, color: COLOR_CAPTION, h: 1.35, wrap: true},
    ]

    this.cardRowObjects = []
    this.cardRows = rowSpecs.map((r, i) => {
      const rowObj = global.scene.createSceneObject("BA_Row" + i)
      rowObj.setParent(content)
      const txt = rowObj.createComponent("Component.Text") as Text
      txt.text = ""
      txt.size = r.size
      txt.depthTest = true
      txt.textFill.color = r.color
      txt.horizontalAlignment = HorizontalAlignment.Center
      txt.verticalAlignment = VerticalAlignment.Center
      txt.horizontalOverflow = r.wrap ? HorizontalOverflow.Wrap : HorizontalOverflow.Overflow
      txt.verticalOverflow = VerticalOverflow.Overflow
      txt.layoutRect = Rect.create(-innerW / 2, innerW / 2, -r.h / 2, r.h / 2)
      rowObj.createComponent(FlexItem.getTypeName())
      this.cardRowObjects.push(rowObj)
      return txt
    })
  }

  // ---- visual synchronization & progressive disclosure ------------------------------------------

  syncVisuals(): void {
    const snap = this.engine.snapshot()
    const prov = this.engine.getProvenanceSummary()
    this.provenanceText.text = prov.bannerText + " (" + snap.provenance + ")"

    const hasFailures = snap.activeFailures.length > 0
    const ev = this.engine.activeEvent

    // Highlight active Project Island Portal
    for (const slot of PROJECT_ISLANDS) {
      const portalRmv = this.islandPortals[slot.id]
      if (portalRmv) {
        const isActiveProj = snap.projectId === slot.id
        this.setMaterialColor(portalRmv, isActiveProj ? COLOR_MINT : COLOR_SLATE)
      }
    }

    for (const m of CITY_MODULES) {
      const vis = this.moduleVisuals[m.moduleId]
      if (!vis) continue
      const isFailedMod = hasFailures && m.moduleId === "test-suite"
      const isEditedMod = ev !== null && m.moduleId === "server-lobby" && ev.kind === "tool_finished"
      const prefix = isFailedMod ? "[FAIL]" : isEditedMod ? "[CHG]" : "[PASS]"
      const col = isFailedMod ? COLOR_CORAL : isEditedMod ? COLOR_AMBER : COLOR_MINT
      vis.badgeText.text = prefix + " " + m.label
      vis.badgeText.textFill.color = col
      this.setMaterialColor(vis.rmv, isFailedMod ? COLOR_CORAL : isEditedMod ? COLOR_AMBER : COLOR_SLATE)
      if (vis.accentRmv) {
        this.setMaterialColor(vis.accentRmv, col)
      }
      for (const lRmv of vis.lampRmvs) {
        this.setMaterialColor(lRmv, isFailedMod ? COLOR_CORAL : COLOR_MINT)
      }

      const isSelected = snap.selectedModuleId === m.moduleId
      const lift = isSelected ? 1.15 : 1.0
      vis.root.getTransform().setLocalScale(
        new vec3(vis.baseSize.w * lift, vis.baseSize.h * lift, vis.baseSize.d * lift),
      )
    }

    // Move Primary Voxel Worker above active or selected module
    const targetMod =
      CITY_MODULES.find((m) => m.moduleId === snap.selectedModuleId) ||
      (ev && ev.kind === "test_completed"
        ? CITY_MODULES.find((m) => m.moduleId === "test-suite")
        : CITY_MODULES.find((m) => m.moduleId === "server-lobby")) ||
      CITY_MODULES[0]
    this.primaryVessel.getTransform().setLocalPosition(
      new vec3(targetMod.center.x, targetMod.center.y + targetMod.size.h / 2 + 2.0, targetMod.center.z),
    )
    this.subVessel.enabled = snap.glyph.lane === "subagent" || snap.cursorSeq >= 4
    this.faultMarker.enabled = hasFailures
    if (this.causalBeam) {
      this.causalBeam.enabled = hasFailures || snap.selectedModuleId === "server-lobby" || snap.sceneMode === "ERROR"
    }

    // Populate all 6 card rows deterministically (so LEAF L07/L08/L09/L10/L18 assertions always succeed)
    if (this.cardRows.length >= 6) {
      const diff = this.engine.currentProject.diffs[0]
      const trace = this.engine.traceChangeToTest("ev-fail-room03")
      if (snap.sceneMode === "LEARN") {
        const lc = this.engine.activeLearningCase
        this.cardRows[0].text = "LEARNING ATELIER: " + lc.title
        this.cardRows[0].textFill.color = COLOR_VIOLET
        this.cardRows[1].text = "Beginner: Which building flashes red when Friend #4 joins?"
        this.cardRows[2].text = snap.lastPrediction ? snap.lastPrediction.feedback : "Pinch Learn or the Testing Tower to answer!"
        this.cardRows[3].text = "Concept: Loop Engineering runs tests after every edit."
        this.cardRows[4].text = "Difficulty: " + this.engine.getAdaptiveDifficulty()
      } else if (hasFailures) {
        this.cardRows[0].text = "FAILURE ALERT · Room 03 Capacity Fault"
        this.cardRows[0].textFill.color = COLOR_CORAL
        this.cardRows[1].text = snap.explanation
        this.cardRows[2].text = "Causal: " + trace.explanation
        this.cardRows[3].text = diff ? "Diff: " + diff.beforeLine + " -> " + diff.afterLine : ""
        this.cardRows[4].text = "Pinch Approve to run verified repair test!"
      } else {
        this.cardRows[0].text = snap.testRepaired ? "VERIFIED PASS · 12/12 Tests Green" : "INSPECT · " + targetMod.label + " [" + snap.sceneMode + "]"
        this.cardRows[0].textFill.color = snap.testRepaired ? COLOR_MINT : COLOR_CYAN
        this.cardRows[1].text = snap.explanation
        this.cardRows[2].text = diff ? "Code: " + diff.beforeLine + " -> " + diff.afterLine : "No code diff active"
        this.cardRows[3].text = "Causal: " + trace.explanation
        this.cardRows[4].text = "Worker: " + snap.glyph.statusBadge + " " + snap.glyph.glyph
      }
      this.cardRows[5].text = prov.bannerText + " | Hash " + snap.stateHash

      // PROGRESSIVE DISCLOSURE VISIBILITY:
      // - World View: Hide the floating card completely when no failure, no module selected, and not in LEARN / APPROVAL_PENDING!
      // - Inspect / Beginner View: Show concise 3-row card (Rows 0, 1, 2).
      // - Engineer View: Show full technical evidence (Rows 0..5).
      const shouldShowCard =
        this.disclosureTier !== "WORLD" ||
        hasFailures ||
        snap.selectedModuleId !== null ||
        snap.sceneMode === "LEARN" ||
        snap.sceneMode === "APPROVAL_PENDING" ||
        snap.testRepaired

      this.cardRoot.enabled = shouldShowCard
      if (shouldShowCard) {
        const showEngineerRows =
          this.disclosureTier === "ENGINEER" ||
          hasFailures ||
          snap.sceneMode === "LEARN" ||
          snap.sceneMode === "APPROVAL_PENDING"
        for (let i = 0; i < this.cardRowObjects.length; i++) {
          this.cardRowObjects[i].enabled = i < 3 || showEngineerRows
        }
      }
    }
  }

  cardRowText(index: number): string {
    return this.cardRows[index] ? this.cardRows[index].text : ""
  }

  // ---- low-level helpers ------------------------------------------------------------------------

  private makeBoxObject(
    name: string,
    parent: SceneObject,
    pos: Vec3Cm,
    size: BoxSizeCm,
    color: vec4,
  ): SceneObject {
    const so = global.scene.createSceneObject(name)
    so.setParent(parent)
    const t = so.getTransform()
    t.setLocalPosition(new vec3(pos.x, pos.y, pos.z))
    t.setLocalScale(new vec3(size.w, size.h, size.d))
    if (this.boxMesh && this.baseMat) {
      const rmv = so.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
      rmv.mesh = this.boxMesh
      const mat = this.baseMat.clone()
      mat.mainPass.baseColor = color
      rmv.mainMaterial = mat
    }
    return so
  }

  private makeCylinderObject(
    name: string,
    parent: SceneObject,
    pos: Vec3Cm,
    size: BoxSizeCm,
    color: vec4,
  ): SceneObject {
    const so = global.scene.createSceneObject(name)
    so.setParent(parent)
    const t = so.getTransform()
    t.setLocalPosition(new vec3(pos.x, pos.y, pos.z))
    t.setLocalScale(new vec3(size.w, size.h, size.d))
    if (this.cylMesh && this.baseMat) {
      const rmv = so.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
      rmv.mesh = this.cylMesh
      const mat = this.baseMat.clone()
      mat.mainPass.baseColor = color
      rmv.mainMaterial = mat
    }
    return so
  }

  private setMaterialColor(rmv: RenderMeshVisual | null, color: vec4): void {
    if (rmv && rmv.mainMaterial && rmv.mainMaterial.mainPass) {
      rmv.mainMaterial.mainPass.baseColor = color
    }
  }

  private addText(parent: SceneObject, value: string, size: number, color: vec4): Text {
    const txt = parent.createComponent("Component.Text") as Text
    txt.text = value
    txt.size = size
    txt.depthTest = true
    txt.textFill.color = color
    txt.horizontalAlignment = HorizontalAlignment.Center
    txt.verticalAlignment = VerticalAlignment.Center
    return txt
  }

  private makeInteractable(so: SceneObject, onPinchRelease: () => void): Interactable {
    let collider = so.getComponent("Physics.ColliderComponent")
    if (!collider) {
      collider = so.getComponent("Physics.ColliderComponent") || so.createComponent("Physics.ColliderComponent")
      const shape = Shape.createBoxShape()
      shape.size = new vec3(1, 1, 1)
      collider.shape = shape
    }
    const interactable = so.createComponent(Interactable.getTypeName()) as Interactable
    interactable.targetingMode = 3
    interactable.onTriggerEnd.add(() => onPinchRelease())
    return interactable
  }

  private markPress(kind: BuildAlivePressRecord["kind"], target: string, pressMs: number): void {
    this.leafOrUserTouched = true
    if (this.onPlayAudio && this.latencyLog.length < 5) {
      this.onPlayAudio()
    }
    this.pendingPresses.push({kind, target, pressMs})
  }
}
