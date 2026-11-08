// Done criterion 5: pinching Reset returns the rover to the base, the Small motor to the mount, and hides the
// evidence and proof cards.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {roverWorld, START_S} from "../EarthProofLayout"
import {expectNear, expectTrue, log, pos, press, seatWorld, textOf, toStart, waitUntil} from "./EarthProofLeafKit"

@component
export class EarthProofC5Reset extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const main = await toStart()
    const interactor = new DefaultLeafInteractor()

    // from a passed state with Geared
    main.handleSwap("geared")
    main.handleRun()
    await waitUntil(() => main.snapshot().proofVisible, 12000, "proof card")
    expectTrue(main.snapshot().state === "passed", "precondition: passed")

    await press(interactor, "ResetButton")
    await sleep(250)
    let s = main.snapshot()
    expectTrue(s.state === "idle" && s.sFront === START_S, "rover back at the base")
    expectTrue(s.smallMounted && !s.gearedMounted && textOf(findSceneObjectByName("MountLabel")) === "Small", "Small motor back on the mount")
    expectTrue(!s.proofVisible && !s.evidenceVisible && !s.beamVisible, "proof card, evidence card and beam hidden")
    const want = roverWorld(START_S), rover = pos("Rover")
    expectNear(rover.x, want.x, 0.05, "rover x")
    expectNear(findSceneObjectByName("MotorBlock_Small").getTransform().getWorldPosition().distance(seatWorld()), 0, 0.05, "Small block on the mount")

    // and from a stalled state
    main.handleRun()
    await waitUntil(() => main.snapshot().evidenceVisible, 4000, "evidence card")
    await press(interactor, "ResetButton")
    await sleep(250)
    s = main.snapshot()
    expectTrue(s.state === "idle" && !s.evidenceVisible && !s.beamVisible, "reset from a stall hides the evidence and beam")
    log("c5", "reset ok from passed and from stalled")
  }
}
