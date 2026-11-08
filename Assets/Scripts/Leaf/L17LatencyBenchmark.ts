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
export class BuildAliveL17LatencyBenchmark extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    ba.clearLatencyLog()
    const interactor = new DefaultLeafInteractor()
    const cycles = 40 // 40 * 5 buttons = 200 interactions
    for (let i = 0; i < cycles; i++) {
      await press(interactor, "BA_StepButton")
      await press(interactor, "BA_InspectButton")
      await press(interactor, "BA_LearnButton")
      await press(interactor, "BA_ApproveButton")
      await press(interactor, "BA_ResetButton")
    }
    await sleep(150)
    const ms = ba.latencyLog.map((r) => r.latencyMs)
    const p50 = percentile(ms, 50)
    const p95 = percentile(ms, 95)
    const p99 = percentile(ms, 99)
    expectTrue(ms.length === 200, "200 interactions logged (got " + ms.length + ")")
    expectTrue(p99 < 100, "p99 < 100 ms (got " + p99.toFixed(1) + " ms)")
    log("L17", "200-press latency ms: p50=" + p50.toFixed(1) + " p95=" + p95.toFixed(1) + " p99=" + p99.toFixed(1))
  }
}
