// Criterion 6, reachability: an IK arm + head (Bitmoji avatar) physically reaches Run and Reset the way a person
// would. trigger() only succeeds if the reach converges on the target, so this is the reachability check.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {createIKInteractor} from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {expectTrue, interactable, log, toStart, waitUntil} from "./EarthProofLeafKit"

@component
export class EarthProofC6IkReach extends Scenario {
  private readonly ik = createIKInteractor()

  async run(): Promise<void> {
    await sleep(1500)
    const main = await toStart()

    await this.ik.trigger(interactable("RunButton"))
    await waitUntil(() => main.snapshot().state === "stalled", 6000, "stall after the IK press on Run")
    log("c6-ik", "IK arm reached Run: the rover started and stalled")

    await this.ik.trigger(interactable("ResetButton"), "left")
    await waitUntil(() => main.snapshot().state === "idle", 3000, "reset after the IK press on Reset")
    expectTrue(main.snapshot().state === "idle", "IK arm reached Reset with the left hand")
    log("c6-ik", "IK left hand reached Reset")
  }
}
