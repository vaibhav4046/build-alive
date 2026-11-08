// EarthProofMain: Lens Studio adapter for the Ramp Climb trial.
// Outcome, numbers and the run state machine live in EarthProofSim / EarthProofFlow (pure, node-tested).
// This file moves the rover, spins the wheels, shows the cards and beam, handles block drops, and logs latency.
// Everything is pre-created; nothing is instantiated or allocated per run, and there are no network calls.
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {InteractableManipulation} from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation"
import {EarthProofControlsUI} from "./EarthProofControlsUI"
import {EarthProofCardsUI} from "./EarthProofCardsUI"
import {BuildAliveSceneUI} from "./BuildAliveSceneUI"
import {Flow, FlowEvent, RunState} from "./EarthProofFlow"
import {MOTORS, MotorId, snapsToMount} from "./EarthProofSim"
import {BLOCK_SIZE_CM, SLOT_GEARED, SLOT_SMALL, roverWorld} from "./EarthProofLayout"

export interface PressRecord {
  readonly kind: "run" | "reset" | "swap"
  readonly pressMs: number // Date.now() at the press handler entry
  readonly frameMs: number // Date.now() in the first LateUpdateEvent after the response was applied
  readonly latencyMs: number
}

const DEG = Math.PI / 180
const TWO_PI = Math.PI * 2
const NOMINAL_DT = 1 / 60 // the press handler applies one nominal step so the response is on the same frame
const TAP_MOVE_CM = 2 // a release that moved less than this is a tap (pinch without drag)
const TAP_MAX_MS = 400 // ... and so is a pinch released this quickly
const PLATE_TOP_CM = 0.4
const SEAT_LOCAL = new vec3(0, PLATE_TOP_CM + BLOCK_SIZE_CM / 2, 0) // block centre, in MotorMount space
const BEAM_THICKNESS_CM = 0.5
const BEAM_PULSE_CM = 0.15
const MARKER_TOP_OFFSET_CM = 2
const DIM_ALPHA = 0.35

interface Block {
  readonly id: MotorId
  readonly obj: SceneObject
  readonly label: Text | null
  readonly slotLocal: vec3
  mounted: boolean
  gestureStart: vec3 | null
  gestureT0: number
}

@component
export class EarthProofMain extends BaseScriptComponent {
  @input controls!: EarthProofControlsUI
  @input cards!: EarthProofCardsUI
  @input rover!: SceneObject
  @input wheelFL!: SceneObject
  @input wheelFR!: SceneObject
  @input wheelRL!: SceneObject
  @input wheelRR!: SceneObject
  @input mount!: SceneObject
  @input mountLabel!: SceneObject
  @input tray!: SceneObject
  @input blockSmall!: SceneObject
  @input blockGeared!: SceneObject
  @input beam!: SceneObject
  @input stallMarker!: SceneObject
  @input
  @allowUndefined
  chime: AudioTrackAsset | null = null
  @input
  @allowUndefined
  internetModule: InternetModule | null = null

  /** Press-to-first-frame log for done criterion 7. Read by the LEAF scenario. */
  readonly latencyLog: PressRecord[] = []
  /** What the last block release looked like (read by the LEAF drag scenario to calibrate a simulated hand). */
  lastDrop: {block: MotorId; movedCm: number; toSeatCm: number; tap: boolean} | null = null
  /** BUILD ALIVE desk-scale spatial AI engineering workbench mounted alongside the preserved Rover fallback. */
  readonly buildAlive = new BuildAliveSceneUI()

  private flow = new Flow()
  private wheelAngle = 0
  private beamLen = 1
  private beamClock = 0
  private blocks: Block[] = []
  private wheels: SceneObject[] = []
  private mountLabelText: Text | null = null
  private audio: AudioComponent | null = null
  private pending: {kind: PressRecord["kind"]; pressMs: number}[] = []
  private hideRoverOnFirstLateUpdate = false

  onAwake() {
    this.wheels = [this.wheelFL, this.wheelFR, this.wheelRL, this.wheelRR]
    this.mountLabelText = this.mountLabel.getComponent("Component.Text") as Text
    this.blocks = [
      this.makeBlock("small", this.blockSmall, SLOT_SMALL, true),
      this.makeBlock("geared", this.blockGeared, SLOT_GEARED, false),
    ]
    this.blocks.forEach((b) => this.addBlockInput(b))
    if (this.chime) {
      this.audio = this.rover.createComponent("Component.AudioComponent") as AudioComponent
      this.audio.audioTrack = this.chime
    }
    this.buildAlive.init(this, this.blockSmall, this.stallMarker, () => this.handleReset(), this.internetModule)

    this.createEvent("OnStartEvent").bind(() => this.start())
    this.createEvent("UpdateEvent").bind(() => {
      const dt = getDeltaTime()
      this.onFlowEvent(this.flow.step(dt))
      this.buildAlive.tick(dt)
    })
    this.createEvent("LateUpdateEvent").bind(() => {
      if (this.hideRoverOnFirstLateUpdate) {
        this.hideRoverOnFirstLateUpdate = false
        this.setRoverActive(false)
      }
      this.flushLatency()
      this.buildAlive.flushLatency()
    })
  }

  // ---- public API (UI events, LEAF scenarios) -------------------------------------------------

  handleRun(pressMs: number = Date.now()): void {
    this.hideRoverOnFirstLateUpdate = false
    this.setRoverActive(true)
    this.markPress("run", pressMs)
    if (!this.flow.run()) return // already running: ignored
    this.hideOutputs()
    this.controls.setRunDimmed(true)
    this.setTrayDim(true)
    this.onFlowEvent(this.flow.step(NOMINAL_DT)) // the response starts on this frame
  }

  handleReset(pressMs: number = Date.now()): void {
    this.hideRoverOnFirstLateUpdate = false
    this.setRoverActive(true)
    this.markPress("reset", pressMs)
    this.install("small")
  }

  handleSwap(id: MotorId, pressMs: number = Date.now()): void {
    this.hideRoverOnFirstLateUpdate = false
    this.setRoverActive(true)
    this.markPress("swap", pressMs)
    this.install(id)
  }

  snapshot(): {
    state: RunState
    installed: MotorId
    mountLabel: string
    sFront: number
    evidenceVisible: boolean
    proofVisible: boolean
    beamVisible: boolean
    smallMounted: boolean
    gearedMounted: boolean
    outcome: string
    needNcm: number
    hasNcm: number
    marginX: number
  } {
    const f = this.flow
    return {
      state: f.state,
      installed: f.installed,
      mountLabel: this.mountLabelText ? this.mountLabelText.text : "",
      sFront: f.sFront,
      evidenceVisible: this.cards.isEvidenceVisible,
      proofVisible: this.cards.isProofVisible,
      beamVisible: this.beam.enabled,
      smallMounted: this.blocks[0].mounted,
      gearedMounted: this.blocks[1].mounted,
      outcome: f.result.outcome,
      needNcm: f.result.needNcm,
      hasNcm: f.result.hasNcm,
      marginX: f.result.marginX,
    }
  }

  clearLatencyLog(): void {
    this.latencyLog.length = 0
    this.pending.length = 0
  }

  setRoverActive(active: boolean): void {
    if (this.rover) this.rover.enabled = active
    if (this.tray) this.tray.enabled = active
    if (this.mount) this.mount.enabled = active
    if (this.mountLabel) this.mountLabel.enabled = active
    if (this.stallMarker) this.stallMarker.enabled = active
    if (!active && this.beam) this.beam.enabled = false
    const root = this.getSceneObject()
    const count = root ? root.getChildrenCount() : 0
    for (let i = 0; i < count; i++) {
      const child = root.getChild(i)
      const name = child.name
      if (name === "Controls") {
        child.enabled = active
      } else if (name === "Course") {
        const cCount = child.getChildrenCount()
        for (let j = 0; j < cCount; j++) {
          const sub = child.getChild(j)
          if (sub.name === "Ramp" || sub.name === "TableLabel") {
            sub.enabled = active
          }
        }
      }
    }
  }

  // ---- setup ------------------------------------------------------------------------------------

  private start(): void {
    this.controls.onRun.add((t0) => this.handleRun(t0))
    this.controls.onReset.add((t0) => this.handleReset(t0))
    this.blocks.forEach((b) => this.bindBlockInput(b))
    this.install("small")
    this.hideRoverOnFirstLateUpdate = true
    print("[EarthProof] ready: BUILD ALIVE primary workbench active (Rover fallback standby)")
  }

  private makeBlock(id: MotorId, obj: SceneObject, slot: {x: number; y: number; z: number}, mounted: boolean): Block {
    const labelObj = obj.getChildrenCount() > 0 ? obj.getChild(0) : null
    return {
      id,
      obj,
      label: labelObj ? (labelObj.getComponent("Component.Text") as Text) : null,
      slotLocal: new vec3(slot.x, slot.y + PLATE_TOP_CM + BLOCK_SIZE_CM / 2, slot.z),
      mounted,
      gestureStart: null,
      gestureT0: 0,
    }
  }

  private addBlockInput(b: Block): void {
    let collider = b.obj.getComponent("Physics.ColliderComponent")
    if (!collider) {
      collider = b.obj.createComponent("Physics.ColliderComponent")
      const shape = Shape.createBoxShape()
      shape.size = new vec3(1, 1, 1) // unit box; the block's own 6 cm scale makes it 6 cm
      collider.shape = shape
    }
    const interactable = b.obj.createComponent(Interactable.getTypeName()) as Interactable
    interactable.targetingMode = 3 // direct touch or indirect ray
    const manipulation = b.obj.createComponent(InteractableManipulation.getTypeName()) as InteractableManipulation
    manipulation.enabled = true
  }

  private bindBlockInput(b: Block): void {
    const interactable = b.obj.getComponent(Interactable.getTypeName()) as Interactable
    interactable.onTriggerStart.add(() => {
      b.gestureStart = b.obj.getTransform().getWorldPosition()
      b.gestureT0 = Date.now()
    })
    const end = () => this.finishGesture(b)
    interactable.onTriggerEnd.add(end)
    interactable.onTriggerEndOutside.add(end)
    interactable.onTriggerCanceled.add(end)
  }

  // ---- block gestures ---------------------------------------------------------------------------

  private finishGesture(b: Block): void {
    const pressMs = Date.now()
    const start = b.gestureStart
    if (!start) return
    b.gestureStart = null
    if (b.mounted || this.flow.state === "running") {
      this.placeBlock(b, b.mounted) // ignored while mounted or running: it goes back where it was
      return
    }
    const pos = b.obj.getTransform().getWorldPosition()
    // A tap is a short pinch (released within TAP_MAX_MS) or one that barely moved the block. A simulated or real
    // hand can carry the block while it pinches, so a quick release counts as a tap whatever the hand travelled.
    const isTap = pos.distance(start) < TAP_MOVE_CM || Date.now() - b.gestureT0 < TAP_MAX_MS
    this.lastDrop = {block: b.id, movedCm: pos.distance(start), toSeatCm: pos.distance(this.seatWorld()), tap: isTap}
    if (isTap || snapsToMount(pos.distance(this.seatWorld()))) {
      this.handleSwap(b.id, pressMs)
    } else {
      this.placeBlock(b, false)
    }
  }

  private seatWorld(): vec3 {
    return this.mount.getTransform().getWorldTransform().multiplyPoint(SEAT_LOCAL)
  }

  private placeBlock(b: Block, mounted: boolean): void {
    b.mounted = mounted
    b.obj.setParent(mounted ? this.mount : this.tray)
    const t = b.obj.getTransform()
    t.setLocalPosition(mounted ? SEAT_LOCAL : b.slotLocal)
    t.setLocalRotation(quat.quatIdentity())
    t.setLocalScale(new vec3(BLOCK_SIZE_CM, BLOCK_SIZE_CM, BLOCK_SIZE_CM))
    if (b.label) b.label.enabled = !mounted
  }

  // ---- visuals ----------------------------------------------------------------------------------

  private install(id: MotorId): void {
    this.flow.install(id)
    this.blocks.forEach((b) => this.placeBlock(b, b.id === id))
    if (this.mountLabelText) this.mountLabelText.text = MOTORS[id].label
    this.hideOutputs()
    this.controls.setRunDimmed(false)
    this.setTrayDim(false)
  }

  private hideOutputs(): void {
    this.cards.hideEvidence()
    this.cards.hideProof()
    this.beam.enabled = false
    this.applyPose()
    this.spin(0)
  }

  private onFlowEvent(ev: FlowEvent): void {
    const f = this.flow
    if (f.state === "running" || ev !== "none") this.applyPose()
    if (f.wheelOmega !== 0) this.spin(getDeltaTime())
    if (ev === "stalled" || ev === "passed") {
      this.controls.setRunDimmed(false)
      this.setTrayDim(false)
      this.playChime()
      print("[EarthProof] " + ev + ": needs " + f.result.needNcm.toFixed(2) + " has " + f.result.hasNcm.toFixed(2))
    }
    if (ev === "passed") this.cards.showProof(f.result)
    if (ev === "evidence") this.showEvidence()
    if (f.state === "stalled") this.pulseBeam(getDeltaTime())
  }

  private showEvidence(): void {
    this.cards.showEvidence(this.flow.result)
    const from = this.stallMarker.getTransform().getWorldPosition().add(new vec3(0, MARKER_TOP_OFFSET_CM, 0))
    const to = this.seatWorld()
    const d = to.sub(from)
    this.beamLen = d.length
    if (this.beamLen > 0.01) {
      const t = this.beam.getTransform()
      t.setWorldPosition(from.add(to).uniformScale(0.5))
      t.setWorldRotation(quat.lookAt(d.uniformScale(1 / this.beamLen), vec3.up()))
      t.setLocalScale(new vec3(BEAM_THICKNESS_CM, BEAM_THICKNESS_CM, this.beamLen))
    }
    this.beam.enabled = true
  }

  private pulseBeam(dt: number): void {
    if (!this.beam.enabled) return
    this.beamClock += dt
    const w = BEAM_THICKNESS_CM + BEAM_PULSE_CM * Math.sin(this.beamClock * 7)
    this.beam.getTransform().setLocalScale(new vec3(w, w, this.beamLen))
  }

  private applyPose(): void {
    const p = roverWorld(this.flow.sFront)
    const t = this.rover.getTransform()
    t.setWorldPosition(new vec3(p.x, p.y, p.z))
    t.setWorldRotation(quat.fromEulerAngles(0, 0, p.pitchDeg * DEG))
  }

  private spin(dt: number): void {
    this.wheelAngle = (this.wheelAngle - this.flow.wheelOmega * dt) % TWO_PI // rolling toward +x turns clockwise
    const q = quat.fromEulerAngles(0, 0, this.wheelAngle)
    this.wheels.forEach((w) => w.getTransform().setLocalRotation(q))
  }

  private setTrayDim(dim: boolean): void {
    this.blocks.forEach((b) => {
      if (!b.label || b.mounted) return
      const c = b.label.textFill.color
      b.label.textFill.color = new vec4(c.r, c.g, c.b, dim ? DIM_ALPHA : 1)
    })
  }

  private playChime(): void {
    if (this.audio) this.audio.play(1)
  }

  // ---- latency log ------------------------------------------------------------------------------

  private markPress(kind: PressRecord["kind"], pressMs: number): void {
    this.pending.push({kind, pressMs})
  }

  /** LateUpdateEvent is the last script hook before the frame renders: the response has been applied by now. */
  private flushLatency(): void {
    if (this.pending.length === 0) return
    const frameMs = Date.now()
    for (const p of this.pending) {
      this.latencyLog.push({kind: p.kind, pressMs: p.pressMs, frameMs, latencyMs: frameMs - p.pressMs})
    }
    this.pending.length = 0
  }
}
