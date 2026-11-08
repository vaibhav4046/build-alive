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
export class BuildAliveL22Accessibility extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    ba.engine.setAccessibilityOptions({reducedMotion: true, highContrast: true})
    while (ba.engine.snapshot().cursorSeq < 5) ba.handleStep()
    const snap = ba.engine.snapshot()
    expectTrue(snap.reducedMotion && snap.highContrast, "accessibility flags enabled")
    const testBadge = textOf(findSceneObjectByName("Module_TestSuite_Badge"))
    const stateBadge = textOf(findSceneObjectByName("Module_SharedState_Badge"))
    expectTrue(testBadge.indexOf("[FAIL]") >= 0, "failing module has non-color [FAIL] prefix")
    expectTrue(stateBadge.indexOf("[PASS]") >= 0, "passing module has non-color [PASS] prefix")
    log("L22", "reduced-motion and colour-blind safe double-coded badges verified")
  }
}
