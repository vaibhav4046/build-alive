// Registers both the preserved EarthProof Rover scenarios (c1-c7) and the 22 mandatory
// BUILD ALIVE scenarios (L01-L22) in a single ScenarioIndexDecorator registry.
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
import {BuildAliveL01BootProvenance} from "./L01BootProvenance"
import {BuildAliveL02ProjectIslands} from "./L02ProjectIslands"
import {BuildAliveL03PinchIsland} from "./L03PinchIsland"
import {BuildAliveL04AgentVessel} from "./L04AgentVessel"
import {BuildAliveL05ArchitectureCity} from "./L05ArchitectureCity"
import {BuildAliveL06FileEditPulse} from "./L06FileEditPulse"
import {BuildAliveL07TestFailureMarker} from "./L07TestFailureMarker"
import {BuildAliveL08CausalChain} from "./L08CausalChain"
import {BuildAliveL09RewindCrystalDiff} from "./L09RewindCrystalDiff"
import {BuildAliveL10LearningAtelier} from "./L10LearningAtelier"
import {BuildAliveL11SafeActionGate} from "./L11SafeActionGate"
import {BuildAliveL12RerunTestsPass} from "./L12RerunTestsPass"
import {BuildAliveL13ResetBaseline} from "./L13ResetBaseline"
import {BuildAliveL14ControlSizeSpacing} from "./L14ControlSizeSpacing"
import {BuildAliveL15CameraFov} from "./L15CameraFov"
import {BuildAliveL16IkReachability} from "./L16IkReachability"
import {BuildAliveL17LatencyBenchmark} from "./L17LatencyBenchmark"
import {BuildAliveL18SecretRedaction} from "./L18SecretRedaction"
import {BuildAliveL19MalformedEvent} from "./L19MalformedEvent"
import {BuildAliveL20DuplicateOutOfOrder} from "./L20DuplicateOutOfOrder"
import {BuildAliveL21DisconnectFallback} from "./L21DisconnectFallback"
import {BuildAliveL22Accessibility} from "./L22Accessibility"
import {BuildAliveL23RealWorkspaceIslands} from "./L23RealWorkspaceIslands"
import {BuildAliveL24PinchRealModule} from "./L24PinchRealModule"
import {BuildAliveL25FeedbackRewards} from "./L25FeedbackRewards"
import {BuildAliveL26MissionControl} from "./L26MissionControl"
import {BuildAliveL27WindowMinimise} from "./L27WindowMinimise"
import {BuildAliveL28AgentChips} from "./L28AgentChips"

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
    {id: "L01-scene-boot-provenance", typename: BuildAliveL01BootProvenance.getTypeName()},
    {id: "L02-project-islands-exist", typename: BuildAliveL02ProjectIslands.getTypeName()},
    {id: "L03-pinch-project-island", typename: BuildAliveL03PinchIsland.getTypeName()},
    {id: "L04-agent-vessel-and-subagent", typename: BuildAliveL04AgentVessel.getTypeName()},
    {id: "L05-architecture-city-graph", typename: BuildAliveL05ArchitectureCity.getTypeName()},
    {id: "L06-file-edit-pulse", typename: BuildAliveL06FileEditPulse.getTypeName()},
    {id: "L07-test-failure-fault-marker", typename: BuildAliveL07TestFailureMarker.getTypeName()},
    {id: "L08-pinch-fault-marker-causal-chain", typename: BuildAliveL08CausalChain.getTypeName()},
    {id: "L09-rewind-crystal-diff", typename: BuildAliveL09RewindCrystalDiff.getTypeName()},
    {id: "L10-learning-atelier-prediction", typename: BuildAliveL10LearningAtelier.getTypeName()},
    {id: "L11-safe-action-gate-approve-reject", typename: BuildAliveL11SafeActionGate.getTypeName()},
    {id: "L12-re-run-tests-after-fix", typename: BuildAliveL12RerunTestsPass.getTypeName()},
    {id: "L13-reset-baseline", typename: BuildAliveL13ResetBaseline.getTypeName()},
    {id: "L14-control-size-spacing", typename: BuildAliveL14ControlSizeSpacing.getTypeName()},
    {id: "L15-camera-fov-visibility", typename: BuildAliveL15CameraFov.getTypeName()},
    {id: "L16-ik-reachability", typename: BuildAliveL16IkReachability.getTypeName()},
    {id: "L17-latency-benchmark", typename: BuildAliveL17LatencyBenchmark.getTypeName()},
    {id: "L18-secret-redaction", typename: BuildAliveL18SecretRedaction.getTypeName()},
    {id: "L19-malformed-event-handling", typename: BuildAliveL19MalformedEvent.getTypeName()},
    {id: "L20-duplicate-out-of-order", typename: BuildAliveL20DuplicateOutOfOrder.getTypeName()},
    {id: "L21-disconnect-fallback", typename: BuildAliveL21DisconnectFallback.getTypeName()},
    {id: "L22-reduced-motion-colour-safe", typename: BuildAliveL22Accessibility.getTypeName()},
    {id: "L23-real-workspace-islands", typename: BuildAliveL23RealWorkspaceIslands.getTypeName()},
    {id: "L24-pinch-real-module-path", typename: BuildAliveL24PinchRealModule.getTypeName()},
    {id: "L25-feedback-and-rewards", typename: BuildAliveL25FeedbackRewards.getTypeName()},
    {id: "L26-agent-orbs-and-flow-pipeline", typename: BuildAliveL26MissionControl.getTypeName()},
    {id: "L27-window-minimise-restore", typename: BuildAliveL27WindowMinimise.getTypeName()},
    {id: "L28-agent-chips", typename: BuildAliveL28AgentChips.getTypeName()},
  ]
}
