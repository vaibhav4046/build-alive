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
export class BuildAliveL18SecretRedaction extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    const env = makeSyntheticLiveEnvelope(
      101,
      "tool_finished",
      "Auth key sk-ant-api03-SECRET999999999999999999 and ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 in C:\\Users\\lalwa\\secret.ts",
    )
    const res = ba.engine.ingestEvent(env)
    ba.engine.scrubToSeq(101)
    ba.syncVisuals()
    expectTrue(res.accepted, "redacted envelope accepted")
    const row1 = ba.cardRowText(1)
    expectTrue(row1.indexOf("sk-ant-") < 0 && row1.indexOf("ghp_") < 0 && row1.indexOf("lalwa") < 0, "secrets and host paths scrubbed from UI")
    // sample-mode card row 1 shows the engine explanation, not the raw event summary; the event the UI binds must carry the token
    const shown = ba.engine.activeEvent
    expectTrue(shown !== null && shown.summary.indexOf("[REDACTED") >= 0, "redaction token present on the event the UI renders: " + (shown ? shown.summary : "none"))
    log("L18", "secret redaction verified: " + row1)
  }
}
