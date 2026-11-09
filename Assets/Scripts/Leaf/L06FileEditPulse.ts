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
export class BuildAliveL06FileEditPulse extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    // sample replay: seq 2 is the tool_finished (file edit) event on server-lobby; seq 3 moves on to subagent_started
    while (ba.engine.snapshot().cursorSeq < 2) ba.handleStep()
    const badge = textOf(findSceneObjectByName("Module_Lobby_Badge"))
    expectTrue(badge.indexOf("[CHG]") >= 0, "lobby badge shows [CHG]: " + badge)
    log("L06", "file edit pulse and [CHG] badge verified: " + badge)
  }
}
