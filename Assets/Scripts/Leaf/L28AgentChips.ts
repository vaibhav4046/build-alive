import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {PROVIDER_STATIONS} from "../BuildAliveProviders"
import {expectTrue, getMain, log, press, textOf} from "./EarthProofLeafKit"

// L28: one chip per provider; pinching a chip switches the Session window to it. OFFLINE / UNSUPPORTED providers show only an
// explanation tile (why, how to connect) and NEVER events; going back to Claude Code restores its (replay) steps.
@component
export class BuildAliveL28AgentChips extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = getMain().buildAlive
    ba.useSampleWorld()
    ba.handleReset()
    await sleep(150)
    const interactor = new DefaultLeafInteractor()
    const title = () => textOf(findSceneObjectByName("AgentTab_Hero"))
    const row = (i: number) => textOf(findSceneObjectByName("SessionRow_" + i))

    expectTrue(PROVIDER_STATIONS.length === 10, "ten providers from the bridge snapshot")
    for (const st of PROVIDER_STATIONS) expectTrue(findSceneObjectByName("AgentChip_" + st.id) !== null, "chip exists for " + st.id)
    expectTrue(ba.currentProvider() === "claude-code", "Claude Code is selected at start")
    const mark = () => textOf(findSceneObjectByName("HeaderMonoText"))
    const claudeMark = mark()
    expectTrue(claudeMark.length >= 1 && claudeMark.length <= 2, "header shows a 1-2 letter monogram (" + claudeMark + "), not a brand logo")
    expectTrue(row(0).indexOf("REPLAY") === 0, "Claude Code shows labelled REPLAY steps while the bridge is not live")

    for (const id of ["codex", "opencode", "chatgpt-app", "muse"]) {
      await press(interactor, "AgentChip_" + id)
      await sleep(250)
      const st = PROVIDER_STATIONS.filter((p) => p.id === id)[0]
      expectTrue(ba.currentProvider() === id, "pinching the " + id + " chip selects it")
      expectTrue(title().indexOf(st.name) === 0, id + ": header names the provider (" + title() + ")")
      expectTrue(mark() !== claudeMark, id + ": header monogram follows the selected provider (" + mark() + ")")
      const badge = st.bridgeStatus === "UNSUPPORTED" ? "UNSUPPORTED" : "OFFLINE"
      expectTrue(title().indexOf(badge) >= 0, id + ": header carries the honest status word " + badge)
      expectTrue(row(0).indexOf("REPLAY") < 0 && row(0).length > 0, id + ": first tile explains, it is not a fake event")
      expectTrue(row(2).indexOf("To connect") === 0, id + ": third tile says how to connect")
      expectTrue(row(3) === "", id + ": no further tiles, no invented events")
    }
    await press(interactor, "AgentChip_claude-code")
    await sleep(250)
    expectTrue(ba.currentProvider() === "claude-code" && row(0).indexOf("REPLAY") === 0, "back on Claude Code its replay steps return")
    log("L28", "agent chips verified: switch, honest status word, no fake events for offline/unsupported providers")
  }
}
