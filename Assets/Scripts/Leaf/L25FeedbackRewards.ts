import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {expectTrue, getMain, log, press} from "./EarthProofLeafKit"

// L25: hand feedback + rewards tied to REAL learning actions only (opening evidence, a correct prediction), no farming,
// and a local-only progress trail (lanterns) that is persisted.
@component
export class BuildAliveL25FeedbackRewards extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = getMain().buildAlive
    ba.useSampleWorld()
    ba.handleReset()
    ba.resetProgressForTest()
    await sleep(150)
    const interactor = new DefaultLeafInteractor()

    const before = ba.feedbackSnapshot()
    expectTrue(before.rewards === 0 && before.lanterns.length === 0, "no reward and no lantern before any learning action")

    ba.triggerFeedback("server-lobby")
    await sleep(60)
    const kicked = ba.feedbackSnapshot().hoverScale
    log("L25", "release pop scale on the building art: " + kicked.toFixed(3))
    expectTrue(kicked > 1.01, "release pop visibly scales the building (" + kicked.toFixed(3) + ")")

    await press(interactor, "Module_Lobby")
    await sleep(300)
    const opened = ba.feedbackSnapshot()
    expectTrue(opened.rewards === 1, "opening a building's evidence earns exactly one reward (" + opened.rewards + ")")
    expectTrue(opened.lanterns.indexOf("server-lobby") >= 0, "a lantern is lit on the building that was inspected")

    await press(interactor, "Module_Lobby")
    await sleep(200)
    expectTrue(ba.feedbackSnapshot().rewards === 1, "re-opening the same building does not farm rewards")

    const expected = ba.engine.activeLearningCase.expectedFailedModuleId
    const wrong = expected === "client-ui" ? "db-mock" : "client-ui"
    ba.handleLearn(wrong)
    expectTrue(ba.feedbackSnapshot().rewards === 1, "a wrong prediction earns no reward")
    ba.handleLearn(expected)
    await sleep(150)
    expectTrue(ba.feedbackSnapshot().rewards === 2, "a correct prediction earns a reward")

    const stored = global.persistentStorageSystem.store.getString("ba_understood")
    expectTrue(!!stored && stored.indexOf("server-lobby") >= 0, "lantern progress is persisted locally")
    ba.resetProgressForTest() // tests must not leave earned-looking lanterns behind
    global.persistentStorageSystem.store.putString("ba_understood", "{}")
    log("L25", "feedback and rewards verified: release pop, 1 reward per real action, lanterns persisted")
  }
}
