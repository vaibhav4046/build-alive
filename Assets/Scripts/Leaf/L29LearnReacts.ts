import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {RoundedRectangle} from "SpectaclesUIKit.lspkg/Scripts/Visuals/RoundedRectangle/RoundedRectangle"
import {FLOW_STAGES, stageForEvent} from "../BuildAliveProviders"
import {expectTrue, getMain, log, textOf} from "./EarthProofLeafKit"

// L29: the Learn window visibly reacts. The stage of the current step is lit with a solid accent fill (coral when the step is the
// failed check, so "Tests" glows red), every other stage stays plain, and the window shows that step's why + "Try next" lines.
@component
export class BuildAliveL29LearnReacts extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = getMain().buildAlive
    ba.useSampleWorld()
    ba.handleReset()
    await sleep(150)

    const fill = (stage: string): vec4 =>
      (findSceneObjectByName("FlowStageTile_" + stage).getComponent(RoundedRectangle.getTypeName()) as RoundedRectangle).backgroundColor

    expectTrue(textOf(findSceneObjectByName("LearnWhy")).indexOf("Try next") < 0, "no step is explained before any step happens")
    const sawStages: string[] = []
    let sawFailedTests = false
    for (let i = 0; i < 9; i++) {
      ba.handleStep()
      await sleep(90)
      const ev = ba.engine.activeEvent
      if (!ev) continue
      const stage = stageForEvent(ev.kind, ev.status)
      const name = FLOW_STAGES[stage]
      const f = fill(name)
      const plain = fill(FLOW_STAGES[(stage + 3) % FLOW_STAGES.length])
      expectTrue(Math.abs(f.x - plain.x) + Math.abs(f.y - plain.y) + Math.abs(f.z - plain.z) > 0.25, "step " + (i + 1) + ": the " + name + " stage has a solid accent fill, unlike an unlit stage")
      expectTrue(textOf(findSceneObjectByName("LearnWhy")).indexOf("Try next") >= 0, "step " + (i + 1) + ": the Learn window shows why and 'Try next' for this step")
      if (sawStages.indexOf(name) < 0) sawStages.push(name)
      if (ev.status === "failed") {
        sawFailedTests = true
        expectTrue(name === "Tests", "the failed check lights Tests (" + name + ")")
        expectTrue(f.x > f.z + 0.3, "the failed Tests stage glows coral/red, not the normal accent")
      }
    }
    expectTrue(sawFailedTests, "the replay reaches the failed check")
    expectTrue(sawStages.length >= 3, "several different stages lit while stepping (" + sawStages.join(",") + ")")
    log("L29", "learn reacts: stages lit " + sawStages.join(",") + "; failed check lights Tests in red with why + try next")
  }
}
