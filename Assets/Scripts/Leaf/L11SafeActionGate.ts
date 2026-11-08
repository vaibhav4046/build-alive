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
export class BuildAliveL11SafeActionGate extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    ba.handleStageAction("run_known_test")
    expectTrue(ba.engine.snapshot().sceneMode === "APPROVAL_PENDING", "action staged in APPROVAL_PENDING")
    ba.handleReject()
    expectTrue(ba.engine.snapshot().sceneMode === "PROJECT_OVERVIEW", "reject returned to PROJECT_OVERVIEW")
    const interactor = new DefaultLeafInteractor()
    await press(interactor, "BA_ApproveButton")
    expectTrue(ba.engine.snapshot().receipts.length >= 2, "audit receipts recorded for deny and approve")
    log("L11", "safe action gate approve and reject verified")
  }
}
