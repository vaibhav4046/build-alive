import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {routeVoice} from "../BuildAliveVoice"
import {expectTrue, getMain, log, textOf} from "./EarthProofLeafKit"

// L30: voice commands. TRANSCRIPTS ARE INJECTED here (handleVoice) so the router and the answers are tested deterministically; whether the
// real built-in ASR hears a microphone is NOT proven by this test. The scenario also taps the mic once and logs ASR's honest status.
@component
export class BuildAliveL30VoiceCommands extends Scenario {
  async run(): Promise<void> {
    await sleep(1000)
    const ba = getMain().buildAlive
    ba.useSampleWorld()
    ba.handleReset()
    await sleep(150)
    const row = (i: number): string => textOf(findSceneObjectByName("SessionRow_" + i))

    // router: each phrase maps to its intent; unknown phrases never trigger anything
    const cases: [string, string][] = [
      ["what just happened", "what_happened"],
      ["Why did it fail?", "why_failed"],
      ["what should I try", "what_try"],
      ["explain the command", "explain_command"],
      ["next step please", "next_step"],
      ["approve", "approve"],
      ["deny", "deny"],
      ["play some music", "unknown"],
      ["", "unknown"],
    ]
    for (const c of cases) expectTrue(routeVoice(c[0]) === c[1], "'" + c[0] + "' -> " + c[1] + " (got " + routeVoice(c[0]) + ")")

    // before any step: honest "nothing yet" answers, never made-up events
    ba.handleVoice("what just happened")
    await sleep(80)
    expectTrue(row(0).indexOf("You said") === 0, "the transcript is shown first as a tile")
    expectTrue(row(1).indexOf("Nothing has happened yet") >= 0, "no steps yet -> honest answer (" + row(1) + ")")

    // unknown phrase -> the help line, nothing else happens
    const seqBefore = ba.engine.snapshot().cursorSeq
    ba.handleVoice("sing me a song")
    await sleep(80)
    expectTrue(row(1).indexOf("I can answer") === 0, "unknown phrase gets 'I can answer: ...'")
    expectTrue(ba.engine.snapshot().cursorSeq === seqBefore, "an unknown phrase changes nothing")

    // 'next step' by voice moves the replay; 'why did it fail' reaches the failed check
    for (let i = 0; i < 4; i++) {
      ba.handleVoice("next step")
      await sleep(60)
    }
    expectTrue(ba.engine.snapshot().cursorSeq >= 4, "voice 'next step' advances the replay (" + ba.engine.snapshot().cursorSeq + ")")
    ba.handleVoice("why did it fail")
    await sleep(80)
    expectTrue(row(1).length > 0 && row(1).indexOf("Nothing has failed") < 0, "'why did it fail' explains the failed check (" + row(1) + ")")
    expectTrue(row(1).indexOf("(replay)") >= 0, "the answer is labelled as a replay, not live")
    ba.handleVoice("what should I try")
    await sleep(80)
    expectTrue(row(1).indexOf("Try:") === 0, "'what should I try' gives the try-next tip")

    // approve is two-step: the first 'approve' only asks on screen, nothing runs until the second
    const repaired = (): boolean => ba.engine.snapshot().testRepaired
    ba.handleVoice("approve")
    await sleep(80)
    expectTrue(row(1).indexOf("read-only check") >= 0 && row(2).indexOf("Confirm") === 0, "first 'approve' asks for confirmation on screen")
    expectTrue(!repaired(), "nothing ran after only the first 'approve'")
    ba.handleVoice("deny")
    await sleep(80)
    expectTrue(row(1).indexOf("Denied") === 0 && !repaired(), "'deny' cancels and nothing runs")

    // real ASR: tap the mic and record the honest status (Preview may or may not provide ASR)
    ba.handleMic()
    await sleep(500)
    const v = ba.voiceSnapshot()
    log("L30", "mic tap -> listening=" + v.listening + ", status='" + v.micStatus + "' (transcripts above were injected, not heard)")
    if (v.listening) ba.handleMic()
    log("L30", "voice commands verified with injected transcripts; real microphone not proven here")
  }
}
