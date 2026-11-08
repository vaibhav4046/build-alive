// gen-scene-build-alive.mjs
// VirtualScene JSON generator for BUILD ALIVE + preserved EarthProof Rover fallback.
// Emits a deterministic VirtualScene hierarchy describing the desk-scale Architecture City,
// 3 Project Islands, Agent Vessels, Rewind Crystal, Fault Marker, and UIKit front rail.

export function generateBuildAliveVirtualScene() {
  return {
    schemaVersion: "1.0.0",
    name: "BuildAlive_DeskWorkbench",
    provenanceDefault: "LOCAL_RECORDED_REPLAY",
    units: "cm",
    camera: {
      name: "Camera Object",
      pos: [0, 0, 0],
      fovDeg: 46,
    },
    children: [
      {
        name: "BuildAliveRoot",
        pos: [0, 0, 0],
        children: [
          {name: "DeskShelf", primitive: "Box", pos: [0, -30, -90], scale: [96, 1.5, 44]},
          {name: "ProvenanceBanner", primitive: "Text", pos: [0, 9, -92], text: "LOCAL_RECORDED_REPLAY | LOBBYSYNC | STEP 1/12"},
          {name: "Island_LobbySync", primitive: "Box", pos: [-30, -27.5, -86], scale: [14, 3.2, 10]},
          {name: "Island_EdgeGuard", primitive: "Box", pos: [0, -27.5, -86], scale: [14, 3.2, 10]},
          {name: "Island_EarthProof", primitive: "Box", pos: [30, -27.5, -86], scale: [14, 3.2, 10]},
          {name: "Module_lobby", primitive: "Box", pos: [-18, -24.5, -96], scale: [7.5, 9.0, 7.5]},
          {name: "Module_state", primitive: "Box", pos: [-6, -25.0, -100], scale: [7.5, 8.0, 7.5]},
          {name: "Module_ws", primitive: "Box", pos: [6, -24.0, -98], scale: [7.5, 10.0, 7.5]},
          {name: "Module_view", primitive: "Box", pos: [18, -25.5, -95], scale: [7.5, 7.0, 7.5]},
          {name: "Module_db", primitive: "Box", pos: [-12, -26.0, -108], scale: [7.0, 6.0, 7.0]},
          {name: "Module_test", primitive: "Box", pos: [12, -24.8, -107], scale: [7.5, 8.4, 7.5]},
          {name: "AgentVessel_Primary", primitive: "Cylinder", pos: [-18, -15, -96], scale: [3.2, 3.2, 3.2]},
          {name: "AgentVessel_Sub01", primitive: "Cylinder", pos: [12, -14, -107], scale: [2.6, 2.6, 2.6]},
          {name: "RewindCrystal", primitive: "Box", pos: [-34, -18, -94], scale: [6.0, 6.0, 6.0]},
          {name: "FaultMarker_Room03", primitive: "Cylinder", pos: [12, -18, -107], scale: [5.5, 5.5, 5.5]},
          {name: "BA_StepButton", primitive: "UIKitButton", pos: [-28, -32, -74], size: [11, 6]},
          {name: "BA_InspectButton", primitive: "UIKitButton", pos: [-14, -32, -74], size: [11, 6]},
          {name: "BA_LearnButton", primitive: "UIKitButton", pos: [0, -32, -74], size: [11, 6]},
          {name: "BA_ApproveButton", primitive: "UIKitButton", pos: [14, -32, -74], size: [11, 6]},
          {name: "BA_ResetButton", primitive: "UIKitButton", pos: [28, -32, -74], size: [11, 6]},
          {name: "BuildAliveCard", primitive: "UIKitBackPlate", pos: [26, -7, -94], size: [30, 19]},
        ],
      },
    ],
  }
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  console.log(JSON.stringify(generateBuildAliveVirtualScene(), null, 2))
}
