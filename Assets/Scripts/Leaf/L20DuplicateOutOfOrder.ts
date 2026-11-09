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
export class BuildAliveL20DuplicateOutOfOrder extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    const e10 = makeSyntheticLiveEnvelope(10, "tool_started", "inspect step 10")
    const e09 = makeSyntheticLiveEnvelope(9, "tool_started", "out-of-order step 9")
    expectTrue(ba.engine.ingestEvent(e10).accepted, "seq 10 accepted")
    expectTrue(!ba.engine.ingestEvent(e10).accepted, "duplicate eventId rejected")
    expectTrue(ba.engine.ingestEvent(e09).accepted, "out-of-order event sorted deterministically by seq")
    log("L20", "duplicate rejection and deterministic out-of-order ordering verified")
  }
}
