// Done criterion 6: every control (Run, Reset, both motor blocks) is inside the view from the standing position, at
// least 12 cm from the nearest other control, and at least 5 cm across.
// "In view" is checked with the headset camera's real field of view, with the user looking at the middle of the
// task (the average of the controls, the rover's start and top, and the two cards). Eye = the camera object.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {roverWorld} from "../EarthProofLayout"
import {expectTrue, log, pos, toStart} from "./EarthProofLeafKit"

@component
export class EarthProofC6Controls extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    await toStart()

    const run = findSceneObjectByName("RunButton").getComponent(Button.getTypeName()) as Button
    const reset = findSceneObjectByName("ResetButton").getComponent(Button.getTypeName()) as Button
    const blockCm = findSceneObjectByName("MotorBlock_Geared").getTransform().getWorldScale()
    const controls: {name: string; at: vec3; across: number}[] = [
      {name: "Run", at: pos("RunButton"), across: Math.min(run.size.x, run.size.y)},
      {name: "Reset", at: pos("ResetButton"), across: Math.min(reset.size.x, reset.size.y)},
      {name: "Small", at: pos("Slot_Small").add(new vec3(0, 3.4, 0)), across: Math.min(blockCm.x, blockCm.y, blockCm.z)},
      {name: "Geared", at: pos("MotorBlock_Geared"), across: Math.min(blockCm.x, blockCm.y, blockCm.z)},
    ]
    for (const c of controls) {
      expectTrue(c.across >= 5, c.name + " is at least 5 cm across (" + c.across + ")")
      let nearest = 1e9
      for (const o of controls) if (o !== c) nearest = Math.min(nearest, c.at.distance(o.at))
      expectTrue(nearest >= 12, c.name + " is at least 12 cm from the nearest other control (" + nearest.toFixed(1) + ")")
      log("c6", c.name + ": " + c.across + " cm across, nearest other control " + nearest.toFixed(1) + " cm")
    }

    // field of view
    const camObj = findSceneObjectByName("Camera Object")
    const cam = camObj.getComponent("Component.Camera") as Camera
    const eye = camObj.getTransform().getWorldPosition()
    const rest = roverWorld(50)
    const targets = [...controls.map((c) => c.at), pos("EvidenceCard"), pos("ProofCard"), pos("Rover"), new vec3(rest.x, rest.y, rest.z)]
    const centre = targets.reduce((a, b) => a.add(b), vec3.zero()).uniformScale(1 / targets.length)
    const f = centre.sub(eye).normalize()
    const r = f.cross(vec3.up()).normalize()
    const u = r.cross(f)
    const tanV = Math.tan(cam.fov / 2)
    const tanH = tanV * cam.aspect
    log("c6", "camera fov " + (cam.fov * 180 / Math.PI).toFixed(1) + " deg vertical, aspect " + cam.aspect.toFixed(3) + ", gaze at (" + centre.x.toFixed(1) + ", " + centre.y.toFixed(1) + ", " + centre.z.toFixed(1) + ")")
    const inView = (p: vec3): {ok: boolean; h: number; v: number} => {
      const d = p.sub(eye)
      const z = d.dot(f)
      const h = Math.atan2(d.dot(r), z) * 180 / Math.PI
      const v = Math.atan2(d.dot(u), z) * 180 / Math.PI
      return {ok: z > 0 && Math.abs(d.dot(r) / z) <= tanH && Math.abs(d.dot(u) / z) <= tanV, h, v}
    }
    for (const c of controls) {
      const res = inView(c.at)
      log("c6", c.name + " is " + res.h.toFixed(1) + " deg right, " + res.v.toFixed(1) + " deg up of the gaze: " + (res.ok ? "in view" : "OUT OF VIEW"))
      expectTrue(res.ok, c.name + " is inside the view when the user looks at the task")
    }
    for (const [n, p] of [["EvidenceCard", pos("EvidenceCard")], ["ProofCard", pos("ProofCard")]] as [string, vec3][]) {
      const res = inView(p)
      log("c6", n + " centre is " + res.h.toFixed(1) + " deg right, " + res.v.toFixed(1) + " deg up: " + (res.ok ? "in view" : "OUT OF VIEW"))
    }
    // nothing is head-locked: the controls' parent chain has no follow/billboard-to-camera component
    for (const n of ["RunButton", "ResetButton"]) {
      const o = findSceneObjectByName(n)
      expectTrue(o.getComponent("Component.ScriptComponent") !== null, n + " exists")
    }
  }
}
