// EarthProofControlsUI: the two big pinch buttons (Run, Reset), built from UIKit Buttons.
// Events carry the press timestamp (Date.now() at handler entry) so the latency log starts at the press.
import Event, {PublicApi} from "SpectaclesInteractionKit.lspkg/Utils/Event"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {ElementContent} from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent"
import {BUTTON_SIZE, RESET_BUTTON, RUN_BUTTON} from "./EarthProofLayout"

const LABEL_SIZE = 62 // em-square size units, about 1.4 cm: large and glanceable at arm's length
const DIMMED_OPACITY = 0.4

@component
export class EarthProofControlsUI extends BaseScriptComponent {
  private runEvent = new Event<number>()
  private resetEvent = new Event<number>()
  private runButton: Button | null = null

  get onRun(): PublicApi<number> {
    return this.runEvent.publicApi()
  }

  get onReset(): PublicApi<number> {
    return this.resetEvent.publicApi()
  }

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    this.runButton = this.makeButton("RunButton", "Run", RUN_BUTTON, "Primary", (t0) => this.runEvent.invoke(t0))
    this.makeButton("ResetButton", "Reset", RESET_BUTTON, "PrimaryNeutral", (t0) => this.resetEvent.invoke(t0))
  }

  /** Dim Run while a run is in progress (it is ignored then). */
  setRunDimmed(dimmed: boolean): void {
    if (this.runButton) this.runButton.opacity = dimmed ? DIMMED_OPACITY : 1
  }

  private makeButton(
    name: string,
    label: string,
    at: {x: number; y: number; z: number},
    style: string,
    onPress: (pressMs: number) => void,
  ): Button {
    const so = global.scene.createSceneObject(name)
    so.setParent(this.sceneObject)
    so.getTransform().setLocalPosition(new vec3(at.x, at.y, at.z))

    const button = so.createComponent(Button.getTypeName()) as Button
    button.setVariant({theme: "SnapOS2", shape: "Rectangle", style})
    button.size = new vec3(BUTTON_SIZE.w, BUTTON_SIZE.h, 1)
    const content = so.createComponent(ElementContent.getTypeName()) as ElementContent
    content.text = label
    content.textSize = LABEL_SIZE
    button.initialize()

    button.onTriggerUp.add(() => onPress(Date.now()))
    return button
  }
}
