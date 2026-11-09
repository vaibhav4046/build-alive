import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {expectTrue, getMain, log, press} from "./EarthProofLeafKit"

// L27: the X on a window minimises it into a chip (with a dot), tapping the chip reopens it in place. Nothing is lost either way.
@component
export class BuildAliveL27WindowMinimise extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = getMain().buildAlive
    ba.useSampleWorld()
    ba.handleReset()
    await sleep(150)
    const interactor = new DefaultLeafInteractor()

    for (const key of ["learn", "session", "project"]) {
      const win = findSceneObjectByName("Glass_" + key.charAt(0).toUpperCase() + key.slice(1))
      const chip = findSceneObjectByName("Restore_" + key)
      expectTrue(win.enabled && !chip.enabled, key + ": window open, no restore chip")
      await press(interactor, "Close_" + key)
      await sleep(150)
      expectTrue(!win.enabled && chip.enabled, key + ": X hides the window and shows its restore chip")
      await press(interactor, "Restore_" + key)
      await sleep(150)
      expectTrue(win.enabled && !chip.enabled, key + ": tapping the chip reopens the window in place")
    }
    log("L27", "minimise and restore verified for session, learn and project windows")
  }
}
