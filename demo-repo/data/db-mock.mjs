// demo-repo/data/db-mock.mjs
// In-memory room snapshot store for deterministic tests.

export class RoomStore {
  constructor() {
    this.snapshots = new Map()
  }

  save(room) {
    this.snapshots.set(room.roomId, structuredClone(room))
    return true
  }

  load(roomId) {
    const snap = this.snapshots.get(roomId)
    return snap ? structuredClone(snap) : null
  }
}
