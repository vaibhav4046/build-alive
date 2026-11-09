// gen-leaf-files.mjs
// Generates the 22 single-@component LEAF scenario files (L01..L22) in Assets/Scripts/Leaf/,
// updates LeafIndex.ts, and ensures every .ts file has a valid .ts.meta file.

import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

const ROOT = "D:/earthproof/lens/EarthProof"
const SCRIPTS_DIR = path.join(ROOT, "Assets/Scripts")
const LEAF_DIR = path.join(SCRIPTS_DIR, "Leaf")

function detUuid(seed) {
  const h = crypto.createHash("sha256").update(seed).digest("hex")
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`
}

function makeMetaContent(relPath) {
  const u1 = detUuid(relPath + ":importMeta")
  const u2 = detUuid(relPath + ":primaryAsset")
  const u3 = detUuid(relPath + ":assetData")
  const u4 = detUuid(relPath + ":componentUid")
  return `- !<AssetImportMetadata/${u1}>
  ImportedAssetIds:
    TypeScriptAsset: !<reference> ${u2}
  ImporterName: TypeScriptAssetImporter
  PrimaryAsset: !<reference> ${u2}
  PackageType: NotAPackage
  LegacyPackagePolicy: ~
  ExtraData:
    {}
  AssetDataMap:
    TypeScriptAsset: !<own> ${u3}
  DependentFiles:
    []
  ImporterSettings: !<AssetImporterSettings>
    {}
  CompressionSettings: !<own> 00000000-0000-0000-0000-000000000000
- !<TypeScriptAssetData/${u3}>
  SvgIcon: ""
  SetupScript:
    code: ""
  Description: ""
  VersionMajor: 0
  VersionMinor: 0
  VersionPatch: 0
  VersionPrerelease: ""
  UpdateOrder: 0
  ComponentUid: ${u4}
  ExportUid: 00000000-0000-0000-0000-000000000000
  PackagePolicy: CanBeUnpacked
  ScriptInputsHidden:
    {}
  ScriptTypesHidden:
    {}
  ReadMe: !<reference> 00000000-0000-0000-0000-000000000000
  DeclarationFile: !<reference> 00000000-0000-0000-0000-000000000000
  Tags:
    []
  Attachments:
    []
  DefaultScriptInputs:
    -
      {}
  ScriptTypes:
    -
      {}
  InputLines:
    []
`
}

const sharedHeader = `import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {createIKInteractor} from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {percentile} from "../EarthProofSim"
import {
  CITY_BRIDGES,
  CITY_MODULES,
  PROJECT_ISLANDS,
  RAIL_CONTROLS,
  auditControlErgonomics,
} from "../BuildAliveLayout"
import {makeSyntheticLiveEnvelope} from "../BuildAliveTransport"
import {exists, expectNear, expectTrue, getMain, interactable, log, pos, press, textOf} from "./EarthProofLeafKit"

async function toBuildAliveStart() {
  const main = getMain()
  // The Lens boots into the REAL scanned workspace; the scripted L01-L22 story lives in the selectable Sample World.
  main.buildAlive.useSampleWorld()
  main.buildAlive.handleReset()
  await sleep(120)
  return main.buildAlive
}
`

const scenarios = [
  {
    id: "L01-scene-boot-provenance",
    file: "L01BootProvenance",
    cls: "BuildAliveL01BootProvenance",
    body: `@component
export class BuildAliveL01BootProvenance extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    expectTrue(exists("BuildAliveRoot"), "BuildAliveRoot exists")
    expectTrue(exists("DeskShelf"), "DeskShelf exists")
    expectTrue(exists("ProvenanceBanner"), "ProvenanceBanner exists")
    const banner = textOf(findSceneObjectByName("ProvenanceBanner"))
    expectTrue(banner.indexOf("LOCAL_RECORDED_REPLAY") >= 0, "provenance banner shows LOCAL_RECORDED_REPLAY: " + banner)
    expectTrue(ba.engine.snapshot().cursorSeq === 0, "boot cursor starts at seq 0")
    log("L01", "boot provenance ok: " + banner)
  }
}`,
  },
  {
    id: "L02-project-islands-exist",
    file: "L02ProjectIslands",
    cls: "BuildAliveL02ProjectIslands",
    body: `@component
export class BuildAliveL02ProjectIslands extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    await toBuildAliveStart()
    for (const slot of PROJECT_ISLANDS) {
      expectTrue(exists(slot.sceneName), "island exists: " + slot.sceneName)
      const p = pos(slot.sceneName)
      expectNear(p.x, slot.center.x, 0.1, slot.sceneName + " x")
      // islands drift gently (+/-0.45 cm bob in BuildAliveSceneUI), so y is checked against the bob envelope
      expectNear(p.y, slot.center.y, 0.55, slot.sceneName + " y")
    }
    log("L02", "all 3 project islands verified in world space")
  }
}`,
  },
  {
    id: "L03-pinch-project-island",
    file: "L03PinchIsland",
    cls: "BuildAliveL03PinchIsland",
    body: `@component
export class BuildAliveL03PinchIsland extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    const interactor = new DefaultLeafInteractor()
    // Island slots hold the real scan (slot 1 EarthProof, slot 2 mnemosyne) and the Sample World (slot 3).
    await press(interactor, "Island_EdgeGuard")
    expectTrue(ba.engine.snapshot().projectId === "mnemosyne", "slot 2 island selects the real mnemosyne world")
    await press(interactor, "Island_LobbySync")
    expectTrue(ba.engine.snapshot().projectId === "earthproof", "slot 1 island selects the real EarthProof world")
    await press(interactor, "Island_EarthProof")
    expectTrue(ba.engine.snapshot().projectId === "lobby-sync", "slot 3 island selects the Sample World")
    log("L03", "project island pinch selection verified (real, real, sample)")
  }
}`,
  },
  {
    id: "L04-agent-vessel-and-subagent",
    file: "L04AgentVessel",
    cls: "BuildAliveL04AgentVessel",
    body: `@component
export class BuildAliveL04AgentVessel extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    expectTrue(exists("AgentVessel_Primary"), "AgentVessel_Primary exists")
    expectTrue(exists("AgentVessel_Sub01"), "AgentVessel_Sub01 exists")
    while (ba.engine.snapshot().cursorSeq < 4) ba.handleStep()
    expectTrue(findSceneObjectByName("AgentVessel_Sub01").enabled, "AgentVessel_Sub01 enabled on subagent step")
    log("L04", "agent vessel and subagent spawn verified")
  }
}`,
  },
  {
    id: "L05-architecture-city-graph",
    file: "L05ArchitectureCity",
    cls: "BuildAliveL05ArchitectureCity",
    body: `@component
export class BuildAliveL05ArchitectureCity extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    await toBuildAliveStart()
    for (const m of CITY_MODULES) {
      expectTrue(exists(m.sceneName), "module exists: " + m.sceneName)
      expectTrue(exists(m.sceneName + "_Badge"), "module badge exists: " + m.sceneName)
    }
    for (const b of CITY_BRIDGES) {
      expectTrue(exists(b.sceneName), "dependency bridge exists: " + b.sceneName)
    }
    log("L05", "6 Architecture City modules and 5 dependency bridges verified")
  }
}`,
  },
  {
    id: "L06-file-edit-pulse",
    file: "L06FileEditPulse",
    cls: "BuildAliveL06FileEditPulse",
    body: `@component
export class BuildAliveL06FileEditPulse extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    // sample replay: seq 2 is the tool_finished (file edit) event on server-lobby; seq 3 moves on to subagent_started
    while (ba.engine.snapshot().cursorSeq < 2) ba.handleStep()
    const badge = textOf(findSceneObjectByName("Module_Lobby_Badge"))
    expectTrue(badge.indexOf("[CHG]") >= 0, "lobby badge shows [CHG]: " + badge)
    log("L06", "file edit pulse and [CHG] badge verified: " + badge)
  }
}`,
  },
  {
    id: "L07-test-failure-fault-marker",
    file: "L07TestFailureMarker",
    cls: "BuildAliveL07TestFailureMarker",
    body: `@component
export class BuildAliveL07TestFailureMarker extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    while (ba.engine.snapshot().cursorSeq < 5) ba.handleStep()
    const snap = ba.engine.snapshot()
    expectTrue(snap.activeFailures.length > 0, "active failure present at seq 5")
    expectTrue(findSceneObjectByName("FaultMarker_Room03").enabled, "FaultMarker_Room03 is enabled")
    expectTrue(ba.cardRowText(0).indexOf("FAILURE ALERT") >= 0, "card headline shows FAILURE ALERT")
    log("L07", "spatial fault marker and failure card verified")
  }
}`,
  },
  {
    id: "L08-pinch-fault-marker-causal-chain",
    file: "L08CausalChain",
    cls: "BuildAliveL08CausalChain",
    body: `@component
export class BuildAliveL08CausalChain extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    while (ba.engine.snapshot().cursorSeq < 5) ba.handleStep()
    const interactor = new DefaultLeafInteractor()
    await press(interactor, "Module_TestSuite")
    const snap = ba.engine.snapshot()
    expectTrue(snap.selectedModuleId === "test-suite", "Module_TestSuite selected")
    expectTrue(ba.cardRowText(2).indexOf("Causal:") >= 0, "card row 2 shows Causal chain: " + ba.cardRowText(2))
    log("L08", "causal chain inspection verified: " + ba.cardRowText(2))
  }
}`,
  },
  {
    id: "L09-rewind-crystal-diff",
    file: "L09RewindCrystalDiff",
    cls: "BuildAliveL09RewindCrystalDiff",
    body: `@component
export class BuildAliveL09RewindCrystalDiff extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    while (ba.engine.snapshot().cursorSeq < 5) ba.handleStep()
    const interactor = new DefaultLeafInteractor()
    await press(interactor, "RewindCrystal")
    const snap = ba.engine.snapshot()
    expectTrue(snap.cursorSeq === 4, "rewound from seq 5 to seq 4")
    expectTrue(ba.cardRowText(2).indexOf("players.length") >= 0, "diff shows capacity guard line")
    log("L09", "rewind crystal diff verified at cursorSeq " + snap.cursorSeq)
  }
}`,
  },
  {
    id: "L10-learning-atelier-prediction",
    file: "L10LearningAtelier",
    cls: "BuildAliveL10LearningAtelier",
    body: `@component
export class BuildAliveL10LearningAtelier extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    const interactor = new DefaultLeafInteractor()
    await press(interactor, "BA_LearnButton")
    expectTrue(ba.engine.snapshot().sceneMode === "LEARN", "entered LEARN mode")
    expectTrue(ba.cardRowText(0).indexOf("LEARNING ATELIER") >= 0, "card shows LEARNING ATELIER")
    await press(interactor, "BA_LearnButton")
    const snap = ba.engine.snapshot()
    expectTrue(snap.lastPrediction !== null && snap.lastPrediction.correct, "learning prediction answered correctly")
    log("L10", "learning atelier challenge verified")
  }
}`,
  },
  {
    id: "L11-safe-action-gate-approve-reject",
    file: "L11SafeActionGate",
    cls: "BuildAliveL11SafeActionGate",
    body: `@component
export class BuildAliveL11SafeActionGate extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    ba.handleStageAction("run_known_test")
    expectTrue(ba.engine.snapshot().sceneMode === "APPROVAL_PENDING", "action staged in APPROVAL_PENDING")
    ba.handleReject()
    expectTrue(ba.engine.snapshot().sceneMode === "PROJECT_OVERVIEW", "reject returned to PROJECT_OVERVIEW")
    const interactor = new DefaultLeafInteractor()
    await press(interactor, "BA_ApproveButton")
    expectTrue(ba.engine.snapshot().receipts.length >= 2, "audit receipts recorded for deny and approve")
    log("L11", "safe action gate approve and reject verified")
  }
}`,
  },
  {
    id: "L12-re-run-tests-after-fix",
    file: "L12RerunTestsPass",
    cls: "BuildAliveL12RerunTestsPass",
    body: `@component
export class BuildAliveL12RerunTestsPass extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    while (ba.engine.snapshot().cursorSeq < 5) ba.handleStep()
    expectTrue(ba.engine.snapshot().activeFailures.length > 0, "test initially failing")
    ba.handleApprove("run_known_test")
    const snap = ba.engine.snapshot()
    expectTrue(snap.testRepaired, "testRepaired is true after approval")
    expectTrue(!findSceneObjectByName("FaultMarker_Room03").enabled, "FaultMarker_Room03 hidden after fix")
    log("L12", "post-fix passing state verified")
  }
}`,
  },
  {
    id: "L13-reset-baseline",
    file: "L13ResetBaseline",
    cls: "BuildAliveL13ResetBaseline",
    body: `@component
export class BuildAliveL13ResetBaseline extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    ba.handleStep()
    ba.handleStep()
    ba.handleLearn("test-suite")
    const interactor = new DefaultLeafInteractor()
    await press(interactor, "BA_ResetButton")
    const snap = ba.engine.snapshot()
    expectTrue(snap.cursorSeq === 0 && snap.sceneMode === "PROJECT_OVERVIEW", "reset restored baseline")
    log("L13", "deterministic baseline reset verified")
  }
}`,
  },
  {
    id: "L14-control-size-spacing",
    file: "L14ControlSizeSpacing",
    cls: "BuildAliveL14ControlSizeSpacing",
    body: `@component
export class BuildAliveL14ControlSizeSpacing extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    await toBuildAliveStart()
    const audit = auditControlErgonomics()
    expectTrue(audit.minWidthCm >= 5, "all controls >= 5 cm across (" + audit.minWidthCm + " cm)")
    expectTrue(audit.minRailSpacingCm >= 12, "all rail controls >= 12 cm apart (" + audit.minRailSpacingCm.toFixed(1) + " cm)")
    expectTrue(audit.passed, "auditControlErgonomics passed")
    for (const b of RAIL_CONTROLS) {
      expectTrue(exists(b.sceneName), "button exists in scene: " + b.sceneName)
    }
    log("L14", "control size (" + audit.minWidthCm + " cm) and spacing (" + audit.minRailSpacingCm.toFixed(1) + " cm) verified")
  }
}`,
  },
  {
    id: "L15-camera-fov-visibility",
    file: "L15CameraFov",
    cls: "BuildAliveL15CameraFov",
    body: `@component
export class BuildAliveL15CameraFov extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    await toBuildAliveStart()
    const audit = auditControlErgonomics()
    expectTrue(audit.allInView, "all BUILD ALIVE controls and modules inside camera FOV from standing pose")
    log("L15", "camera FOV visibility verified across all controls and modules")
  }
}`,
  },
  {
    id: "L16-ik-reachability",
    file: "L16IkReachability",
    cls: "BuildAliveL16IkReachability",
    body: `@component
export class BuildAliveL16IkReachability extends Scenario {
  private readonly ik = createIKInteractor()

  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    await this.ik.trigger(interactable("BA_StepButton"))
    expectTrue(ba.engine.snapshot().cursorSeq >= 1, "IK right hand triggered BA_StepButton")
    await this.ik.trigger(interactable("BA_ResetButton"), "left")
    expectTrue(ba.engine.snapshot().cursorSeq === 0, "IK left hand triggered BA_ResetButton")
    log("L16", "IK avatar reachability verified for BA_StepButton and BA_ResetButton")
  }
}`,
  },
  {
    id: "L17-latency-benchmark",
    file: "L17LatencyBenchmark",
    cls: "BuildAliveL17LatencyBenchmark",
    body: `@component
export class BuildAliveL17LatencyBenchmark extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    ba.clearLatencyLog()
    const interactor = new DefaultLeafInteractor()
    const cycles = 40 // 40 * 5 buttons = 200 interactions
    for (let i = 0; i < cycles; i++) {
      await press(interactor, "BA_StepButton")
      await press(interactor, "BA_InspectButton")
      await press(interactor, "BA_LearnButton")
      await press(interactor, "BA_ApproveButton")
      await press(interactor, "BA_ResetButton")
    }
    await sleep(150)
    const ms = ba.latencyLog.map((r) => r.latencyMs)
    const p50 = percentile(ms, 50)
    const p95 = percentile(ms, 95)
    const p99 = percentile(ms, 99)
    expectTrue(ms.length === 200, "200 interactions logged (got " + ms.length + ")")
    expectTrue(p99 < 100, "p99 < 100 ms (got " + p99.toFixed(1) + " ms)")
    log("L17", "200-press latency ms: p50=" + p50.toFixed(1) + " p95=" + p95.toFixed(1) + " p99=" + p99.toFixed(1))
  }
}`,
  },
  {
    id: "L18-secret-redaction",
    file: "L18SecretRedaction",
    cls: "BuildAliveL18SecretRedaction",
    body: `@component
export class BuildAliveL18SecretRedaction extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    const env = makeSyntheticLiveEnvelope(
      101,
      "tool_finished",
      "Auth key sk-ant-api03-SECRET999999999999999999 and ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 in C:\\\\Users\\\\lalwa\\\\secret.ts",
    )
    const res = ba.engine.ingestEvent(env)
    ba.engine.scrubToSeq(101)
    ba.syncVisuals()
    expectTrue(res.accepted, "redacted envelope accepted")
    const row1 = ba.cardRowText(1)
    expectTrue(row1.indexOf("sk-ant-") < 0 && row1.indexOf("ghp_") < 0 && row1.indexOf("lalwa") < 0, "secrets and host paths scrubbed from UI")
    // sample-mode card row 1 shows the engine explanation, not the raw event summary; the event the UI binds must carry the token
    const shown = ba.engine.activeEvent
    expectTrue(shown !== null && shown.summary.indexOf("[REDACTED") >= 0, "redaction token present on the event the UI renders: " + (shown ? shown.summary : "none"))
    log("L18", "secret redaction verified: " + row1)
  }
}`,
  },
  {
    id: "L19-malformed-event-handling",
    file: "L19MalformedEvent",
    cls: "BuildAliveL19MalformedEvent",
    body: `@component
export class BuildAliveL19MalformedEvent extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    const r1 = ba.transport.handleRawMessage("{not valid json")
    const r2 = ba.engine.ingestEvent({v: 1, seq: 1, evilField: "boom"})
    expectTrue(!r1.accepted && !r2.accepted, "malformed JSON and unknown fields rejected cleanly")
    expectTrue(ba.engine.getProvenanceSummary().droppedEvents >= 1, "droppedEvents counter incremented")
    log("L19", "malformed event handling verified without crash")
  }
}`,
  },
  {
    id: "L20-duplicate-out-of-order",
    file: "L20DuplicateOutOfOrder",
    cls: "BuildAliveL20DuplicateOutOfOrder",
    body: `@component
export class BuildAliveL20DuplicateOutOfOrder extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    const e10 = makeSyntheticLiveEnvelope(10, "tool_started", "inspect step 10")
    const e09 = makeSyntheticLiveEnvelope(9, "tool_started", "out-of-order step 9")
    expectTrue(ba.engine.ingestEvent(e10).accepted, "seq 10 accepted")
    expectTrue(!ba.engine.ingestEvent(e10).accepted, "duplicate eventId rejected")
    expectTrue(ba.engine.ingestEvent(e09).accepted, "out-of-order event sorted deterministically by seq")
    log("L20", "duplicate rejection and deterministic out-of-order ordering verified")
  }
}`,
  },
  {
    id: "L21-disconnect-fallback",
    file: "L21DisconnectFallback",
    cls: "BuildAliveL21DisconnectFallback",
    body: `@component
export class BuildAliveL21DisconnectFallback extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    ba.engine.handleReconnect(true)
    expectTrue(ba.engine.snapshot().provenance === "LIVE_VERIFIED", "live connection sets LIVE_VERIFIED")
    ba.transport.disconnect()
    ba.syncVisuals()
    expectTrue(ba.engine.snapshot().provenance === "LOCAL_RECORDED_REPLAY", "disconnect falls back to LOCAL_RECORDED_REPLAY")
    log("L21", "disconnect fallback to LOCAL_RECORDED_REPLAY verified")
  }
}`,
  },
  {
    id: "L22-reduced-motion-colour-safe",
    file: "L22Accessibility",
    cls: "BuildAliveL22Accessibility",
    body: `@component
export class BuildAliveL22Accessibility extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = await toBuildAliveStart()
    ba.engine.setAccessibilityOptions({reducedMotion: true, highContrast: true})
    while (ba.engine.snapshot().cursorSeq < 5) ba.handleStep()
    const snap = ba.engine.snapshot()
    expectTrue(snap.reducedMotion && snap.highContrast, "accessibility flags enabled")
    const testBadge = textOf(findSceneObjectByName("Module_TestSuite_Badge"))
    const stateBadge = textOf(findSceneObjectByName("Module_SharedState_Badge"))
    expectTrue(testBadge.indexOf("[FAIL]") >= 0, "failing module has non-color [FAIL] prefix")
    expectTrue(stateBadge.indexOf("[PASS]") >= 0, "passing module has non-color [PASS] prefix")
    log("L22", "reduced-motion and colour-blind safe double-coded badges verified")
  }
}`,
  },
  {
    id: "L23-real-workspace-islands",
    file: "L23RealWorkspaceIslands",
    cls: "BuildAliveL23RealWorkspaceIslands",
    body: `function logMapping(ba: ReturnType<typeof getMain>["buildAlive"]) {
  const proj = ba.engine.currentProject
  for (const m of proj.modules) {
    const slot = CITY_MODULES.find((c) => c.moduleId === m.id)
    const obj = slot ? findSceneObjectByName(slot.sceneName) : null
    log("L23", "MAP project=" + proj.projectId + " path=" + m.clusterId + " module=" + m.id + " object=" + (slot ? slot.sceneName : "none") + " enabled=" + (obj ? obj.enabled : false) + " label=" + m.label + " files=" + m.files.length)
    expectTrue(!!obj && obj.enabled, "module object enabled for real path " + m.clusterId)
  }
}

@component
export class BuildAliveL23RealWorkspaceIslands extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = getMain().buildAlive
    ba.useRealWorld("earthproof")
    await sleep(120)
    expectTrue(textOf(findSceneObjectByName("Island_LobbySync_Label")) === "EarthProof", "island 1 label is the real repo name EarthProof")
    expectTrue(textOf(findSceneObjectByName("Island_EdgeGuard_Label")) === "mnemosyne", "island 2 label is the real repo name mnemosyne")
    expectTrue(textOf(findSceneObjectByName("Island_EarthProof_Label")) === "Sample World", "island 3 is the selectable Sample World")
    const banner = textOf(findSceneObjectByName("ProvenanceBanner"))
    expectTrue(banner.indexOf("REAL REPO SCAN") >= 0 && banner.indexOf("no live agent event") >= 0, "banner says real scan snapshot, no live event: " + banner)
    expectTrue(banner.indexOf("LIVE_CONNECTED") < 0, "banner does not claim live")
    const proj = ba.engine.currentProject
    expectTrue(proj.provenance === "REAL_SCAN" && proj.title === "EarthProof", "current world is the real EarthProof scan")
    expectTrue(proj.modules.length >= 5, "EarthProof has real modules: " + proj.modules.length)
    logMapping(ba)
    ba.useRealWorld("mnemosyne")
    await sleep(120)
    expectTrue(ba.engine.currentProject.title === "mnemosyne" && ba.engine.currentProject.provenance === "REAL_SCAN", "mnemosyne is a real scan")
    logMapping(ba)
    log("L23", "real workspace worlds bound to islands with real module paths")
  }
}`,
  },
  {
    id: "L24-pinch-real-module-path",
    file: "L24PinchRealModule",
    cls: "BuildAliveL24PinchRealModule",
    body: `@component
export class BuildAliveL24PinchRealModule extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = getMain().buildAlive
    ba.useRealWorld("earthproof")
    const interactor = new DefaultLeafInteractor()
    await press(interactor, "Island_EdgeGuard")
    expectTrue(ba.engine.snapshot().projectId === "mnemosyne", "pinched island selects real mnemosyne")
    const mod = ba.engine.currentProject.modules.find((m) => m.clusterId === "src/lib")
    expectTrue(!!mod, "mnemosyne scan has a module for the real path src/lib")
    const slot = CITY_MODULES.find((c) => c.moduleId === (mod ? mod.id : ""))
    expectTrue(!!slot, "module slot has a scene object")
    await press(interactor, slot ? slot.sceneName : "")
    await sleep(200)
    expectTrue(ba.engine.snapshot().selectedModuleId === (mod ? mod.id : ""), "pinch selected the module")
    const row0 = ba.cardRowText(0)
    const row1 = ba.cardRowText(1)
    const row4 = ba.cardRowText(4)
    log("L24", "card rows: " + row0 + " || " + row1 + " || " + row4)
    expectTrue(row0.indexOf("mnemosyne") >= 0, "card names the real repo")
    expectTrue(row1.indexOf("src/lib/") >= 0, "card shows the real path src/lib/")
    expectTrue(row4.indexOf("src/lib/") >= 0, "card lists real files under src/lib/")
    log("L24", "pinching a real module opened its real path and files")
  }
}`,
  },
]

for (const s of scenarios) {
  const tsPath = path.join(LEAF_DIR, `${s.file}.ts`)
  fs.writeFileSync(tsPath, sharedHeader + "\n" + s.body + "\n", "utf8")
  fs.writeFileSync(tsPath + ".meta", makeMetaContent(`Assets/Scripts/Leaf/${s.file}.ts`), "utf8")
}

for (const name of ["BuildAliveCore.ts", "BuildAliveLayout.ts", "BuildAliveSceneUI.ts", "BuildAliveTransport.ts"]) {
  const metaPath = path.join(SCRIPTS_DIR, name + ".meta")
  fs.writeFileSync(metaPath, makeMetaContent(`Assets/Scripts/${name}`), "utf8")
}

const imports = scenarios.map((m) => `import {${m.cls}} from "./${m.file}"`).join("\n")
const entries = scenarios.map((m) => `    {id: "${m.id}", typename: ${m.cls}.getTypeName()},`).join("\n")

const leafIndexContent = `// Registers both the preserved EarthProof Rover scenarios (c1-c7) and the 22 mandatory
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
${imports}

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
${entries}
  ]
}
`
fs.writeFileSync(path.join(LEAF_DIR, "LeafIndex.ts"), leafIndexContent, "utf8")
console.log("Generated 22 L01-L22 single-component scenario files + .ts.meta files + updated LeafIndex.ts")
