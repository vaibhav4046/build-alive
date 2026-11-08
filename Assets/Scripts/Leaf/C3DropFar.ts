// Guard path for criterion 3: a block dropped far from the mount (outside 6 cm) does NOT mount; it returns to its slot.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {expectNear, expectTrue, interactable, log, toStart} from "./EarthProofLeafKit"
import {SLOT_GEARED} from "../EarthProofLayout"

@component
export class EarthProofC3DropFar extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const main = await toStart()
    const interactor = new DefaultLeafInteractor()

    await interactor.drag(interactable("MotorBlock_Geared"), new vec3(25, 0, 0), 1200) // 25 cm to the right, far from the mount
    await sleep(300)

    const s = main.snapshot()
    expectTrue(s.installed === "small" && s.smallMounted && !s.gearedMounted, "Geared did not mount")
    const p = findSceneObjectByName("MotorBlock_Geared").getTransform().getWorldPosition()
    expectNear(p.x, SLOT_GEARED.x, 0.05, "block back at its slot x")
    expectNear(p.z, SLOT_GEARED.z, 0.05, "block back at its slot z")
    log("c3-far", "far drop returned the block to its slot at x=" + p.x.toFixed(1) + " z=" + p.z.toFixed(1))
  }
}
