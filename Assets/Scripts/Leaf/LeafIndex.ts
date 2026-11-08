// Registers the EarthProof LEAF scenarios. One scenario per done criterion (criterion 3 has a pinch and a far-drop
// guard; criterion 6 has a geometry/field-of-view check and an IK reachability check). The drag-onto-the-mount path is
// NOT a LEAF scenario: LEAF's simulated drag carried the SIK-manipulated block ~125 cm whatever vector was commanded,
// so that path was verified with the preview agent's Drag action instead (see devpost/test-results.md).
import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {EarthProofC1Layout} from "./C1Layout"
import {EarthProofC2Stall} from "./C2Stall"
import {EarthProofC3SwapTap} from "./C3SwapTap"
import {EarthProofC3DropFar} from "./C3DropFar"
import {EarthProofC4Pass} from "./C4Pass"
import {EarthProofC5Reset} from "./C5Reset"
import {EarthProofC6Controls} from "./C6Controls"
import {EarthProofC6IkReach} from "./C6IkReach"
import {EarthProofC7Latency} from "./C7Latency"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: "c1-layout", typename: EarthProofC1Layout.getTypeName()},
    {id: "c2-stall-evidence", typename: EarthProofC2Stall.getTypeName()},
    {id: "c3-swap-pinch", typename: EarthProofC3SwapTap.getTypeName()},
    {id: "c3-drop-far", typename: EarthProofC3DropFar.getTypeName()},
    {id: "c4-pass-proof", typename: EarthProofC4Pass.getTypeName()},
    {id: "c5-reset", typename: EarthProofC5Reset.getTypeName()},
    {id: "c6-controls", typename: EarthProofC6Controls.getTypeName()},
    {id: "c6-ik-reach", typename: EarthProofC6IkReach.getTypeName()},
    {id: "c7-latency", typename: EarthProofC7Latency.getTypeName()},
  ]
}
