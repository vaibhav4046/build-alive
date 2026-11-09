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

function logMapping(ba: ReturnType<typeof getMain>["buildAlive"]) {
  const proj = ba.engine.currentProject
  for (const m of proj.modules) {
    const slot = CITY_MODULES.find((c) => c.moduleId === m.id)
    const obj = slot ? findSceneObjectByName(slot.sceneName) : null
    log("L23", "MAP project=" + proj.projectId + " path=" + m.clusterId + " module=" + m.id + " object=" + (slot ? slot.sceneName : "none") + " enabled=" + (obj ? obj.enabled : false) + " label=" + m.label + " files=" + m.files.length)
    expectTrue(!!obj && obj.enabled, "module object enabled for real path " + m.clusterId)
  }
}

@component
export class BuildAliveL23RealWorkspaceIslands extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = getMain().buildAlive
    ba.useRealWorld("earthproof")
    await sleep(120)
    expectTrue(textOf(findSceneObjectByName("Island_LobbySync_Label")) === "EarthProof", "island 1 label is the real repo name EarthProof")
    expectTrue(textOf(findSceneObjectByName("Island_EdgeGuard_Label")) === "mnemosyne", "island 2 label is the real repo name mnemosyne")
    expectTrue(textOf(findSceneObjectByName("Island_EarthProof_Label")) === "Sample World", "island 3 is the selectable Sample World")
    const banner = textOf(findSceneObjectByName("ProvenanceBanner"))
    expectTrue(banner.indexOf("REAL REPO SCAN") >= 0 && banner.indexOf("no live agent event") >= 0, "banner says real scan snapshot, no live event: " + banner)
    expectTrue(banner.indexOf("LIVE_CONNECTED") < 0, "banner does not claim live")
    const proj = ba.engine.currentProject
    expectTrue(proj.provenance === "REAL_SCAN" && proj.title === "EarthProof", "current world is the real EarthProof scan")
    expectTrue(proj.modules.length >= 5, "EarthProof has real modules: " + proj.modules.length)
    logMapping(ba)
    ba.useRealWorld("mnemosyne")
    await sleep(120)
    expectTrue(ba.engine.currentProject.title === "mnemosyne" && ba.engine.currentProject.provenance === "REAL_SCAN", "mnemosyne is a real scan")
    logMapping(ba)
    log("L23", "real workspace worlds bound to islands with real module paths")
  }
}
