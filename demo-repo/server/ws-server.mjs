// demo-repo/server/ws-server.mjs
// Deterministic frame serializer for LobbySync room state updates.

export function encodeRoomUpdateFrame(room, result) {
  return JSON.stringify({
    type: "ROOM_STATE_UPDATE",
    roomId: room.roomId,
    code: result.code,
    accepted: result.accepted,
    occupancy: `${room.players.length}/${room.maxPlayers}`,
    version: room.version,
  })
}
