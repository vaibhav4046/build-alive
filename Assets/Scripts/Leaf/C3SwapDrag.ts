// Done criterion 3 (drag variant): dragging the Geared block onto the mount snaps it on (within 6 cm).
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {expectNear, expectTrue, interactable, log, seatWorld, textOf, toStart, waitUntil} from "./EarthProofLeafKit"

@component
export class EarthProofC3SwapDrag extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const main = await toStart()
    const interactor = new DefaultLeafInteractor()
    main.handleRun()
    await waitUntil(() => main.snapshot().evidenceVisible, 4000, "evidence card before the drag")

    const block = findSceneObjectByName("MotorBlock_Geared")
    const from = block.getTransform().getWorldPosition()
    const seat = seatWorld()
    // drop 2 cm away from the exact seat: inside the 6 cm snap radius
    const delta = seat.sub(from).add(new vec3(2, 0, 0))
    log("c3-drag", "dragging the Geared block " + delta.length.toFixed(1) + " cm to the mount")
    await interactor.drag(interactable("MotorBlock_Geared"), delta, 1500)
    await sleep(300)

    const s = main.snapshot()
    expectTrue(s.installed === "geared" && s.gearedMounted && !s.smallMounted, "dropped Geared block snapped on")
    expectTrue(textOf(findSceneObjectByName("MountLabel")) === "Geared", "mount label reads Geared")
    expectTrue(!s.evidenceVisible && !s.beamVisible, "evidence card and beam are cleared")
    expectNear(block.getTransform().getWorldPosition().distance(seatWorld()), 0, 0.05, "block sits exactly on the mount after the snap")
  }
}
