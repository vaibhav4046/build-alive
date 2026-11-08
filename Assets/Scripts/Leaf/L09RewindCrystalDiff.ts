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
export class BuildAliveL09RewindCrystalDiff extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    while (ba.engine.snapshot().cursorSeq < 5) ba.handleStep()
    const interactor = new DefaultLeafInteractor()
    await press(interactor, "RewindCrystal")
    const snap = ba.engine.snapshot()
    expectTrue(snap.cursorSeq === 4, "rewound from seq 5 to seq 4")
    expectTrue(ba.cardRowText(2).indexOf("players.length") >= 0, "diff shows capacity guard line")
    log("L09", "rewind crystal diff verified at cursorSeq " + snap.cursorSeq)
  }
}
