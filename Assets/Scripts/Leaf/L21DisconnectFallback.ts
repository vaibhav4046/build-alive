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
export class BuildAliveL21DisconnectFallback extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    ba.engine.handleReconnect(true)
    expectTrue(ba.engine.snapshot().provenance === "LIVE_VERIFIED", "live connection sets LIVE_VERIFIED")
    ba.transport.disconnect()
    ba.syncVisuals()
    expectTrue(ba.engine.snapshot().provenance === "LOCAL_RECORDED_REPLAY", "disconnect falls back to LOCAL_RECORDED_REPLAY")
    log("L21", "disconnect fallback to LOCAL_RECORDED_REPLAY verified")
  }
}
