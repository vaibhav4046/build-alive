// BuildAliveSceneUI.ts
// Builds and animates the BUILD ALIVE v4 "living valley" inside the Lens Studio scene: a voxel valley that runs past the
// edges of the view (near ledge + waterfall, village plateau, river, rolling hills, snowy peaks, drifting clouds), the
// real-repo islands floating in the sky, one building per real module (its look follows the module's role), little
// voxel workers that walk to the module an agent event touched, and a single glass card on pinch.
// Static scenery is a handful of palette-textured voxel meshes (BuildAliveVoxel + BuildAliveWorldArt): few draw calls,
// zero per-frame allocations. Text is hidden by default; names appear on hover, detail only on request.
// Every object name the LEAF scenarios read (Island_*, Module_*, *_Badge, BA_*Button, ProvenanceBanner, DeskShelf,
// AgentVessel_*, RewindCrystal, FaultMarker_Room03, CausalFaultBeam, DataFlowPacket, Bridge_*) is preserved.

import {Billboard} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard"
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {ElementContent} from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexAlign, FlexDirection, FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {
  AllowlistedActionId,
  BuildAliveEngine,
  validateWorkspaceWorlds,
  WorkspaceWorldPayload,
} from "./BuildAliveCore"
import {WORKSPACE_SNAPSHOT, WORKSPACE_SNAPSHOT_META} from "./BuildAliveWorkspaceSnapshot"
import {
  AGENT_PRIMARY_HOME,
  AGENT_SUB_HOME,
  BoxSizeCm,
  BUILD_ALIVE_CARD_POS,
  BUILD_ALIVE_CARD_WIDTH_CM,
  CITY_BRIDGES,
  CITY_MODULES,
  FAULT_MARKER_POS,
  ModuleLayoutSpec,
  PLATEAU_Y,
  PROJECT_ISLANDS,
  PROVENANCE_BANNER_POS,
  RAIL_CONTROLS,
  REWIND_CRYSTAL,
  Vec3Cm,
} from "./BuildAliveLayout"
import {BuildAliveTransport} from "./BuildAliveTransport"
import {buildVoxelMesh, C, VoxelGrid} from "./BuildAliveVoxel"
import {
  BUILDING_ORIGIN,
  BuildingRole,
  buildBuilding,
  buildCloud,
  buildCrate,
  buildHourglass,
  buildIsland,
  buildMountains,
  buildPath,
  buildProps,
  buildPuff,
  buildTerrain,
  buildWarning,
  buildWater,
  buildWindmillSails,
  buildWorker,
  CLOUD_VOX,
  ISLAND_ORIGIN,
  MOUNTAIN_VOX,
  pathOrigin,
  PROP_VOX,
  riverCenterX,
  TERRAIN_VOX,
  WATER_TOP_Y,
  WORKER_ORIGIN,
  WORKER_VOX,
} from "./BuildAliveWorldArt"

/** The scripted recorded-replay project that stays selectable as "Sample World". */
const DEMO_SAMPLE_PROJECT_ID = "lobby-sync"

export interface BuildAlivePressRecord {
  readonly kind: "step" | "inspect" | "learn" | "approve" | "reset" | "island" | "module" | "rewind"
  readonly target: string
  readonly pressMs: number
  readonly frameMs: number
  readonly latencyMs: number
}

interface ModuleVisual {
  readonly moduleId: string
  readonly spec: ModuleLayoutSpec
  readonly root: SceneObject
  readonly art: SceneObject
  readonly rmv: RenderMeshVisual
  readonly mat: Material
  readonly sails: SceneObject
  readonly lamp: SceneObject
  readonly lampRmv: RenderMeshVisual | null
  readonly badgeText: Text
  role: BuildingRole
  tier: number
}

// Text / accent colours (UI only; the world itself uses the palette texture).
const COLOR_CYAN = new vec4(0.55, 0.92, 1.0, 1.0)
const COLOR_MINT = new vec4(0.45, 0.98, 0.72, 1.0)
const COLOR_AMBER = new vec4(1.0, 0.8, 0.35, 1.0)
const COLOR_CORAL = new vec4(1.0, 0.45, 0.4, 1.0)
const COLOR_VIOLET = new vec4(0.8, 0.66, 1.0, 1.0)
const COLOR_WHITE = new vec4(1.0, 0.98, 0.94, 1.0)
const COLOR_CAPTION = new vec4(0.86, 0.9, 0.96, 0.9)
const COLOR_DIM = new vec4(0.4, 0.42, 0.48, 1.0)
const TINT_NORMAL = new vec4(1, 1, 1, 1)
const TINT_CHANGED = new vec4(1.0, 0.9, 0.62, 1)
const TINT_FAILED = new vec4(1.0, 0.55, 0.5, 1)

const CARD_CONTENT_Z_CM = 0.6
const CARD_PAD_CM = 0.8
const CARD_ROW_GAP_CM = 0.2
const LABEL_TEXT_SIZE = 30
const BUTTON_LABEL_SIZE = 34

/** Plain-language words for module roles (hover names and the card). */
export const ROLE_WORD: Record<BuildingRole, string> = {
  UI: "screens people see",
  Logic: "code workshop",
  API: "connections in and out",
  Data: "stored data",
  Assets: "files and pictures",
  Tests: "checks",
}

/** Status words shown before a name (never colour alone). */
export const STATUS_WORD = {ok: "OK", changed: "Changed", running: "Working on it", broken: "Broken"} as const

const CLOUD_COUNT = 7
const DROPLET_COUNT = 10
const SMOKE_COUNT = 4

export class BuildAliveSceneUI {
  readonly engine = new BuildAliveEngine()
  readonly transport = new BuildAliveTransport(this.engine)
  readonly latencyLog: BuildAlivePressRecord[] = []

  private host!: BaseScriptComponent
  private rootObj!: SceneObject
  private boxMesh: RenderMesh | null = null
  private baseMat: Material | null = null
  private voxelMat: Material | null = null
  private meshCache: Record<string, RenderMesh[]> = {}

  private provenanceText!: Text
  private hintText: Text | null = null
  private islandObjects: Record<string, SceneObject> = {}
  private islandArt: Record<string, SceneObject | null> = {}
  private islandLabels: Record<string, Text> = {}
  private islandBaseY: Record<string, number> = {}
  private moduleVisuals: Record<string, ModuleVisual> = {}
  private bridgeObjects: Record<string, SceneObject> = {}
  private extraRoads: {id: string; from: string; to: string; obj: SceneObject}[] = []
  private primaryVessel!: SceneObject
  private primaryCrate!: SceneObject
  private primaryLabel: Text | null = null
  private subVessel!: SceneObject
  private rewindCrystal!: SceneObject
  private faultMarker!: SceneObject
  private causalBeam!: SceneObject
  private causalBeamLen = 1
  private dataPacket!: SceneObject
  private water: SceneObject | null = null
  private clouds: SceneObject[] = []
  private cloudSpeed: number[] = []
  private droplets: SceneObject[] = []
  private smoke: SceneObject[] = []
  private cardRoot!: SceneObject
  private cardRows: Text[] = []
  private cardRowObjects: SceneObject[] = []
  private cardFlex: FlexLayout | null = null
  private buttons: Record<string, Button> = {}
  private pendingPresses: {kind: BuildAlivePressRecord["kind"]; target: string; pressMs: number}[] = []
  private pulseClock = 0
  private autoDemoClock = 0
  private autoDemoPhase = 0
  private leafOrUserTouched = false
  private workspaceLoaded = false
  private workspaceSourceLabel = ""
  /** True only while a REAL scanned project is the current world; the bundled Sample World uses the scripted-story path. */
  private get workspaceBound(): boolean {
    return this.workspaceLoaded && this.engine.currentProject.provenance === "REAL_SCAN"
  }
  private slotProject: Record<string, string> = {}
  private disclosureTier: "WORLD" | "INSPECT" | "ENGINEER" = "WORLD"
  private hoveredId: string | null = null
  private everPinchedIsland = false
  private everPinchedModule = false
  private onPlayAudio: (() => void) | null = null
  private lastRequestId: string | null = null
  private lastNonce: string | null = null
  private walkTarget: vec3 = new vec3(AGENT_PRIMARY_HOME.x, AGENT_PRIMARY_HOME.y, AGENT_PRIMARY_HOME.z)
  private subTarget: vec3 = new vec3(AGENT_SUB_HOME.x, AGENT_SUB_HOME.y, AGENT_SUB_HOME.z)
  private scratchScale: vec3 = new vec3(1, 1, 1)
  private scratchPos: vec3 = new vec3(0, 0, 0)

  init(
    host: BaseScriptComponent,
    boxSource: SceneObject,
    _cylSource: SceneObject,
    onSelectEarthProofFallback?: () => void,
    internetModule: InternetModule | null = null,
    onPlayAudio?: () => void,
    useWorkspaceSnapshot: boolean = true,
    voxelMaterial: Material | null = null,
  ): void {
    this.host = host
    this.onPlayAudio = onPlayAudio || null
    const boxRmv = boxSource.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null
    this.boxMesh = boxRmv ? boxRmv.mesh : null
    this.baseMat = boxRmv && boxRmv.mainMaterial ? boxRmv.mainMaterial : null
    this.voxelMat = voxelMaterial
    if (!this.voxelMat) print("[BuildAlive] voxelMaterial input missing: world meshes will render with the fallback material")

    this.rootObj = global.scene.createSceneObject("BuildAliveRoot")
    this.rootObj.setParent(host.getSceneObject())
    this.rootObj.getTransform().setLocalPosition(vec3.zero())

    this.transport.onStateChanged = () => this.syncVisuals()
    this.transport.onWorkspace = (worlds) => this.bindWorkspace(worlds)

    this.buildLandscape()
    this.buildIslands(onSelectEarthProofFallback)
    this.buildVillage()
    this.buildWorkersAndMarkers()
    this.buildControlDock()
    this.buildGlassCard()
    if (useWorkspaceSnapshot) {
      // REAL scan of the approved repos, bundled at build time (see BuildAliveWorkspaceSnapshot.ts). Not a live feed.
      const checked = validateWorkspaceWorlds(WORKSPACE_SNAPSHOT)
      if (checked.ok) {
        this.bindWorkspace(checked.worlds, "real repo scan " + WORKSPACE_SNAPSHOT_META.scannedAt.slice(0, 10))
      } else {
        print("[BuildAlive] workspace snapshot rejected: " + (checked.error || "invalid"))
      }
    }
    if (internetModule) {
      this.transport.connect(internetModule)
    }
    this.syncVisuals()
  }

  // ---- public programmatic & SIK handlers (used by UIKit buttons and LEAF L01-L24) ---------------

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

  /** Binds real scanned projects (from the bridge) to the island shelf and the architecture slots. */
  bindWorkspace(worlds: WorkspaceWorldPayload[], sourceLabel: string = "LIVE BRIDGE SCAN"): void {
    const ids = this.engine.loadWorkspace(worlds)
    this.workspaceLoaded = true
    this.workspaceSourceLabel = sourceLabel
    this.leafOrUserTouched = true // stop the scripted sample tour: real data only
    this.disclosureTier = "WORLD"
    for (let k = 0; k < PROJECT_ISLANDS.length; k++) {
      const slot = PROJECT_ISLANDS[k]
      this.slotProject[slot.id] = ids[k]
      const real = k < worlds.length
      const lbl = this.islandLabels[slot.id]
      if (lbl) lbl.text = real ? worlds[k].name : "Sample World"
    }
    this.refreshIslandArt(worlds)
    this.syncVisuals()
  }

  /** Switches to one of the real scanned worlds by project id (e.g. "earthproof", "mnemosyne"). */
  useRealWorld(projectId: string): boolean {
    const ok = this.engine.selectProject(projectId)
    this.syncVisuals()
    return ok
  }

  /** Switches to the bundled sample project (scripted LobbySync story) without unbinding the real worlds. */
  useSampleWorld(): void {
    this.engine.selectProject(DEMO_SAMPLE_PROJECT_ID)
    this.syncVisuals()
  }

  handleSelectProject(projectId: string, pressMs: number = Date.now()) {
    this.markPress("island", projectId, pressMs)
    this.engine.selectProject(this.slotProject[projectId] || projectId)
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

  /** Dock "Details": deliberate request for engineer detail on the selected (or active) building. */
  handleDetails(pressMs: number = Date.now()) {
    this.markPress("inspect", "BA_InspectButton", pressMs)
    const snap = this.engine.snapshot()
    const proj = this.engine.currentProject
    const target =
      snap.selectedModuleId || snap.activeModuleId || (this.workspaceBound && proj.modules.length ? proj.modules[0].id : "server-lobby")
    if (snap.selectedModuleId !== target) this.engine.selectModule(target)
    this.disclosureTier = this.disclosureTier === "ENGINEER" ? "INSPECT" : "ENGINEER"
    this.syncVisuals()
    return this.engine.snapshot()
  }

  tick(dt: number): void {
    this.pulseClock += dt
    this.autoDemoClock += dt
    const t = this.pulseClock
    const snap = this.engine.snapshot()
    if (!snap.reducedMotion) {
      this.animateScenery(t, dt)
      this.animateWorkers(t, dt)
      this.animateMarkers(t)
    }

    // Calm auto-progression of the Sample World story when nobody has touched anything (never in a real world).
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

  private animateScenery(t: number, dt: number): void {
    for (let i = 0; i < this.clouds.length; i++) {
      const tr = this.clouds[i].getTransform()
      const p = tr.getLocalPosition()
      let x = p.x + this.cloudSpeed[i] * dt
      if (x > 120) x = -120
      this.scratchPos.x = x
      this.scratchPos.y = p.y
      this.scratchPos.z = p.z
      tr.setLocalPosition(this.scratchPos)
    }
    if (this.water) {
      this.scratchPos.x = 0
      this.scratchPos.y = 0.12 * Math.sin(t * 1.4)
      this.scratchPos.z = 0
      this.water.getTransform().setLocalPosition(this.scratchPos)
    }
    const fx = riverCenterX(-46)
    for (let i = 0; i < this.droplets.length; i++) {
      const u = (t * 0.55 + i / this.droplets.length) % 1
      this.scratchPos.x = fx - 2.6 + ((i * 7) % 11) * 0.5
      this.scratchPos.y = WATER_TOP_Y - u * 13
      this.scratchPos.z = -44.6 + ((i * 3) % 4) * 0.35
      this.droplets[i].getTransform().setLocalPosition(this.scratchPos)
    }
    for (const slot of PROJECT_ISLANDS) {
      const obj = this.islandObjects[slot.id]
      if (!obj) continue
      this.scratchPos.x = slot.center.x
      this.scratchPos.y = this.islandBaseY[slot.id] + 0.45 * Math.sin(t * 0.7 + slot.center.x * 0.07)
      this.scratchPos.z = slot.center.z
      obj.getTransform().setLocalPosition(this.scratchPos)
    }
    let smokeSource: ModuleVisual | null = null
    for (const m of CITY_MODULES) {
      const vis = this.moduleVisuals[m.moduleId]
      if (!vis || !vis.root.enabled) continue
      if (vis.sails.enabled) vis.sails.getTransform().setLocalRotation(quat.angleAxis(t * 0.9, vec3.forward()))
      if (vis.role === "Logic" && !smokeSource) smokeSource = vis
    }
    for (let i = 0; i < this.smoke.length; i++) {
      const puff = this.smoke[i]
      puff.enabled = smokeSource !== null
      if (!smokeSource) continue
      const u = (t * 0.32 + i / this.smoke.length) % 1
      const base = smokeSource.spec.center
      this.scratchPos.x = base.x + BUILDING_ORIGIN[0] + 5 * PROP_VOX + u * 1.2
      this.scratchPos.y = PLATEAU_Y + (16 + smokeSource.tier * 2) * PROP_VOX + u * 5
      this.scratchPos.z = base.z + BUILDING_ORIGIN[2] + 2.5 * PROP_VOX
      puff.getTransform().setLocalPosition(this.scratchPos)
      const s = 0.55 + u * 1.1
      this.scratchScale.x = s
      this.scratchScale.y = s
      this.scratchScale.z = s
      puff.getTransform().setLocalScale(this.scratchScale)
    }
  }

  private animateWorkers(t: number, dt: number): void {
    this.walk(this.primaryVessel, this.walkTarget, t, dt, 0)
    if (this.subVessel.enabled) this.walk(this.subVessel, this.subTarget, t, dt, 1.7)
  }

  /** Walk toward `target` at ~6 cm/s with a little hop, turning to face the way it goes. */
  private walk(obj: SceneObject, target: vec3, t: number, dt: number, phase: number): void {
    const tr = obj.getTransform()
    const p = tr.getLocalPosition()
    const dx = target.x - p.x
    const dz = target.z - p.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const moving = dist > 0.15
    const step = Math.min(dist, 6 * dt)
    this.scratchPos.x = moving ? p.x + (dx / dist) * step : target.x
    this.scratchPos.z = moving ? p.z + (dz / dist) * step : target.z
    this.scratchPos.y = target.y + (moving ? Math.abs(Math.sin(t * 9 + phase)) * 0.35 : 0.06 * Math.sin(t * 2 + phase))
    tr.setLocalPosition(this.scratchPos)
    if (moving) tr.setLocalRotation(quat.angleAxis(Math.atan2(dx, dz), vec3.up()))
  }

  private animateMarkers(t: number): void {
    if (this.faultMarker.enabled) {
      this.scratchPos.x = FAULT_MARKER_POS.x
      this.scratchPos.y = FAULT_MARKER_POS.y + 0.5 * Math.sin(t * 3)
      this.scratchPos.z = FAULT_MARKER_POS.z
      this.faultMarker.getTransform().setLocalPosition(this.scratchPos)
      this.faultMarker.getTransform().setLocalRotation(quat.angleAxis(t * 1.5, vec3.up()))
    }
    if (this.causalBeam.enabled) {
      const bw = 0.16 + 0.06 * Math.sin(t * 6.5)
      this.scratchScale.x = bw
      this.scratchScale.y = bw
      this.scratchScale.z = this.causalBeamLen
      this.causalBeam.getTransform().setLocalScale(this.scratchScale)
    }
    this.rewindCrystal.getTransform().setLocalRotation(quat.angleAxis(t * 0.6, vec3.up()))
    // a crate rolls along a real road touching the active module (or along the sample roads)
    let from: ModuleLayoutSpec | undefined
    let to: ModuleLayoutSpec | undefined
    if (this.workspaceBound) {
      const am = this.engine.snapshot().activeModuleId
      const edge = am ? this.engine.currentProject.edges.find((e) => e.from === am || e.to === am) : undefined
      from = edge ? CITY_MODULES.find((m) => m.moduleId === edge.from) : undefined
      to = edge ? CITY_MODULES.find((m) => m.moduleId === edge.to) : undefined
    } else {
      const b = CITY_BRIDGES[Math.floor(t * 0.5) % CITY_BRIDGES.length]
      from = CITY_MODULES.find((m) => m.moduleId === b.fromModuleId)
      to = CITY_MODULES.find((m) => m.moduleId === b.toModuleId)
    }
    this.dataPacket.enabled = !!(from && to)
    if (from && to) {
      const u = (t * 0.5) % 1
      this.scratchPos.x = from.center.x + (to.center.x - from.center.x) * u
      this.scratchPos.y = PLATEAU_Y + 0.25
      this.scratchPos.z = from.center.z + (to.center.z - from.center.z) * u
      this.dataPacket.getTransform().setLocalPosition(this.scratchPos)
    }
  }

  flushLatency(): void {
    if (this.pendingPresses.length === 0) return
    const frameMs = Date.now()
    for (const p of this.pendingPresses) {
      this.latencyLog.push({kind: p.kind, target: p.target, pressMs: p.pressMs, frameMs, latencyMs: frameMs - p.pressMs})
    }
    this.pendingPresses.length = 0
  }

  // ---- world construction -----------------------------------------------------------------------

  private buildLandscape(): void {
    const land = global.scene.createSceneObject("DeskShelf") // name kept for LEAF L01; it is the valley root
    land.setParent(this.rootObj)
    this.voxelObject("Valley_Terrain", land, buildTerrain(), TERRAIN_VOX, [0, 0, 0], null)
    this.voxelObject("Valley_Mountains", land, buildMountains(), MOUNTAIN_VOX, [0, 0, 0], null)
    this.voxelObject("Valley_Props", land, buildProps(), PROP_VOX, [0, 0, 0], null)
    this.water = this.voxelObject("Valley_River", land, buildWater(), TERRAIN_VOX, [0, 0, 0], null)

    const cloudSpots: Vec3Cm[] = [
      {x: -40, y: 8, z: -130}, {x: 10, y: 12, z: -150}, {x: 52, y: 6, z: -120}, {x: -80, y: 16, z: -190},
      {x: 75, y: 18, z: -200}, {x: -12, y: 22, z: -220}, {x: 30, y: 3, z: -110},
    ]
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const s = cloudSpots[i % cloudSpots.length]
      const c = this.voxelObject("Cloud_" + i, land, buildCloud(i + 1), CLOUD_VOX, [0, 0, 0], null)
      c.getTransform().setLocalPosition(new vec3(s.x, s.y, s.z))
      this.clouds.push(c)
      this.cloudSpeed.push(0.6 + (i % 3) * 0.35)
    }
    for (let i = 0; i < DROPLET_COUNT; i++) {
      this.droplets.push(this.voxelObject("Waterfall_Drop_" + i, land, null, 0.45, [-0.22, -0.22, -0.22], null, "drop" + (i % 2), () => buildPuff(i % 2 ? C.WATER_LT : C.CLOUD)))
    }
    for (let i = 0; i < SMOKE_COUNT; i++) {
      this.smoke.push(this.voxelObject("Chimney_Smoke_" + i, land, null, 0.6, [-0.3, -0.3, -0.3], null, "smoke", () => buildPuff(C.CLOUD)))
    }

    // Small honest status caption under the dock + one gentle hint (both plain language).
    const bannerObj = global.scene.createSceneObject("ProvenanceBanner")
    bannerObj.setParent(this.rootObj)
    bannerObj.getTransform().setLocalPosition(new vec3(PROVENANCE_BANNER_POS.x, PROVENANCE_BANNER_POS.y, PROVENANCE_BANNER_POS.z))
    bannerObj.getTransform().setLocalScale(new vec3(0.62, 0.62, 0.62))
    this.provenanceText = this.addText(bannerObj, "Sample world · made-up story · REPLAY", 30, COLOR_CAPTION)

    const hintObj = global.scene.createSceneObject("BA_Hint")
    hintObj.setParent(this.rootObj)
    hintObj.getTransform().setLocalPosition(new vec3(0, 6.5, -100))
    hintObj.createComponent(Billboard.getTypeName())
    hintObj.getTransform().setLocalScale(new vec3(1.6, 1.6, 1.6))
    this.hintText = this.addText(hintObj, "Pinch an island to choose a project", LABEL_TEXT_SIZE, COLOR_WHITE)
  }

  private buildIslands(onSelectEarthProofFallback?: () => void): void {
    for (const slot of PROJECT_ISLANDS) {
      const island = global.scene.createSceneObject(slot.sceneName)
      island.setParent(this.rootObj)
      island.getTransform().setLocalPosition(new vec3(slot.center.x, slot.center.y, slot.center.z))
      this.islandBaseY[slot.id] = slot.center.y
      this.islandObjects[slot.id] = island
      this.islandArt[slot.id] = null
      this.setIslandArt(slot.id, {seed: 11 + slot.center.x, houses: 5, roof: C.ROOF_RED, sample: false})

      const labelObj = global.scene.createSceneObject(slot.sceneName + "_Label")
      labelObj.setParent(island)
      labelObj.getTransform().setLocalPosition(new vec3(0, 7.2, 0))
      labelObj.createComponent(Billboard.getTypeName())
      labelObj.getTransform().setLocalScale(new vec3(1.5, 1.5, 1.5))
      this.islandLabels[slot.id] = this.addText(labelObj, slot.label, LABEL_TEXT_SIZE, COLOR_WHITE)
      labelObj.enabled = false

      this.makeInteractable(
        island,
        slot.size,
        () => {
          this.everPinchedIsland = true
          this.handleSelectProject(slot.id, Date.now())
          if (slot.id === "earthproof-rover" && onSelectEarthProofFallback && !this.workspaceLoaded) onSelectEarthProofFallback()
        },
        slot.id,
      )
    }
  }

  /** (Re)builds an island's voxel art (house count = real module count). */
  private setIslandArt(slotId: string, spec: {seed: number; houses: number; roof: number; sample: boolean}): void {
    const island = this.islandObjects[slotId]
    const old = this.islandArt[slotId]
    if (old) old.destroy()
    const key = "island:" + spec.seed + ":" + spec.houses + ":" + spec.roof + ":" + spec.sample
    this.islandArt[slotId] = this.voxelObject(island.name + "_Art", island, null, PROP_VOX, ISLAND_ORIGIN, null, key, () => buildIsland(spec))
  }

  /** Island art follows the bound worlds: house count = real module count; the third slot is the made-up Sample World. */
  private refreshIslandArt(worlds: WorkspaceWorldPayload[]): void {
    const roofs = [C.ROOF_RED, C.ROOF_BLUE, C.ROOF_TEAL]
    for (let k = 0; k < PROJECT_ISLANDS.length; k++) {
      const w = k < worlds.length ? worlds[k] : null
      this.setIslandArt(PROJECT_ISLANDS[k].id, {seed: 31 + k * 17, houses: w ? w.clusters.length : 0, roof: roofs[k % roofs.length], sample: !w})
    }
  }

  private buildVillage(): void {
    for (const m of CITY_MODULES) {
      const obj = global.scene.createSceneObject(m.sceneName)
      obj.setParent(this.rootObj)
      obj.getTransform().setLocalPosition(new vec3(m.center.x, m.center.y, m.center.z))

      const art = global.scene.createSceneObject(m.sceneName + "_Art")
      art.setParent(obj)
      art.getTransform().setLocalPosition(new vec3(0, -m.size.h / 2, 0))
      const rmv = art.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
      const mat = (this.voxelMat || (this.baseMat as Material)).clone()
      rmv.mainMaterial = mat

      const sails = this.voxelObject(m.sceneName + "_Sails", art, null, PROP_VOX, [-0.25, -0.25, 0], null, "sails", () => buildWindmillSails())
      sails.enabled = false
      const lamp = this.voxelObject(m.sceneName + "_Lamp", art, null, PROP_VOX, [-0.25, -0.25, -0.25], null, "warning", () => buildWarning())
      lamp.enabled = false
      const lampBox = this.makeBoxObject(m.sceneName + "_LampGlow", art, {x: 0, y: 0, z: 0}, {w: 1.1, h: 1.1, d: 1.1}, COLOR_MINT)
      lampBox.enabled = false

      const badgeObj = global.scene.createSceneObject(m.sceneName + "_Badge")
      badgeObj.setParent(obj)
      badgeObj.getTransform().setLocalPosition(new vec3(0, m.size.h / 2 + 2.6, 0))
      badgeObj.createComponent(Billboard.getTypeName())
      badgeObj.getTransform().setLocalScale(new vec3(1.15, 1.15, 1.15))
      const badgeText = this.addText(badgeObj, STATUS_WORD.ok + " · " + m.label, LABEL_TEXT_SIZE, COLOR_WHITE)

      this.makeInteractable(
        obj,
        m.size,
        () => {
          this.everPinchedModule = true
          if (this.engine.snapshot().sceneMode === "LEARN") this.handleLearn(m.moduleId, Date.now())
          else this.handleInspect(m.moduleId, Date.now())
        },
        m.moduleId,
      )
      const vis: ModuleVisual = {
        moduleId: m.moduleId,
        spec: m,
        root: obj,
        art,
        rmv,
        mat,
        sails,
        lamp,
        lampRmv: lampBox.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null,
        badgeText,
        role: m.role,
        tier: -1,
      }
      this.moduleVisuals[m.moduleId] = vis
      this.setBuilding(vis, m.role, 1)
    }

    // Stepping-stone paths between buildings (sample roads; in real worlds only REAL resolved imports are shown).
    let seed = 1
    const makePath = (name: string, a: ModuleLayoutSpec, b: ModuleLayoutSpec, verified: boolean): SceneObject => {
      const dx = b.center.x - a.center.x
      const dz = b.center.z - a.center.z
      const len = Math.max(1, Math.sqrt(dx * dx + dz * dz))
      const so = this.voxelObject(name, this.rootObj, buildPath(len, verified, seed++), PROP_VOX, pathOrigin(len), null)
      so.getTransform().setLocalPosition(new vec3((a.center.x + b.center.x) / 2, PLATEAU_Y, (a.center.z + b.center.z) / 2))
      so.getTransform().setLocalRotation(quat.angleAxis(Math.atan2(dx, dz), vec3.up()))
      return so
    }
    for (const b of CITY_BRIDGES) {
      const A = CITY_MODULES.find((m) => m.moduleId === b.fromModuleId) as ModuleLayoutSpec
      const B = CITY_MODULES.find((m) => m.moduleId === b.toModuleId) as ModuleLayoutSpec
      this.bridgeObjects[b.bridgeId] = makePath(b.sceneName, A, B, b.verified)
    }
    for (let i = 0; i < CITY_MODULES.length; i++) {
      for (let j = i + 1; j < CITY_MODULES.length; j++) {
        const A = CITY_MODULES[i]
        const B = CITY_MODULES[j]
        const covered = CITY_BRIDGES.some(
          (b) => (b.fromModuleId === A.moduleId && b.toModuleId === B.moduleId) || (b.fromModuleId === B.moduleId && b.toModuleId === A.moduleId),
        )
        if (covered) continue
        const road = makePath("Road_" + A.moduleId + "_" + B.moduleId, A, B, true)
        road.enabled = false
        this.extraRoads.push({id: "road-" + A.moduleId + "-" + B.moduleId, from: A.moduleId, to: B.moduleId, obj: road})
      }
    }
  }

  /** Shows the building for `role` (cached mesh per role+tier); windmills get sails, watchtowers a lamp. */
  private setBuilding(vis: ModuleVisual, role: BuildingRole, tier: number): void {
    if (vis.role === role && vis.tier === tier) return
    vis.role = role
    vis.tier = tier
    vis.rmv.mesh = this.meshesFor("building:" + role + ":" + tier, () => buildBuilding(role, tier), PROP_VOX, BUILDING_ORIGIN)[0]
    const up = tier * 2
    vis.sails.enabled = role === "API"
    if (role === "API") vis.sails.getTransform().setLocalPosition(new vec3(0, (13.5 + up) * PROP_VOX, 0.4 + 4.6 * PROP_VOX))
    const lampY = (role === "Tests" ? 19.5 + up : 18 + up) * PROP_VOX
    vis.lamp.getTransform().setLocalPosition(new vec3(0, lampY + 1.2, 0))
    const glow = vis.lampRmv ? vis.lampRmv.getSceneObject() : null
    if (glow) {
      glow.getTransform().setLocalPosition(new vec3(0, lampY, 0))
      glow.enabled = role === "Tests"
    }
  }

  private buildWorkersAndMarkers(): void {
    this.primaryVessel = this.voxelObject("AgentVessel_Primary", this.rootObj, buildWorker(C.CYAN, C.GOLD), WORKER_VOX, WORKER_ORIGIN, null)
    this.primaryVessel.getTransform().setLocalPosition(this.walkTarget)
    this.primaryCrate = this.voxelObject("AgentVessel_Primary_Crate", this.primaryVessel, buildCrate(), WORKER_VOX, [-0.5, 1.0, 0.45], null)
    this.primaryCrate.enabled = false
    const pLabel = global.scene.createSceneObject("AgentVessel_Primary_Label")
    pLabel.setParent(this.primaryVessel)
    pLabel.getTransform().setLocalPosition(new vec3(0, 5.2, 0))
    pLabel.createComponent(Billboard.getTypeName())
    this.primaryLabel = this.addText(pLabel, "", LABEL_TEXT_SIZE, COLOR_CYAN)
    pLabel.enabled = false

    this.subVessel = this.voxelObject("AgentVessel_Sub01", this.rootObj, buildWorker(C.VIOLET, C.CLOUD), WORKER_VOX, WORKER_ORIGIN, null)
    this.subVessel.getTransform().setLocalPosition(this.subTarget)

    this.rewindCrystal = global.scene.createSceneObject(REWIND_CRYSTAL.sceneName)
    this.rewindCrystal.setParent(this.rootObj)
    this.rewindCrystal.getTransform().setLocalPosition(new vec3(REWIND_CRYSTAL.center.x, REWIND_CRYSTAL.center.y, REWIND_CRYSTAL.center.z))
    this.voxelObject("RewindCrystal_Art", this.rewindCrystal, buildHourglass(), PROP_VOX, [-0.25, -0.25, -0.25], null)
    const rLabel = global.scene.createSceneObject("RewindCrystal_Label")
    rLabel.setParent(this.rewindCrystal)
    rLabel.getTransform().setLocalPosition(new vec3(0, 4.2, 0))
    rLabel.createComponent(Billboard.getTypeName())
    this.addText(rLabel, "Rewind one step", LABEL_TEXT_SIZE, COLOR_AMBER)
    rLabel.enabled = false
    this.makeInteractable(this.rewindCrystal, REWIND_CRYSTAL.size, () => this.handleRewind(undefined, Date.now()), "rewind")

    this.faultMarker = global.scene.createSceneObject("FaultMarker_Room03")
    this.faultMarker.setParent(this.rootObj)
    this.faultMarker.getTransform().setLocalPosition(new vec3(FAULT_MARKER_POS.x, FAULT_MARKER_POS.y, FAULT_MARKER_POS.z))
    this.voxelObject("FaultMarker_Art", this.faultMarker, null, 0.7, [-0.35, -0.35, -0.35], null, "warning07", () => buildWarning())
    const fLabel = global.scene.createSceneObject("FaultMarker_Label")
    fLabel.setParent(this.faultMarker)
    fLabel.getTransform().setLocalPosition(new vec3(0, 3.4, 0))
    fLabel.createComponent(Billboard.getTypeName())
    this.addText(fLabel, "A check failed", LABEL_TEXT_SIZE, COLOR_CORAL)

    const lobby = CITY_MODULES.find((m) => m.moduleId === "server-lobby") || CITY_MODULES[1]
    const fromVec = new vec3(FAULT_MARKER_POS.x, FAULT_MARKER_POS.y - 1.5, FAULT_MARKER_POS.z)
    const toVec = new vec3(lobby.center.x, lobby.center.y + lobby.size.h / 2 + 1, lobby.center.z)
    const diffVec = toVec.sub(fromVec)
    this.causalBeamLen = Math.max(0.1, diffVec.length)
    const midVec = fromVec.add(toVec).uniformScale(0.5)
    this.causalBeam = this.makeBoxObject("CausalFaultBeam", this.rootObj, {x: midVec.x, y: midVec.y, z: midVec.z}, {w: 0.18, h: 0.18, d: this.causalBeamLen}, COLOR_CORAL)
    this.causalBeam.getTransform().setLocalRotation(quat.lookAt(diffVec.uniformScale(1 / this.causalBeamLen), vec3.up()))

    this.dataPacket = this.voxelObject("DataFlowPacket", this.rootObj, buildCrate(), 0.3, [-0.6, 0, -0.6], null)
  }

  private buildControlDock(): void {
    const rail = global.scene.createSceneObject("BuildAliveControls")
    rail.setParent(this.rootObj)
    rail.getTransform().setLocalPosition(vec3.zero())
    rail.createComponent("Component.Canvas")

    for (const spec of RAIL_CONTROLS) {
      const so = global.scene.createSceneObject(spec.sceneName)
      so.setParent(rail)
      so.getTransform().setLocalPosition(new vec3(spec.center.x, spec.center.y, spec.center.z))
      // tilt the dock up toward the eye so the pills read as a tray, not a wall
      so.getTransform().setLocalRotation(quat.angleAxis(-0.42, vec3.right()))

      const btn = so.createComponent(Button.getTypeName()) as Button
      btn.setVariant({
        theme: "SnapOS2",
        shape: "Pill",
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
        else if (spec.sceneName === "BA_InspectButton") this.handleDetails(t0)
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
    this.cardRoot.getTransform().setLocalPosition(new vec3(BUILD_ALIVE_CARD_POS.x, BUILD_ALIVE_CARD_POS.y, BUILD_ALIVE_CARD_POS.z))
    this.cardRoot.createComponent("Component.Canvas")
    this.cardRoot.createComponent(Billboard.getTypeName())
    const plate = this.cardRoot.createComponent(BackPlate.getTypeName()) as BackPlate

    const content = global.scene.createSceneObject("BuildAliveCardContent")
    content.setParent(this.cardRoot)
    content.getTransform().setLocalPosition(new vec3(0, 0, CARD_CONTENT_Z_CM))
    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    this.cardFlex = flex
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
      {size: 38, color: COLOR_WHITE, h: 1.7, wrap: false, left: false},
      {size: 28, color: COLOR_WHITE, h: 1.9, wrap: true, left: true},
      {size: 26, color: COLOR_CAPTION, h: 1.8, wrap: true, left: true},
      {size: 22, color: COLOR_AMBER, h: 1.5, wrap: true, left: true},
      {size: 22, color: COLOR_MINT, h: 1.5, wrap: true, left: true},
      {size: 18, color: COLOR_CAPTION, h: 1.2, wrap: true, left: true},
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
      txt.horizontalAlignment = r.left ? HorizontalAlignment.Left : HorizontalAlignment.Center
      txt.verticalAlignment = VerticalAlignment.Center
      txt.horizontalOverflow = r.wrap ? HorizontalOverflow.Wrap : HorizontalOverflow.Shrink
      txt.verticalOverflow = r.wrap ? VerticalOverflow.Shrink : VerticalOverflow.Overflow
      txt.layoutRect = Rect.create(-innerW / 2, innerW / 2, -r.h / 2, r.h / 2)
      rowObj.createComponent(FlexItem.getTypeName())
      this.cardRowObjects.push(rowObj)
      return txt
    })
    this.cardRoot.enabled = false
  }

  // ---- visual synchronization & progressive disclosure ------------------------------------------

  syncVisuals(): void {
    const snap = this.engine.snapshot()
    const prov = this.engine.getProvenanceSummary()
    const live = prov.connectionState === "LIVE"
    this.provenanceText.text = this.workspaceBound
      ? this.engine.currentProject.title + " · " + this.workspaceSourceLabel + " · " + (live ? "LIVE agent" : "REPLAY · no live agent connected")
      : "Sample world · made-up story · " + (live ? "LIVE" : "REPLAY")

    const hasFailures = snap.activeFailures.length > 0
    const ev = this.engine.activeEvent
    const proj = this.engine.currentProject
    const activeMod = snap.activeModuleId
    const realFail = this.workspaceBound && ev !== null && ev.kind === "test_completed" && ev.status === "failed" && activeMod !== null

    if (this.hintText) {
      const hintObj = this.hintText.getSceneObject()
      if (!this.everPinchedIsland) {
        this.hintText.text = "Pinch an island to choose a project"
        hintObj.enabled = true
      } else if (!this.everPinchedModule) {
        this.hintText.text = "Pinch a building to look inside"
        hintObj.enabled = true
      } else hintObj.enabled = false
    }

    for (const slot of PROJECT_ISLANDS) {
      const isActiveProj = snap.projectId === (this.slotProject[slot.id] || slot.id)
      const lbl = this.islandLabels[slot.id]
      if (lbl) {
        lbl.getSceneObject().enabled = this.hoveredId === slot.id || isActiveProj
        lbl.textFill.color = isActiveProj ? COLOR_MINT : COLOR_WHITE
      }
      const s = isActiveProj ? 1.12 : 1.0
      const obj = this.islandObjects[slot.id]
      if (obj) obj.getTransform().setLocalScale(new vec3(s, s, s))
    }

    for (const m of CITY_MODULES) {
      const vis = this.moduleVisuals[m.moduleId]
      if (!vis) continue
      const pm = proj.modules.find((x) => x.id === m.moduleId)
      if (this.workspaceBound) {
        vis.root.enabled = !!pm
        if (!pm) continue
      } else vis.root.enabled = true
      const role = (pm ? pm.role : m.role) as BuildingRole
      const files = pm ? pm.files.length : 12
      this.setBuilding(vis, role, files > 40 ? 2 : files > 10 ? 1 : 0)

      const name = pm ? pm.label : m.label
      const evHere = this.workspaceBound && ev !== null && activeMod === m.moduleId
      const isFailedMod = this.workspaceBound ? evHere && realFail : hasFailures && m.moduleId === "test-suite"
      const isEditedMod = this.workspaceBound ? evHere && !realFail : ev !== null && m.moduleId === "server-lobby" && ev.kind === "tool_finished"
      let status = this.workspaceBound ? "" : STATUS_WORD.ok
      if (isFailedMod) status = STATUS_WORD.broken
      else if (isEditedMod) status = this.workspaceBound && ev!.status === "running" ? STATUS_WORD.running : STATUS_WORD.changed
      const col = isFailedMod ? COLOR_CORAL : isEditedMod ? COLOR_AMBER : COLOR_WHITE
      const isSelected = snap.selectedModuleId === m.moduleId
      vis.badgeText.text = (status ? status + " · " : "") + name + (isSelected || this.hoveredId === m.moduleId ? " — " + ROLE_WORD[role] : "")
      vis.badgeText.textFill.color = col
      vis.badgeText.getSceneObject().enabled = isSelected || isFailedMod || isEditedMod || this.hoveredId === m.moduleId
      vis.mat.mainPass.baseColor = isFailedMod ? TINT_FAILED : isEditedMod ? TINT_CHANGED : TINT_NORMAL
      if (vis.lampRmv) this.setMaterialColor(vis.lampRmv, isFailedMod ? COLOR_CORAL : this.workspaceBound && !evHere ? COLOR_DIM : COLOR_MINT)
      vis.lamp.enabled = isEditedMod && vis.role !== "Tests"
      const lift = isSelected ? 1.08 : 1.0
      vis.art.getTransform().setLocalScale(new vec3(lift, lift, lift))
    }

    // Roads: real resolved import edges only (workspace mode); the sample world keeps its fixed roads.
    if (this.workspaceBound) {
      const has = (a: string, b: string): boolean => proj.edges.some((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a))
      for (const b of CITY_BRIDGES) {
        const obj = this.bridgeObjects[b.bridgeId]
        if (obj) obj.enabled = has(b.fromModuleId, b.toModuleId)
      }
      for (const r of this.extraRoads) r.obj.enabled = has(r.from, r.to)
    } else {
      for (const b of CITY_BRIDGES) {
        const obj = this.bridgeObjects[b.bridgeId]
        if (obj) obj.enabled = true
      }
      for (const r of this.extraRoads) r.obj.enabled = false
    }

    // The builder walks to the door of the module the event touched (or the one you picked).
    const wantedId = snap.selectedModuleId || (this.workspaceBound ? activeMod : null)
    const firstReal = this.workspaceBound && proj.modules.length > 0 ? proj.modules[0].id : null
    const targetMod =
      CITY_MODULES.find((m) => m.moduleId === wantedId) ||
      (this.workspaceBound
        ? CITY_MODULES.find((m) => m.moduleId === firstReal)
        : ev && ev.kind === "test_completed"
          ? CITY_MODULES.find((m) => m.moduleId === "test-suite")
          : CITY_MODULES.find((m) => m.moduleId === "server-lobby")) ||
      CITY_MODULES[0]
    const idle = this.workspaceBound && !ev && !snap.selectedModuleId
    this.walkTarget.x = idle ? AGENT_PRIMARY_HOME.x : targetMod.center.x + 2.6
    this.walkTarget.y = PLATEAU_Y
    this.walkTarget.z = idle ? AGENT_PRIMARY_HOME.z : targetMod.center.z + targetMod.size.d / 2 + 1.0
    this.primaryCrate.enabled = ev !== null && (ev.kind === "tool_finished" || ev.kind === "tool_started")
    if (this.primaryLabel) {
      // honest: a real world with no observed event says so; the sample world names its made-up robot
      this.primaryLabel.text = this.workspaceBound ? (ev ? "Agent: " + ev.actor : "No agent connected") : "Builder robot (sample)"
      this.primaryLabel.getSceneObject().enabled = this.hoveredId === "agent" || (this.workspaceBound && !ev && this.everPinchedModule)
    }
    this.subVessel.enabled = this.workspaceBound
      ? ev !== null && ev.actor.indexOf("subagent") === 0
      : snap.glyph.lane === "subagent" || snap.cursorSeq >= 4
    const testMod = CITY_MODULES.find((m) => m.moduleId === "test-suite") || CITY_MODULES[5]
    this.subTarget.x = testMod.center.x - 2.4
    this.subTarget.y = PLATEAU_Y
    this.subTarget.z = testMod.center.z + testMod.size.d / 2 + 1.2
    this.faultMarker.enabled = hasFailures || realFail
    this.causalBeam.enabled = this.workspaceBound ? realFail : hasFailures || snap.selectedModuleId === "server-lobby" || snap.sceneMode === "ERROR"

    if (this.workspaceBound) this.fillRealCard(snap, ev, proj, activeMod, realFail, prov.bannerText)
    else this.fillSampleCard(snap, hasFailures, targetMod, prov.bannerText)
  }

  /** Real workspace: card rows come only from scanned data + observed events (no sample story). */
  private fillRealCard(
    snap: ReturnType<BuildAliveEngine["snapshot"]>,
    ev: BuildAliveEngine["activeEvent"],
    proj: BuildAliveEngine["currentProject"],
    activeMod: string | null,
    realFail: boolean,
    banner: string,
  ): void {
    if (this.cardRows.length < 6) return
    const mid = snap.selectedModuleId || activeMod
    const rows = mid ? this.engine.describeModule(mid) : null
    const pm = mid ? proj.modules.find((x) => x.id === mid) : undefined
    const head = pm ? pm.label + " · " + ROLE_WORD[pm.role as BuildingRole] + " · " + proj.title : proj.title
    if (realFail && ev) {
      this.cardRows[0].text = "Broken · " + head
      this.cardRows[0].textFill.color = COLOR_CORAL
      this.cardRows[1].text = ev.summary || "A check failed (no output was captured)"
    } else {
      this.cardRows[0].text = head
      this.cardRows[0].textFill.color = COLOR_WHITE
      this.cardRows[1].text = rows ? rows[1] : "Pinch a building to look inside"
    }
    this.cardRows[2].text = rows ? rows[2].replace("Imports:", "Uses:") : "Paths only appear for imports we really found"
    this.cardRows[3].text = rows ? rows[3] : ev ? "Last event " + ev.eventId : "No agent event seen yet"
    this.cardRows[4].text = rows ? rows[4] : ""
    this.cardRows[5].text = banner + (ev ? " | " + ev.eventId + " " + ev.timestamp.slice(11, 19) : "")
    const show = this.disclosureTier !== "WORLD" || realFail || snap.selectedModuleId !== null || snap.sceneMode === "APPROVAL_PENDING"
    this.cardRoot.enabled = show
    if (show) this.setCardRowsVisible(this.disclosureTier === "ENGINEER" || snap.sceneMode === "APPROVAL_PENDING")
  }

  /** Sample World: the scripted, clearly-labelled made-up story (LobbySync), in plain words first. */
  private fillSampleCard(snap: ReturnType<BuildAliveEngine["snapshot"]>, hasFailures: boolean, targetMod: ModuleLayoutSpec, banner: string): void {
    if (this.cardRows.length < 6) return
    const diff = this.engine.currentProject.diffs[0]
    const trace = this.engine.traceChangeToTest("ev-fail-room03")
    if (snap.sceneMode === "LEARN") {
      const lc = this.engine.activeLearningCase
      this.cardRows[0].text = "Lesson · " + lc.title
      this.cardRows[0].textFill.color = COLOR_VIOLET
      this.cardRows[1].text = "When a 4th friend joins the room, which building breaks?"
      this.cardRows[2].text = snap.lastPrediction ? snap.lastPrediction.feedback : "Pinch the building you think broke"
      this.cardRows[3].text = "Idea: the robot runs the checks again after every change"
      this.cardRows[4].text = "Level: " + this.engine.getAdaptiveDifficulty()
    } else if (hasFailures) {
      this.cardRows[0].text = "Broken · the room lets in too many people"
      this.cardRows[0].textFill.color = COLOR_CORAL
      this.cardRows[1].text = snap.explanation
      this.cardRows[2].text = "Likely cause (a guess, not proof): " + trace.explanation
      this.cardRows[3].text = diff ? "Change: " + diff.beforeLine + " -> " + diff.afterLine : ""
      this.cardRows[4].text = "Pinch Approve to run the check again"
    } else {
      this.cardRows[0].text = snap.testRepaired ? "Fixed · all 12 checks pass" : targetMod.label + " · " + ROLE_WORD[targetMod.role]
      this.cardRows[0].textFill.color = snap.testRepaired ? COLOR_MINT : COLOR_WHITE
      this.cardRows[1].text = snap.explanation
      this.cardRows[2].text = diff ? "Change: " + diff.beforeLine + " -> " + diff.afterLine : "No code change yet"
      this.cardRows[3].text = "Likely cause: " + trace.explanation
      this.cardRows[4].text = "Robot: " + snap.glyph.statusBadge + " " + snap.glyph.glyph
    }
    this.cardRows[5].text = banner + " | state " + snap.stateHash
    const show =
      this.disclosureTier !== "WORLD" ||
      hasFailures ||
      snap.selectedModuleId !== null ||
      snap.sceneMode === "LEARN" ||
      snap.sceneMode === "APPROVAL_PENDING" ||
      snap.testRepaired
    this.cardRoot.enabled = show
    if (show) this.setCardRowsVisible(this.disclosureTier === "ENGINEER" || snap.sceneMode === "APPROVAL_PENDING")
  }

  /** Rows 0-2 always show; rows 3+ only on "Details" (engineer layer). FlexLayout skips disabled rows. */
  private setCardRowsVisible(showEngineerRows: boolean): void {
    let changed = false
    for (let i = 0; i < this.cardRowObjects.length; i++) {
      const want = i < 3 || showEngineerRows
      if (this.cardRowObjects[i].enabled !== want) {
        this.cardRowObjects[i].enabled = want
        changed = true
      }
    }
    if (changed && this.cardFlex) this.cardFlex.markDirty()
  }

  cardRowText(index: number): string {
    return this.cardRows[index] ? this.cardRows[index].text : ""
  }

  // ---- low-level helpers ------------------------------------------------------------------------

  /** Cached RenderMeshes for a voxel recipe (one per UInt16 chunk). */
  private meshesFor(key: string, make: () => VoxelGrid, voxCm: number, origin: [number, number, number]): RenderMesh[] {
    const hit = this.meshCache[key]
    if (hit) return hit
    const meshes = buildVoxelMesh(make(), voxCm, origin).map((c) => {
      const mb = new MeshBuilder([
        {name: "position", components: 3},
        {name: "normal", components: 3, normalized: true},
        {name: "texture0", components: 2},
      ])
      mb.topology = MeshTopology.Triangles
      mb.indexType = MeshIndexType.UInt16
      mb.appendVerticesInterleaved(c.verts)
      mb.appendIndices(c.indices)
      mb.updateMesh()
      return mb.getMesh()
    })
    this.meshCache[key] = meshes
    return meshes
  }

  /** A scene object showing a voxel grid (one RenderMeshVisual per chunk), palette material unless `mat` is given. */
  private voxelObject(
    name: string,
    parent: SceneObject,
    grid: VoxelGrid | null,
    voxCm: number,
    origin: [number, number, number],
    mat: Material | null,
    cacheKey?: string,
    make?: () => VoxelGrid,
  ): SceneObject {
    const so = global.scene.createSceneObject(name)
    so.setParent(parent)
    const key = cacheKey || "obj:" + name
    const meshes = this.meshesFor(key, () => (grid ? grid : (make as () => VoxelGrid)()), voxCm, origin)
    const material = mat || this.voxelMat || this.baseMat
    for (const mesh of meshes) {
      const rmv = so.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
      rmv.mesh = mesh
      if (material) rmv.mainMaterial = material
    }
    return so
  }

  private makeBoxObject(name: string, parent: SceneObject, pos: Vec3Cm, size: BoxSizeCm, color: vec4): SceneObject {
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

  private setMaterialColor(rmv: RenderMeshVisual | null, color: vec4): void {
    if (rmv && rmv.mainMaterial && rmv.mainMaterial.mainPass) rmv.mainMaterial.mainPass.baseColor = color
  }

  private addText(parent: SceneObject, value: string, size: number, color: vec4): Text {
    const txt = parent.createComponent("Component.Text") as Text
    txt.text = value
    txt.size = size
    txt.depthTest = false
    txt.textFill.color = color
    txt.horizontalAlignment = HorizontalAlignment.Center
    txt.verticalAlignment = VerticalAlignment.Center
    return txt
  }

  /** Box collider of `size` (object is unscaled) + SIK Interactable; hover shows the plain-language name. */
  private makeInteractable(so: SceneObject, size: BoxSizeCm, onPinchRelease: () => void, hoverId: string): Interactable {
    const collider = so.createComponent("Physics.ColliderComponent") as ColliderComponent
    const shape = Shape.createBoxShape()
    shape.size = new vec3(size.w, size.h, size.d)
    collider.shape = shape
    const interactable = so.createComponent(Interactable.getTypeName()) as Interactable
    interactable.targetingMode = 3
    interactable.onTriggerEnd.add(() => onPinchRelease())
    interactable.onHoverEnter.add(() => {
      this.hoveredId = hoverId
      this.syncVisuals()
    })
    interactable.onHoverExit.add(() => {
      if (this.hoveredId === hoverId) this.hoveredId = null
      this.syncVisuals()
    })
    return interactable
  }

  private markPress(kind: BuildAlivePressRecord["kind"], target: string, pressMs: number): void {
    this.leafOrUserTouched = true
    if (this.onPlayAudio && this.latencyLog.length < 5) this.onPlayAudio()
    this.pendingPresses.push({kind, target, pressMs})
  }
}
