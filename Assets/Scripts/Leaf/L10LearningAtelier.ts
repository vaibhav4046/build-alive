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
export class BuildAliveL10LearningAtelier extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    const interactor = new DefaultLeafInteractor()
    await press(interactor, "BA_LearnButton")
    expectTrue(ba.engine.snapshot().sceneMode === "LEARN", "entered LEARN mode")
    expectTrue(ba.cardRowText(0).indexOf("LEARNING ATELIER") >= 0, "card shows LEARNING ATELIER")
    await press(interactor, "BA_LearnButton")
    const snap = ba.engine.snapshot()
    expectTrue(snap.lastPrediction !== null && snap.lastPrediction.correct, "learning prediction answered correctly")
    log("L10", "learning atelier challenge verified")
  }
}
