// Done criterion 1: on start the table, ramp, rover and parts tray are there at real size, the rover is at the
// ramp base, and the table is labelled "Simulated in preview".
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {roverWorld, START_S, TABLE_SIZE} from "../EarthProofLayout"
import {exists, expectNear, expectTrue, log, pos, textOf, toStart} from "./EarthProofLeafKit"

@component
export class EarthProofC1Layout extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const main = await toStart()

    for (const n of ["Table", "Ramp", "RampShallow", "RampSteep", "RampTop", "Rover", "RoverBody", "MotorMount", "PartsTray", "MotorBlock_Small", "MotorBlock_Geared", "TableLabel", "RunButton", "ResetButton"]) {
      expectTrue(exists(n), "scene object " + n + " exists")
    }
    expectTrue(textOf(findSceneObjectByName("TableLabel")) === "Simulated in preview", "table label reads 'Simulated in preview', got '" + textOf(findSceneObjectByName("TableLabel")) + "'")

    // real size in cm
    const table = findSceneObjectByName("Table").getTransform().getWorldScale()
    expectNear(table.x, TABLE_SIZE.w, 0.01, "table width")
    expectNear(table.z, TABLE_SIZE.d, 0.01, "table depth")
    const body = findSceneObjectByName("RoverBody").getTransform().getWorldScale()
    expectNear(body.x, 18, 0.01, "rover length")
    expectNear(body.y, 8, 0.01, "rover height")
    expectNear(body.z, 12, 0.01, "rover width")
    const wheelMesh = findSceneObjectByName("WheelMesh").getTransform().getWorldScale()
    expectNear(wheelMesh.x / 2, 3, 0.01, "wheel radius")

    // rover at the ramp base, level
    const want = roverWorld(START_S)
    const rover = pos("Rover")
    expectNear(rover.x, want.x, 0.05, "rover x at base")
    expectNear(rover.y, want.y, 0.05, "rover y at base")
    const snap = main.snapshot()
    expectTrue(snap.state === "idle" && snap.sFront === START_S, "state idle at the base")
    expectTrue(snap.smallMounted && !snap.gearedMounted && snap.mountLabel === "Small", "Small motor mounted and labelled")
    expectTrue(!snap.evidenceVisible && !snap.proofVisible && !snap.beamVisible, "no evidence, proof or beam at start")
    log("c1", "layout ok: table " + table.x + "x" + table.z + ", rover " + body.x + "x" + body.z + "x" + body.y + " cm, label '" + textOf(findSceneObjectByName("TableLabel")) + "'")
  }
}
