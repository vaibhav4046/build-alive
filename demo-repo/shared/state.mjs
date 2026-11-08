// demo-repo/shared/state.mjs
// Shared deterministic room state contract for LobbySync.

export const DEFAULT_MAX_PLAYERS = 4

export function createRoomState(roomId, maxPlayers = DEFAULT_MAX_PLAYERS) {
  return {
    roomId: String(roomId),
    maxPlayers: Number(maxPlayers),
    players: [],
    version: 1,
  }
}

export function validateRoomInvariants(room) {
  const errors = []
  if (!room || typeof room.roomId !== "string" || room.roomId.length === 0) {
    errors.push("invalid roomId")
  }
  if (!Array.isArray(room?.players)) {
    errors.push("players must be an array")
  } else if (room.players.length > room.maxPlayers) {
    errors.push(`ROOM_OVERFLOW: players (${room.players.length}) > maxPlayers (${room.maxPlayers})`)
  }
  return {
    valid: errors.length === 0,
    errors,
  }
}
