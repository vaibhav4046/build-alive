// BuildAliveSceneUI.ts
// Constructs and updates the desk-scale 3D BUILD ALIVE spatial workbench inside the Lens Studio scene.
// Pre-allocates all 3D meshes (DeskShelf, 3 Project Islands, 6 Architecture City modules, 5 dependency bridges,
// 2 Agent Vessels, RewindCrystal, FaultMarker_Room03), 5 UIKit front-rail Buttons, ProvenanceBanner,
// and 1 billboarded UIKit BackPlate + FlexLayout BuildAliveCard with +0.6 cm Z-lift.
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

const COLOR_CYAN = new vec4(0.28, 0.92, 1.0, 1.0)
const COLOR_MINT = new vec4(0.24, 0.96, 0.68, 1.0)
const COLOR_AMBER = new vec4(1.0, 0.78, 0.22, 1.0)
const COLOR_CORAL = new vec4(1.0, 0.38, 0.34, 1.0)
const COLOR_VIOLET = new vec4(0.76, 0.54, 1.0, 1.0)
const COLOR_SLATE = new vec4(0.22, 0.28, 0.38, 1.0)
const COLOR_SHELF = new vec4(0.14, 0.18, 0.25, 1.0)
const COLOR_WHITE = new vec4(0.96, 0.98, 1.0, 1.0)
const COLOR_CAPTION = new vec4(0.78, 0.86, 0.96, 0.85)

const CARD_CONTENT_Z_CM = 0.6
const CARD_PAD_CM = 1.0
const CARD_ROW_GAP_CM = 0.28
const BUTTON_LABEL_SIZE = 54

interface ModuleVisual {
  readonly moduleId: string
  readonly root: SceneObject
  readonly rmv: RenderMeshVisual | null
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
  private moduleVisuals: Record<string, ModuleVisual> = {}
  private bridgeObjects: Record<string, SceneObject> = {}
  private primaryVessel!: SceneObject
  private subVessel!: SceneObject
  private rewindCrystal!: SceneObject
  private faultMarker!: SceneObject
  private causalBeam!: SceneObject
  private causalBeamLen = 1
  private dataPacket!: SceneObject
  private cardRoot!: SceneObject
  private cardRows: Text[] = []
  private buttons: Record<string, Button> = {}
  private pendingPresses: {kind: BuildAlivePressRecord["kind"]; target: string; pressMs: number}[] = []
  private pulseClock = 0
  private autoDemoClock = 0
  private autoDemoPhase = 0
  private leafOrUserTouched = false
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
  ): void {
    this.host = host
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
    this.syncVisuals()
    return this.engine.snapshot()
  }

  handleInspect(moduleId: string = "server-lobby", pressMs: number = Date.now()) {
    this.markPress("inspect", moduleId, pressMs)
    this.engine.selectModule(moduleId)
    this.syncVisuals()
    return this.engine.snapshot()
  }

  handleLearn(guessedModuleId?: string, pressMs: number = Date.now()) {
    this.markPress("learn", "BA_LearnButton", pressMs)
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
    if (!this.lastRequestId || !this.lastNonce) {
      this.handleStageAction(actionId)
    }
    if (this.lastRequestId && this.lastNonce) {
      // Ensure connectionState allows local test retry when offline
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
    this.syncVisuals()
    return this.engine.snapshot()
  }

  handleReset(pressMs: number = Date.now()) {
    this.markPress("reset", "BA_ResetButton", pressMs)
    this.lastRequestId = null
    this.lastNonce = null
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
    if (!snap.reducedMotion && this.faultMarker && this.faultMarker.enabled) {
      const pulse = 1 + 0.08 * Math.sin(this.pulseClock * 5)
      this.scratchScale.x = FAULT_MARKER_SIZE.w * pulse
      this.scratchScale.y = FAULT_MARKER_SIZE.h
      this.scratchScale.z = FAULT_MARKER_SIZE.d * pulse
      this.faultMarker.getTransform().setLocalScale(this.scratchScale)
    }
    if (!snap.reducedMotion && this.causalBeam && this.causalBeam.enabled) {
      const bw = 0.55 + 0.16 * Math.sin(this.pulseClock * 6.5)
      this.scratchScale.x = bw
      this.scratchScale.y = bw
      this.scratchScale.z = this.causalBeamLen
      this.causalBeam.getTransform().setLocalScale(this.scratchScale)
    }
    if (!snap.reducedMotion && this.dataPacket) {
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
    // Live Preview Observatory auto-progression when idle (calm 9.5s human-readable pacing per block)
    if (!this.leafOrUserTouched && this.autoDemoClock >= 2.2) {
      const stepIdx = Math.floor((this.autoDemoClock - 2.2) / 9.5) % 9
      if (stepIdx !== this.autoDemoPhase) {
        this.autoDemoPhase = stepIdx
        if (stepIdx === 0) {
          this.engine.reset()
          this.engine.stepForward()
        } else if (stepIdx === 1 || stepIdx === 2 || stepIdx === 3) {
          this.engine.stepForward()
        } else if (stepIdx === 4) {
          this.engine.selectModule("server-lobby")
        } else if (stepIdx === 5) {
          this.engine.enterLearningMode()
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

  // ---- scene construction -----------------------------------------------------------------------

  private buildShelfAndProvenance(): void {
    this.makeBoxObject("DeskShelf", this.rootObj, DESK_CENTER, DESK_SIZE, COLOR_SHELF)

    const bannerObj = global.scene.createSceneObject("ProvenanceBanner")
    bannerObj.setParent(this.rootObj)
    bannerObj.getTransform().setLocalPosition(
      new vec3(PROVENANCE_BANNER_POS.x, PROVENANCE_BANNER_POS.y, PROVENANCE_BANNER_POS.z),
    )
    bannerObj.createComponent(Billboard.getTypeName())
    this.provenanceText = this.addText(bannerObj, "SIMULATED IN PREVIEW • LOCAL_RECORDED_REPLAY", 44, COLOR_CYAN)
  }

  private buildIslands(onSelectEarthProofFallback?: () => void): void {
    for (const slot of PROJECT_ISLANDS) {
      const proj = DEMO_PROJECTS.find((p) => p.projectId === slot.id) || DEMO_PROJECTS[0]
      const island = this.makeBoxObject(
        slot.sceneName,
        this.rootObj,
        slot.center,
        slot.size,
        slot.id === "lobby-sync" ? COLOR_CYAN : slot.id === "edge-guard" ? COLOR_VIOLET : COLOR_MINT,
      )
      const labelObj = global.scene.createSceneObject(slot.sceneName + "_Label")
      labelObj.setParent(island)
      labelObj.getTransform().setLocalPosition(new vec3(0, 1.3, 0))
      this.addText(labelObj, proj.title, 38, COLOR_WHITE)

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
      const obj = this.makeBoxObject(m.sceneName, this.rootObj, m.center, m.size, COLOR_SLATE)
      const rmv = obj.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null

      const badgeObj = global.scene.createSceneObject(m.sceneName + "_Badge")
      badgeObj.setParent(obj)
      badgeObj.getTransform().setLocalPosition(new vec3(0, 0.85, 0))
      const badgeText = this.addText(badgeObj, "[PASS] " + m.label, 34, COLOR_WHITE)

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
        badgeText,
        baseSize: m.size,
      }
    }

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
        {w: 0.45, h: 0.45, d: len},
        b.verified ? COLOR_CYAN : COLOR_SLATE,
      )
      bridge.getTransform().setLocalRotation(quat.lookAt(d.uniformScale(1 / len), vec3.up()))
      this.bridgeObjects[b.bridgeId] = bridge
    }
  }

  private buildVesselsAndMarkers(): void {
    this.primaryVessel = this.makeCylinderObject(
      "AgentVessel_Primary",
      this.rootObj,
      AGENT_PRIMARY_HOME,
      AGENT_VESSEL_SIZE,
      COLOR_CYAN,
    )
    const pLabel = global.scene.createSceneObject("AgentVessel_Primary_Label")
    pLabel.setParent(this.primaryVessel)
    pLabel.getTransform().setLocalPosition(new vec3(0, 1.1, 0))
    this.addText(pLabel, "[AGT] Primary Agent", 34, COLOR_CYAN)

    this.subVessel = this.makeCylinderObject(
      "AgentVessel_Sub01",
      this.rootObj,
      AGENT_SUB_HOME,
      AGENT_VESSEL_SIZE,
      COLOR_VIOLET,
    )
    const sLabel = global.scene.createSceneObject("AgentVessel_Sub01_Label")
    sLabel.setParent(this.subVessel)
    sLabel.getTransform().setLocalPosition(new vec3(0, 1.1, 0))
    this.addText(sLabel, "[AGT] Subagent Verifier", 32, COLOR_VIOLET)

    this.rewindCrystal = this.makeBoxObject(
      REWIND_CRYSTAL.sceneName,
      this.rootObj,
      REWIND_CRYSTAL.center,
      REWIND_CRYSTAL.size,
      COLOR_AMBER,
    )
    const rLabel = global.scene.createSceneObject("RewindCrystal_Label")
    rLabel.setParent(this.rewindCrystal)
    rLabel.getTransform().setLocalPosition(new vec3(0, 0.9, 0))
    this.addText(rLabel, "[CHG] Rewind Crystal", 34, COLOR_AMBER)
    this.makeInteractable(this.rewindCrystal, () => this.handleRewind(undefined, Date.now()))

    this.faultMarker = this.makeCylinderObject(
      "FaultMarker_Room03",
      this.rootObj,
      FAULT_MARKER_POS,
      FAULT_MARKER_SIZE,
      COLOR_CORAL,
    )
    const fLabel = global.scene.createSceneObject("FaultMarker_Label")
    fLabel.setParent(this.faultMarker)
    fLabel.getTransform().setLocalPosition(new vec3(0, 0.9, 0))
    this.addText(fLabel, "[FAIL] test-room-03", 36, COLOR_CORAL)

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
      {w: 0.55, h: 0.55, d: this.causalBeamLen},
      COLOR_CORAL,
    )
    this.causalBeam.getTransform().setLocalRotation(quat.lookAt(diffVec.uniformScale(1 / this.causalBeamLen), vec3.up()))

    this.dataPacket = this.makeBoxObject(
      "DataFlowPacket",
      this.rootObj,
      {x: lobbyMod.center.x, y: lobbyMod.center.y + 0.65, z: lobbyMod.center.z},
      {w: 1.1, h: 1.1, d: 1.1},
      COLOR_CYAN,
    )
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
      {size: 62, color: COLOR_CYAN, h: 2.1, wrap: false},
      {size: 48, color: COLOR_WHITE, h: 1.7, wrap: true},
      {size: 46, color: COLOR_WHITE, h: 1.7, wrap: true},
      {size: 46, color: COLOR_AMBER, h: 1.7, wrap: true},
      {size: 44, color: COLOR_MINT, h: 1.7, wrap: true},
      {size: 38, color: COLOR_CAPTION, h: 2.0, wrap: true},
    ]

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
      return txt
    })
  }

  // ---- visual synchronization -------------------------------------------------------------------

  syncVisuals(): void {
    const snap = this.engine.snapshot()
    const prov = this.engine.getProvenanceSummary()
    this.provenanceText.text = prov.bannerText + " (" + snap.provenance + ")"

    const hasFailures = snap.activeFailures.length > 0
    const ev = this.engine.activeEvent

    for (const m of CITY_MODULES) {
      const vis = this.moduleVisuals[m.moduleId]
      if (!vis) continue
      const isFailedMod = hasFailures && m.moduleId === "test-suite"
      const isEditedMod = ev !== null && m.moduleId === "server-lobby" && ev.kind === "tool_finished"
      const prefix = isFailedMod ? "[FAIL]" : isEditedMod ? "[CHG]" : "[PASS]"
      const col = isFailedMod ? COLOR_CORAL : isEditedMod ? COLOR_AMBER : COLOR_MINT
      vis.badgeText.text = prefix + " " + m.label
      vis.badgeText.textFill.color = col
      this.setMaterialColor(vis.rmv, col)

      const isSelected = snap.selectedModuleId === m.moduleId
      const lift = isSelected ? 1.15 : 1.0
      vis.root.getTransform().setLocalScale(
        new vec3(vis.baseSize.w * lift, vis.baseSize.h * lift, vis.baseSize.d * lift),
      )
    }

    // Move Primary Vessel above active or selected module
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

    if (this.cardRows.length >= 6) {
      const diff = this.engine.currentProject.diffs[0]
      const trace = this.engine.traceChangeToTest("ev-fail-room03")
      if (snap.sceneMode === "LEARN") {
        const lc = this.engine.activeLearningCase
        this.cardRows[0].text = "LEARNING ATELIER: " + lc.title
        this.cardRows[0].textFill.color = COLOR_VIOLET
        this.cardRows[1].text = "Kid Question: Which building breaks when Friend #4 joins?"
        this.cardRows[2].text = snap.lastPrediction ? snap.lastPrediction.feedback : "Pinch Learn or the Test building to guess!"
        this.cardRows[3].text = "Why: Changing > 4 to >= 4 locks out the 4th friend!"
        this.cardRows[4].text = "Learner Mode: Check your homework loop (" + this.engine.getAdaptiveDifficulty() + ")"
      } else if (hasFailures) {
        this.cardRows[0].text = "OOPS! BUG FOUND IN ROOM 03"
        this.cardRows[0].textFill.color = COLOR_CORAL
        this.cardRows[1].text = "Friend #4 got locked out! (" + snap.explanation + ")"
        this.cardRows[2].text = "Causal: " + trace.explanation
        this.cardRows[3].text = diff ? "Fix: " + diff.beforeLine + " -> " + diff.afterLine : ""
        this.cardRows[4].text = "You are the Boss: Pinch Approve to test & fix it!"
      } else {
        this.cardRows[0].text = snap.testRepaired ? "YAY! ALL 12/12 TESTS PASSED!" : "AI HELPER AT WORK [" + snap.sceneMode + "]"
        this.cardRows[0].textFill.color = snap.testRepaired ? COLOR_MINT : COLOR_CYAN
        this.cardRows[1].text = snap.explanation
        this.cardRows[2].text = diff ? "Code Change: " + diff.beforeLine + " -> " + diff.afterLine : "No code change yet"
        this.cardRows[3].text = "Causal: " + trace.explanation
        this.cardRows[4].text = "AI Bot: " + snap.glyph.statusBadge + " " + snap.glyph.glyph
      }
      this.cardRows[5].text = prov.bannerText + " | Hash " + snap.stateHash
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
    this.pendingPresses.push({kind, target, pressMs})
  }
}
