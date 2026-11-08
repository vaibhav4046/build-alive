// Done criterion 2: pinching Run with the Small motor stalls the rover at the start of the steep section; within 1 s
// an evidence card shows "needs 7.9 N.cm" and "has 4.0 N.cm" beside the stall point, and a beam runs from the stall
// point to the motor.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {cardRow, expectNear, expectTrue, log, pos, press, seatWorld, toStart, waitUntil} from "./EarthProofLeafKit"

@component
export class EarthProofC2Stall extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const main = await toStart()
    main.clearLatencyLog()
    const interactor = new DefaultLeafInteractor()

    await press(interactor, "RunButton")
    const pressRec = main.latencyLog[main.latencyLog.length - 1]
    expectTrue(pressRec !== undefined && pressRec.kind === "run", "Run press was logged")

    await waitUntil(() => main.snapshot().evidenceVisible, 4000, "evidence card")
    const elapsed = Date.now() - pressRec.pressMs // from the press handler entry to the card being shown
    log("c2", "evidence visible " + elapsed + " ms after the Run press")
    expectTrue(elapsed < 1000, "evidence card within 1 s of the press (" + elapsed + " ms)")

    const snap = main.snapshot()
    expectTrue(snap.state === "stalled" && snap.outcome === "stall", "rover stalled")
    expectNear(snap.sFront, 20, 1e-6, "stalled at the start of the steep section (20 cm along the ramp)")
    expectTrue(cardRow("EvidenceCard", 1) === "needs 7.9 N.cm", "evidence shows 'needs 7.9 N.cm', got '" + cardRow("EvidenceCard", 1) + "'")
    expectTrue(cardRow("EvidenceCard", 2) === "has 4.0 N.cm", "evidence shows 'has 4.0 N.cm', got '" + cardRow("EvidenceCard", 2) + "'")

    // beam runs from the stall marker to the motor
    const beam = findSceneObjectByName("EvidenceBeam")
    expectTrue(beam.enabled, "beam is visible")
    const t = beam.getTransform()
    const centre = t.getWorldPosition()
    const half = t.getWorldTransform().multiplyDirection(new vec3(0, 0, 1)).normalize().uniformScale(t.getLocalScale().z / 2)
    const endA = centre.add(half), endB = centre.sub(half)
    const seat = seatWorld()
    const marker = pos("StallMarker").add(new vec3(0, 2, 0)) // top of the marker post
    const toMotor = Math.min(endA.distance(seat), endB.distance(seat))
    const toMarker = Math.min(endA.distance(marker), endB.distance(marker))
    log("c2", "beam end to motor " + toMotor.toFixed(2) + " cm, beam end to stall marker " + toMarker.toFixed(2) + " cm")
    expectTrue(toMotor < 0.5, "a beam end is on the motor")
    expectTrue(toMarker < 0.5, "the other beam end is on the stall marker")

    // the card is pinned beside the stall point, not centred in the view
    const card = pos("EvidenceCard")
    const dx = card.x - pos("StallMarker").x
    log("c2", "evidence card is " + dx.toFixed(1) + " cm right of the stall marker, at x=" + card.x.toFixed(1))
    expectTrue(dx > 5 && dx < 25, "evidence card is beside the stall point")
    expectTrue(Math.abs(card.x) > 5, "evidence card is not in the middle of the view")
  }
}
