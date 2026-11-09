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
export class BuildAliveL24PinchRealModule extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = getMain().buildAlive
    ba.useRealWorld("earthproof")
    const interactor = new DefaultLeafInteractor()
    await press(interactor, "Island_EdgeGuard")
    expectTrue(ba.engine.snapshot().projectId === "mnemosyne", "pinched island selects real mnemosyne")
    const mod = ba.engine.currentProject.modules.find((m) => m.clusterId === "src/lib")
    expectTrue(!!mod, "mnemosyne scan has a module for the real path src/lib")
    const slot = CITY_MODULES.find((c) => c.moduleId === (mod ? mod.id : ""))
    expectTrue(!!slot, "module slot has a scene object")
    await press(interactor, slot ? slot.sceneName : "")
    await sleep(200)
    expectTrue(ba.engine.snapshot().selectedModuleId === (mod ? mod.id : ""), "pinch selected the module")
    const row0 = ba.cardRowText(0)
    const row1 = ba.cardRowText(1)
    const row4 = ba.cardRowText(4)
    log("L24", "card rows: " + row0 + " || " + row1 + " || " + row4)
    expectTrue(row0.indexOf("mnemosyne") >= 0, "card names the real repo")
    expectTrue(row1.indexOf("src/lib/") >= 0, "card shows the real path src/lib/")
    expectTrue(row4.indexOf("src/lib/") >= 0, "card lists real files under src/lib/")
    log("L24", "pinching a real module opened its real path and files")
  }
}
