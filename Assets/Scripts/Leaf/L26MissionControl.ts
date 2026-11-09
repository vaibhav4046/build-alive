import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {stageForEvent} from "../BuildAliveProviders"
import {exists, expectTrue, getMain, log} from "./EarthProofLeafKit"

// L26: agent orbs carry honest badges (no fake connectivity) and the Prompt -> Loop flow lights from the active event.
@component
export class BuildAliveL26MissionControl extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = getMain().buildAlive
    ba.useSampleWorld()
    ba.handleReset()
    await sleep(200)

    const mc = ba.missionControlSnapshot()
    expectTrue(mc.orbs.length === 10, "ten agent stations are shown (" + mc.orbs.length + ")")
    const live = ba.engine.getProvenanceSummary().connectionState === "LIVE"
    const badgeOf = (id: string): string => (mc.orbs.find((o) => o.id === id) || {badge: "?"}).badge
    expectTrue(badgeOf("claude-code") === (live ? "LIVE" : "REPLAY"), "Claude Code reads " + (live ? "LIVE" : "REPLAY") + " (this Lens has " + (live ? "a" : "no") + " live bridge link)")
    expectTrue(badgeOf("codex") === "OFFLINE", "Codex is OFFLINE (binary not found)")
    expectTrue(badgeOf("grok-bots") === "UNSUPPORTED", "Grok bots are UNSUPPORTED (import only)")
    for (const o of mc.orbs) {
      if (o.id !== "claude-code") expectTrue(o.badge !== "LIVE", o.id + " never claims LIVE")
    }
    expectTrue(exists("AgentTab_Hero") && exists("FlowStage_Tests"), "agent tab and flow stage objects exist in the scene")

    const seen: number[] = []
    for (let i = 0; i < 8; i++) {
      ba.handleStep()
      await sleep(80)
      const ev = ba.engine.activeEvent
      const stage = ba.missionControlSnapshot().stage
      expectTrue(stage === stageForEvent(ev ? ev.kind : null, ev ? ev.status : null), "pipeline stage follows the active event at step " + (i + 1) + " (" + stage + ")")
      if (seen.indexOf(stage) < 0) seen.push(stage)
    }
    log("L26", "flow stages lit while stepping the replay: " + seen.join(","))
    expectTrue(seen.length >= 3, "the pipeline lit at least three different stages (" + seen.length + ")")
    ba.handleReset()
    await sleep(100)
    expectTrue(ba.missionControlSnapshot().stage === -1, "pipeline goes dark after Start over")
    log("L26", "agent orbs honest, flow pipeline follows replayed events")
  }
}
