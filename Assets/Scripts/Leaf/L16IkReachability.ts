import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {createIKInteractor} from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {percentile} from "../EarthProofSim"
import {
  CITY_BRIDGES,
  CITY_MODULES,
  PROJECT_ISLANDS,
  RAIL_CONTROLS,
  auditControlErgonomics,
} from "../BuildAliveLayout"
import {makeSyntheticLiveEnvelope} from "../BuildAliveTransport"
import {exists, expectNear, expectTrue, getMain, interactable, log, pos, press, textOf} from "./EarthProofLeafKit"

async function toBuildAliveStart() {
  const main = getMain()
  main.buildAlive.handleReset()
  await sleep(120)
  return main.buildAlive
}

@component
export class BuildAliveL16IkReachability extends Scenario {
  private readonly ik = createIKInteractor()

  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    await this.ik.trigger(interactable("BA_StepButton"))
    expectTrue(ba.engine.snapshot().cursorSeq >= 1, "IK right hand triggered BA_StepButton")
    await this.ik.trigger(interactable("BA_ResetButton"), "left")
    expectTrue(ba.engine.snapshot().cursorSeq === 0, "IK left hand triggered BA_ResetButton")
    log("L16", "IK avatar reachability verified for BA_StepButton and BA_ResetButton")
  }
}
