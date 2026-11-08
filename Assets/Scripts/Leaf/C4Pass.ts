// Done criterion 4: after the swap, pinching Run again drives the rover to the top; the proof card shows the motor,
// both numbers and the 2.1x margin.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {cardRow, expectNear, expectTrue, log, press, toStart, waitUntil} from "./EarthProofLeafKit"

@component
export class EarthProofC4Pass extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const main = await toStart()
    const interactor = new DefaultLeafInteractor()
    await press(interactor, "MotorBlock_Geared")
    expectTrue(main.snapshot().installed === "geared", "Geared installed")

    await press(interactor, "RunButton")
    const took = await waitUntil(() => main.snapshot().proofVisible, 12000, "proof card")
    log("c4", "proof card shown " + took + " ms after the Run press")

    const s = main.snapshot()
    expectTrue(s.state === "passed" && s.outcome === "pass", "rover passed")
    expectNear(s.sFront, 50, 1e-6, "rover at the top of the 50 cm ramp")
    expectTrue(cardRow("ProofCard", 1) === "Motor: Geared", "proof shows the motor, got '" + cardRow("ProofCard", 1) + "'")
    expectTrue(cardRow("ProofCard", 2) === "needs 7.9 N.cm", "proof shows needs, got '" + cardRow("ProofCard", 2) + "'")
    expectTrue(cardRow("ProofCard", 3) === "has 17.0 N.cm", "proof shows has, got '" + cardRow("ProofCard", 3) + "'")
    expectTrue(cardRow("ProofCard", 4) === "margin 2.1x", "proof shows the margin, got '" + cardRow("ProofCard", 4) + "'")
    expectTrue(!s.evidenceVisible && !s.beamVisible, "no evidence or beam on a pass")
  }
}
