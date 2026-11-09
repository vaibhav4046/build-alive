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
  MIN_RAIL_SEPARATION_CM,
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
export class BuildAliveL14ControlSizeSpacing extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    await toBuildAliveStart()
    const audit = auditControlErgonomics()
    expectTrue(audit.minWidthCm >= 5, "all controls >= 5 cm across (" + audit.minWidthCm + " cm)")
    expectTrue(audit.minRailSpacingCm >= MIN_RAIL_SEPARATION_CM, "all dock controls >= 6 cm apart (" + audit.minRailSpacingCm.toFixed(1) + " cm)")
    expectTrue(audit.passed, "auditControlErgonomics passed")
    for (const b of RAIL_CONTROLS) {
      expectTrue(exists(b.sceneName), "button exists in scene: " + b.sceneName)
    }
    log("L14", "control size (" + audit.minWidthCm + " cm) and spacing (" + audit.minRailSpacingCm.toFixed(1) + " cm) verified")
  }
}
