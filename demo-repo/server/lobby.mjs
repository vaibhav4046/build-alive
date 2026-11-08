// demo-repo/server/lobby.mjs
// Room join/leave state machine. Supports demonstrating the off-by-one capacity bug
// (`room.players.length > room.maxPlayers`) and the repaired guard (`>=`).

import {createRoomState, DEFAULT_MAX_PLAYERS, validateRoomInvariants} from "../shared/state.mjs"

export function openLobbyRoom(roomId = "room-alpha", maxPlayers = DEFAULT_MAX_PLAYERS) {
  return createRoomState(roomId, maxPlayers)
}

/**
 * Attempts to add a player to a room.
 * When `useBuggyGuard === true`, uses `>` (off-by-one bug that allows a 5th player when maxPlayers=4).
 * When `useBuggyGuard === false` (default repaired state), uses `>=` so capacity is strictly enforced.
 */
export function joinRoom(room, playerId, {useBuggyGuard = false} = {}) {
  if (room.players.includes(playerId)) {
    return {accepted: false, code: "DUPLICATE_PLAYER", room}
  }
  const overCapacity = useBuggyGuard
    ? room.players.length > room.maxPlayers
    : room.players.length >= room.maxPlayers

  if (overCapacity) {
    return {accepted: false, code: "ROOM_FULL", room}
  }

  const nextRoom = {
    ...room,
    players: [...room.players, playerId],
    version: room.version + 1,
  }
  return {
    accepted: true,
    code: "JOINED",
    room: nextRoom,
    invariants: validateRoomInvariants(nextRoom),
  }
}
