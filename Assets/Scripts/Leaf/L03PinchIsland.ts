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
export class BuildAliveL03PinchIsland extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    const interactor = new DefaultLeafInteractor()
    // Island slots hold the real scan (slot 1 EarthProof, slot 2 mnemosyne) and the Sample World (slot 3).
    await press(interactor, "Island_EdgeGuard")
    expectTrue(ba.engine.snapshot().projectId === "mnemosyne", "slot 2 island selects the real mnemosyne world")
    await press(interactor, "Island_LobbySync")
    expectTrue(ba.engine.snapshot().projectId === "earthproof", "slot 1 island selects the real EarthProof world")
    await press(interactor, "Island_EarthProof")
    expectTrue(ba.engine.snapshot().projectId === "lobby-sync", "slot 3 island selects the Sample World")
    log("L03", "project island pinch selection verified (real, real, sample)")
  }
}
