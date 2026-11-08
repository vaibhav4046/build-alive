// EarthProofCardsUI: the evidence card (after a stall) and the proof card (after a pass).
// Both are built once at start (no allocation during a run) and shown/hidden by toggling `enabled`.
// Every number on a card comes from the ClimbResult that EarthProofSim produced for the run.
import {Billboard} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard"
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexAlign, FlexDirection, FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {ClimbResult, MOTORS, fmtMargin, fmtNcm} from "./EarthProofSim"
import {CARD_W, EVIDENCE_CARD, PROOF_CARD} from "./EarthProofLayout"

const CYAN = new vec4(0.45, 0.95, 1, 1)
const WHITE = new vec4(1, 1, 1, 1)
const AMBER = new vec4(1, 0.78, 0.2, 1)
const RED = new vec4(1, 0.42, 0.36, 1) // red is reserved for evidence
const DIM = new vec4(1, 1, 1, 0.7)

const CARD_WIDTH_CM = CARD_W
const PAD_CM = 1.0
const ROW_GAP_CM = 0.3
const CONTENT_Z_CM = 0.6
const INIT_SETTLE_S = 0.8 // cards stay alive (scale 0) this long so UIKit lays them out, then they hide

const TITLE = 70
const BODY = 58
const CAPTION = 40

interface Card {
  readonly root: SceneObject
  readonly rows: Text[]
  wantVisible: boolean
  settled: boolean
}

@component
export class EarthProofCardsUI extends BaseScriptComponent {
  private evidence!: Card
  private proof!: Card

  onAwake() {
    this.evidence = this.buildCard("EvidenceCard", EVIDENCE_CARD, [
      {text: "STALLED", size: TITLE, color: RED, h: 2.2},
      {text: "needs ? N.cm", size: BODY, color: WHITE, h: 1.7},
      {text: "has ? N.cm", size: BODY, color: WHITE, h: 1.7},
      {text: "short by ? N.cm", size: BODY, color: AMBER, h: 1.7},
      {text: "steep section, simplified teaching model", size: CAPTION, color: DIM, h: 2.2, wrap: true},
    ])
    this.proof = this.buildCard("ProofCard", PROOF_CARD, [
      {text: "EARTHPROOF", size: TITLE, color: CYAN, h: 2.2},
      {text: "Motor: ?", size: BODY, color: WHITE, h: 1.7},
      {text: "needs ? N.cm", size: BODY, color: WHITE, h: 1.7},
      {text: "has ? N.cm", size: BODY, color: WHITE, h: 1.7},
      {text: "margin ?", size: TITLE, color: CYAN, h: 2.2},
      {text: "? cm/s on the flat. Simplified teaching model, not a datasheet.", size: CAPTION, color: DIM, h: 2.6, wrap: true},
    ])
  }

  showEvidence(r: ClimbResult): void {
    const t = this.evidence.rows
    t[1].text = "needs " + fmtNcm(r.needNcm) + " N.cm"
    t[2].text = "has " + fmtNcm(r.hasNcm) + " N.cm"
    t[3].text = "short by " + fmtNcm(r.shortfallNcm) + " N.cm"
    this.show(this.evidence)
  }

  showProof(r: ClimbResult): void {
    const t = this.proof.rows
    t[1].text = "Motor: " + MOTORS[r.motorId].label
    t[2].text = "needs " + fmtNcm(r.needNcm) + " N.cm"
    t[3].text = "has " + fmtNcm(r.hasNcm) + " N.cm"
    t[4].text = "margin " + fmtMargin(r.marginX)
    t[5].text = r.speedCmS.toFixed(1) + " cm/s on the flat. Simplified teaching model, not a datasheet."
    this.show(this.proof)
  }

  hideEvidence(): void {
    this.hide(this.evidence)
  }

  hideProof(): void {
    this.hide(this.proof)
  }

  get isEvidenceVisible(): boolean {
    return this.evidence.root.enabled && this.evidence.settled
  }

  get isProofVisible(): boolean {
    return this.proof.root.enabled && this.proof.settled
  }

  private show(card: Card): void {
    card.wantVisible = true
    if (card.settled) card.root.enabled = true
  }

  private hide(card: Card): void {
    card.wantVisible = false
    if (card.settled) card.root.enabled = false
  }

  private buildCard(
    name: string,
    at: {x: number; y: number; z: number},
    spec: {text: string; size: number; color: vec4; h: number; wrap?: boolean}[],
  ): Card {
    const root = global.scene.createSceneObject(name)
    root.setParent(this.sceneObject)
    root.getTransform().setLocalPosition(new vec3(at.x, at.y, at.z))
    root.createComponent("Component.Canvas")
    root.createComponent(Billboard.getTypeName())
    const plate = root.createComponent(BackPlate.getTypeName()) as BackPlate

    const content = global.scene.createSceneObject("Content")
    content.setParent(root)
    content.getTransform().setLocalPosition(new vec3(0, 0, CONTENT_Z_CM))
    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.width = CARD_WIDTH_CM
    flex.height = -1
    flex.direction = FlexDirection.Column
    flex.justifyContent = FlexJustify.Start
    flex.alignItems = FlexAlign.Stretch
    flex.rowGap = ROW_GAP_CM
    flex.paddingTop = PAD_CM
    flex.paddingBottom = PAD_CM
    flex.paddingLeft = PAD_CM
    flex.paddingRight = PAD_CM
    flex.onLayoutComplete.add((result) => {
      plate.size = new vec2(result.containerWidth, result.containerHeight)
    })

    const innerW = CARD_WIDTH_CM - PAD_CM * 2
    const rows: Text[] = spec.map((row, i) => {
      const so = global.scene.createSceneObject("Row" + i)
      so.setParent(content)
      const text = so.createComponent("Component.Text") as Text
      text.text = row.text
      text.size = row.size
      text.depthTest = true
      text.textFill.color = row.color
      text.horizontalAlignment = HorizontalAlignment.Center
      text.verticalAlignment = VerticalAlignment.Center
      text.horizontalOverflow = row.wrap ? HorizontalOverflow.Wrap : HorizontalOverflow.Overflow
      text.verticalOverflow = VerticalOverflow.Overflow
      text.layoutRect = Rect.create(-innerW / 2, innerW / 2, -row.h / 2, row.h / 2)
      so.createComponent(FlexItem.getTypeName())
      return text
    })

    const card: Card = {root, rows, wantVisible: false, settled: false}
    // Stay alive but invisible while UIKit initialises and lays out, then hide: avoids a first-show layout spike.
    root.getTransform().setLocalScale(vec3.zero())
    const settle = this.createEvent("DelayedCallbackEvent")
    settle.bind(() => {
      card.settled = true
      root.getTransform().setLocalScale(vec3.one())
      root.enabled = card.wantVisible
    })
    settle.reset(INIT_SETTLE_S)
    return card
  }
}
