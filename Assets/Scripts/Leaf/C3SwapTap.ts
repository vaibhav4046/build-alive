// Done criterion 3 (pinch variant): pinching the Geared block mounts it, changes the mount label to "Geared",
// and clears the evidence card and beam.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {expectNear, expectTrue, log, press, seatWorld, textOf, toStart, waitUntil} from "./EarthProofLeafKit"

@component
export class EarthProofC3SwapTap extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const main = await toStart()
    const interactor = new DefaultLeafInteractor()
    main.handleRun()
    await waitUntil(() => main.snapshot().evidenceVisible, 4000, "evidence card before the swap")

    await press(interactor, "MotorBlock_Geared")
    await sleep(200)

    const s = main.snapshot()
    expectTrue(s.installed === "geared" && s.gearedMounted && !s.smallMounted, "Geared is mounted, Small is back in the tray")
    expectTrue(textOf(findSceneObjectByName("MountLabel")) === "Geared", "mount label reads Geared")
    expectTrue(!s.evidenceVisible && !s.beamVisible, "evidence card and beam are cleared")
    expectTrue(s.state === "idle", "rover is back at the base")
    const block = findSceneObjectByName("MotorBlock_Geared").getTransform().getWorldPosition()
    expectNear(block.distance(seatWorld()), 0, 0.05, "block sits on the mount")
    log("c3-tap", "swap by pinch ok: label " + textOf(findSceneObjectByName("MountLabel")))
  }
}
