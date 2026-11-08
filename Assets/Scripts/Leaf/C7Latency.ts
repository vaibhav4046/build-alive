// Done criterion 7: 200 presses (50 cycles of Run, Reset, swap to Geared, swap to Small) through real SIK interaction.
// For each press EarthProofMain logs Date.now() at the press handler entry and Date.now() in the first LateUpdateEvent
// after the response was applied. Reports p50/p95/p99 (not the average). It excludes GPU present and display latency
// and Date.now() has 1 ms resolution. Preview only: real-glasses latency is unproven.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {percentile} from "../EarthProofSim"
import {expectTrue, log, press, toStart} from "./EarthProofLeafKit"

const CYCLES = 50
const P99_TARGET_MS = 100

@component
export class EarthProofC7Latency extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const main = await toStart()
    main.clearLatencyLog()
    const interactor = new DefaultLeafInteractor()

    for (let i = 0; i < CYCLES; i++) {
      await press(interactor, "RunButton")
      await press(interactor, "ResetButton")
      await press(interactor, "MotorBlock_Geared")
      await press(interactor, "MotorBlock_Small")
    }
    await sleep(200)

    const rows = main.latencyLog.slice()
    const ms = rows.map((r) => r.latencyMs)
    const count = (k: string) => rows.filter((r) => r.kind === k).length
    log("c7", "presses logged: " + rows.length + " (run " + count("run") + ", reset " + count("reset") + ", swap " + count("swap") + ")")
    const p50 = percentile(ms, 50), p95 = percentile(ms, 95), p99 = percentile(ms, 99)
    log("c7", "press-to-first-frame ms: p50=" + p50.toFixed(1) + " p95=" + p95.toFixed(1) + " p99=" + p99.toFixed(1) + " min=" + Math.min(...ms) + " max=" + Math.max(...ms) + " n=" + ms.length)
    for (const k of ["run", "reset", "swap"]) {
      const v = rows.filter((r) => r.kind === k).map((r) => r.latencyMs)
      log("c7", k + ": p50=" + percentile(v, 50).toFixed(1) + " p95=" + percentile(v, 95).toFixed(1) + " p99=" + percentile(v, 99).toFixed(1) + " n=" + v.length)
    }
    log("c7", "RAW " + ms.join(","))
    expectTrue(rows.length === CYCLES * 4, "200 presses were logged (got " + rows.length + ")")
    expectTrue(p99 < P99_TARGET_MS, "p99 under " + P99_TARGET_MS + " ms in the preview (got " + p99.toFixed(1) + ")")
  }
}
