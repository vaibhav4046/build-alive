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
export class BuildAliveL02ProjectIslands extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    await toBuildAliveStart()
    for (const slot of PROJECT_ISLANDS) {
      expectTrue(exists(slot.sceneName), "island exists: " + slot.sceneName)
      const p = pos(slot.sceneName)
      expectNear(p.x, slot.center.x, 0.1, slot.sceneName + " x")
      expectNear(p.y, slot.center.y, 0.1, slot.sceneName + " y")
    }
    log("L02", "all 3 project islands verified in world space")
  }
}
