// Shared helpers for the EarthProof LEAF scenarios (not a component).
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObject, findSceneObjectByName, findSceneObjectsByName, nextFrame, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {EarthProofMain} from "../EarthProofMain"

export const SEAT_LOCAL = new vec3(0, 3.4, 0) // block centre in MotorMount space (same as EarthProofMain)

export function log(tag: string, msg: string): void {
  print("[LEAF " + tag + "] " + msg)
}

export function getMain(): EarthProofMain {
  return findSceneObjectByName("EarthProof").getComponent(EarthProofMain.getTypeName()) as EarthProofMain
}

export function exists(name: string): boolean {
  return findSceneObjectsByName(name).length > 0
}

export function textOf(obj: SceneObject): string {
  return (obj.getComponent("Component.Text") as Text).text
}

/** Text of row `row` (Row0, Row1, ...) of a card ("EvidenceCard" or "ProofCard"). */
export function cardRow(card: string, row: number): string {
  const o = findSceneObject((s) => s.name === "Row" + row && s.getParent() !== null && s.getParent().getParent() !== null && s.getParent().getParent().name === card)
  return textOf(o)
}

export function seatWorld(): vec3 {
  return findSceneObjectByName("MotorMount").getTransform().getWorldTransform().multiplyPoint(SEAT_LOCAL)
}

export function pos(name: string): vec3 {
  return findSceneObjectByName(name).getTransform().getWorldPosition()
}

/** Polls every frame until cond() is true; returns elapsed ms, throws on timeout. */
export async function waitUntil(cond: () => boolean, timeoutMs: number, label: string): Promise<number> {
  const t0 = Date.now()
  while (!cond()) {
    if (Date.now() - t0 > timeoutMs) throw new Error("timeout waiting for " + label + " (" + timeoutMs + " ms)")
    await nextFrame()
  }
  return Date.now() - t0
}

export function interactable(name: string) {
  const found = findInteractablesByName(name, undefined, true)
  if (found.length === 0) throw new Error("interactable not found or not enabled: " + name)
  return found[0]
}

export async function press(interactor: DefaultLeafInteractor, name: string): Promise<void> {
  await interactor.trigger(interactable(name))
  await sleep(60)
}

/** Put the Lens in its start state (same call as pressing Reset). */
export async function toStart(): Promise<EarthProofMain> {
  const main = getMain()
  main.handleReset()
  await sleep(250)
  return main
}

export function expectNear(actual: number, want: number, tol: number, what: string): void {
  if (Math.abs(actual - want) > tol) throw new Error(what + ": got " + actual + ", want " + want + " +/- " + tol)
}

export function expectTrue(cond: boolean, what: string): void {
  if (!cond) throw new Error("expected: " + what)
  expect(cond).toBe(true)
}
