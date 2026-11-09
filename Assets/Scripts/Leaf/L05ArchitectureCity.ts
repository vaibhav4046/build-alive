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
export class BuildAliveL05ArchitectureCity extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    await toBuildAliveStart()
    for (const m of CITY_MODULES) {
      expectTrue(exists(m.sceneName), "module exists: " + m.sceneName)
      expectTrue(exists(m.sceneName + "_Badge"), "module badge exists: " + m.sceneName)
    }
    for (const b of CITY_BRIDGES) {
      expectTrue(exists(b.sceneName), "dependency bridge exists: " + b.sceneName)
    }
    log("L05", "6 Architecture City modules and 5 dependency bridges verified")
  }
}
