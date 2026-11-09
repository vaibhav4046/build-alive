import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {whenLabel} from "../BuildAliveTransport"
import {expectTrue, getMain, log, textOf} from "./EarthProofLeafKit"

// L31: persistent workspace. A bridge "history" frame (recent sessions from the journal) is injected through the real transport path.
// It must show as RECORDED session tiles with a timestamp chip, never as LIVE, never feed the engine as new events, and bad frames are refused.
// NOTE: the frame is injected here; a real websocket delivery needs Experimental APIs and is NOT proven by this test.
@component
export class BuildAliveL31HistoryRecorded extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const main = getMain()
    const ba = main.buildAlive
    ba.handleReset()
    await sleep(150)
    const row = (i: number): string => textOf(findSceneObjectByName("SessionRow_" + i))
    const now = Date.now()

    expectTrue(whenLabel(now - 30000, now) === "just now", "30 s ago -> just now")
    expectTrue(whenLabel(now - 12 * 60000, now) === "12 min ago", "12 min ago label")
    expectTrue(whenLabel(now - 86400000 * 3, now).indexOf("/") > 0, "older than yesterday -> short date")

    const seqBefore = ba.engine.snapshot().cursorSeq
    const connBefore = ba.engine.getProvenanceSummary().connectionState
    const frame = {
      type: "history",
      label: "RECORDED",
      sessions: [
        {sessionId: "s-new", startedAt: now - 3 * 3600000, lastAt: now - 2 * 3600000, count: 14, events: [
          {kind: "tool_started", status: "running", summary: "Running Bash on tool-action", actor: "primary-agent", fileAliases: ["tool-action"], ts: now - 2 * 3600000 - 1000},
          {kind: "test_completed", status: "failed", summary: "tests failed", actor: "primary-agent", fileAliases: ["tests/room-capacity.test.mjs"], ts: now - 2 * 3600000},
        ]},
        {sessionId: "s-old", startedAt: now - 30 * 3600000, lastAt: now - 29 * 3600000, count: 5, events: [
          {kind: "session_started", status: "succeeded", summary: "session started", actor: "primary-agent", fileAliases: [], ts: now - 29 * 3600000},
        ]},
      ],
    }
    const res = main.buildAlive.transport.handleRawMessage(JSON.stringify(frame))
    await sleep(120)
    expectTrue(res.accepted && res.reason === "history_loaded", "a valid history frame is accepted (" + res.reason + ")")
    expectTrue(row(0).indexOf("RECORDED") === 0, "first tile is labelled RECORDED (" + row(0) + ")")
    expectTrue(row(0).indexOf("earlier today") >= 0 || row(0).indexOf("min ago") >= 0, "tile carries a timestamp chip (" + row(0) + ")")
    expectTrue(row(0).indexOf("14 steps") >= 0, "tile shows the session's real step count")
    expectTrue(row(1).indexOf("RECORDED") === 0 && row(1).indexOf("yesterday") >= 0, "older session is grouped separately and labelled yesterday (" + row(1) + ")")
    expectTrue(row(0).indexOf("LIVE") < 0 && row(1).indexOf("LIVE") < 0, "history is never labelled LIVE")
    expectTrue(ba.engine.snapshot().cursorSeq === seqBefore, "history does not move the replay cursor")
    expectTrue(ba.engine.getProvenanceSummary().connectionState === connBefore, "history does not change the connection/provenance state")

    // bad frames: refused, previous history stays
    const bad = ba.transport.handleRawMessage(JSON.stringify({type: "history", sessions: "nope"}))
    expectTrue(!bad.accepted, "a malformed history frame is refused")
    const huge = ba.transport.handleRawMessage('{"type":"history","pad":"' + "x".repeat(70000) + '"}')
    expectTrue(!huge.accepted, "an oversized history frame is refused")
    log("L31", "history shown as RECORDED with timestamp chips, never LIVE; injected frame, real websocket delivery not proven")
  }
}
