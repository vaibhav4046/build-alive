// demo-repo/client/view.mjs
// Projects room state into HUD banner text for clients.

export function renderLobbyHud(room, lastCode = "READY") {
  const full = room.players.length >= room.maxPlayers
  return {
    badge: full ? "[FULL]" : "[OPEN]",
    occupancyText: `${room.players.length}/${room.maxPlayers} players`,
    statusText: lastCode === "ROOM_FULL" ? "Room at capacity (4/4)" : `Status: ${lastCode}`,
  }
}
