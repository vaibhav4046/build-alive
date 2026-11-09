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
  // The Lens boots into the REAL scanned workspace; the scripted L01-L22 story lives in the selectable Sample World.
  main.buildAlive.useSampleWorld()
  main.buildAlive.handleReset()
  await sleep(120)
  return main.buildAlive
}

@component
export class BuildAliveL08CausalChain extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    while (ba.engine.snapshot().cursorSeq < 5) ba.handleStep()
    const interactor = new DefaultLeafInteractor()
    await press(interactor, "Module_TestSuite")
    const snap = ba.engine.snapshot()
    expectTrue(snap.selectedModuleId === "test-suite", "Module_TestSuite selected")
    expectTrue(ba.cardRowText(2).indexOf("Likely cause") >= 0, "card row 2 shows the (hypothesis-labelled) likely cause: " + ba.cardRowText(2))
    log("L08", "causal chain inspection verified: " + ba.cardRowText(2))
  }
}
