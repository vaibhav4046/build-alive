// demo-repo/tests/room-capacity.test.mjs
// Runnable test suite for the LobbySync demo repository (test-room-01 .. test-room-04).

import assert from "node:assert/strict"
import {openLobbyRoom, joinRoom} from "../server/lobby.mjs"
import {validateRoomInvariants} from "../shared/state.mjs"
import {encodeRoomUpdateFrame} from "../server/ws-server.mjs"
import {renderLobbyHud} from "../client/view.mjs"
import {RoomStore} from "../data/db-mock.mjs"

export function runDemoRepoSuite({useBuggyGuard = false} = {}) {
  const results = []

  // test-room-01: create room and join 4 players up to capacity
  {
    let room = openLobbyRoom("room-01", 4)
    for (const p of ["p1", "p2", "p3", "p4"]) {
      const res = joinRoom(room, p, {useBuggyGuard})
      room = res.room
    }
    const ok = room.players.length === 4 && validateRoomInvariants(room).valid
    results.push({id: "test-room-01", passed: ok, detail: `players=${room.players.length}/4`})
  }

  // test-room-02: reject duplicate player id
  {
    let room = openLobbyRoom("room-02", 4)
    room = joinRoom(room, "p1", {useBuggyGuard}).room
    const dup = joinRoom(room, "p1", {useBuggyGuard})
    const ok = dup.accepted === false && dup.code === "DUPLICATE_PLAYER"
    results.push({id: "test-room-02", passed: ok, detail: `code=${dup.code}`})
  }

  // test-room-03: 5th player must be rejected with ROOM_FULL when room has 4/4 players
  {
    let room = openLobbyRoom("room-03", 4)
    for (const p of ["p1", "p2", "p3", "p4"]) {
      room = joinRoom(room, p, {useBuggyGuard}).room
    }
    const fifth = joinRoom(room, "p5", {useBuggyGuard})
    const inv = validateRoomInvariants(fifth.room)
    const ok = fifth.accepted === false && fifth.code === "ROOM_FULL" && inv.valid
    results.push({
      id: "test-room-03",
      passed: ok,
      detail: ok ? "rejected 5th player with ROOM_FULL (4/4)" : `FAIL: accepted 5th player (${fifth.room.players.length}/4)`,
    })
  }

  // test-room-04: serializer, HUD view, and RoomStore round-trip
  {
    const store = new RoomStore()
    let room = openLobbyRoom("room-04", 4)
    const step = joinRoom(room, "p1", {useBuggyGuard})
    room = step.room
    store.save(room)
    const loaded = store.load("room-04")
    const frame = JSON.parse(encodeRoomUpdateFrame(loaded, step))
    const hud = renderLobbyHud(loaded, step.code)
    const ok = frame.occupancy === "1/4" && hud.badge === "[OPEN]"
    results.push({id: "test-room-04", passed: ok, detail: `frame=${frame.occupancy} badge=${hud.badge}`})
  }

  return {
    passed: results.every((r) => r.passed),
    total: results.length,
    passedCount: results.filter((r) => r.passed).length,
    failedCount: results.filter((r) => !r.passed).length,
    results,
  }
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const buggy = runDemoRepoSuite({useBuggyGuard: true})
  assert.equal(buggy.passed, false, "buggy guard must fail test-room-03")
  assert.equal(buggy.results.find((r) => r.id === "test-room-03").passed, false)

  const fixed = runDemoRepoSuite({useBuggyGuard: false})
  assert.equal(fixed.passed, true, "repaired guard must pass all 4 tests")
  console.log(`demo-repo suite verified: buggy=${buggy.passedCount}/${buggy.total} pass, repaired=${fixed.passedCount}/${fixed.total} pass`)
}
