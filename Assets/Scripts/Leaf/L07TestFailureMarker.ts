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
export class BuildAliveL07TestFailureMarker extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    while (ba.engine.snapshot().cursorSeq < 5) ba.handleStep()
    const snap = ba.engine.snapshot()
    expectTrue(snap.activeFailures.length > 0, "active failure present at seq 5")
    expectTrue(findSceneObjectByName("FaultMarker_Room03").enabled, "FaultMarker_Room03 is enabled")
    expectTrue(ba.cardRowText(0).indexOf("FAILURE ALERT") >= 0, "card headline shows FAILURE ALERT")
    log("L07", "spatial fault marker and failure card verified")
  }
}
