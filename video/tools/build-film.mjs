// Assembles the BUILD ALIVE film from real Preview clips/stills + an optional cold open, with ffmpeg only.
// Usage: node video/tools/build-film.mjs video/film-plan.json
// Plan: { out, width, height, fps, score, segments: [{ src, dur, start?, caption?, tag? }] }
//   src: .mp4/.mov (trimmed from `start` for `dur` s) or .png/.jpg (slow push-in for `dur` s)
//   caption: one plain line burned at the bottom; tag: provenance label burned top-left (e.g. "Lens Studio Preview · REPLAY")
import {spawnSync} from "node:child_process"
import {mkdirSync, writeFileSync, readFileSync, existsSync, rmSync} from "node:fs"
import {resolve, dirname, join, extname} from "node:path"

const FF = process.env.FFMPEG_BIN || "C:/Users/lalwa/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin"
const FONT = "C\\:/Windows/Fonts/segoeui.ttf"
const FONT_B = "C\\:/Windows/Fonts/segoeuib.ttf"
const BG = "0x1b1d21"
const FADE = 0.35

const planPath = resolve(process.argv[2] || "video/film-plan.json")
const plan = JSON.parse(readFileSync(planPath, "utf8"))
const base = dirname(planPath)
const W = plan.width || 1920, H = plan.height || 1080, FPS = plan.fps || 30
const work = join(base, ".film-work")
rmSync(work, {recursive: true, force: true})
mkdirSync(work, {recursive: true})

const run = (bin, args) => {
  const r = spawnSync(join(FF, bin), args, {encoding: "utf8"})
  if (r.status !== 0) { console.error(r.stderr.slice(-3000)); throw new Error(bin + " failed") }
  return r.stdout
}
// drawtext reads text from a file, so no escaping problems with quotes/colons in captions.
const textFile = (name, text) => { const p = join(work, name); writeFileSync(p, text, "utf8"); return p.replace(/\\/g, "/").replace(/:/g, "\\:") }

const parts = []
plan.segments.forEach((s, i) => {
  const src = resolve(base, s.src)
  if (!existsSync(src)) throw new Error("missing segment source: " + src)
  const isImg = [".png", ".jpg", ".jpeg"].includes(extname(src).toLowerCase())
  const dur = s.dur
  const fit = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=${BG},setsar=1`
  // Stills get a gentle 4% push-in so the frame breathes; footage is left untouched.
  const motion = isImg ? `,zoompan=z='1+0.04*on/${Math.round(dur * FPS)}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(dur * FPS)}:s=${W}x${H}:fps=${FPS}` : `,fps=${FPS}`
  let vf = fit + motion
  if (s.caption) {
    const tf = textFile(`cap${i}.txt`, s.caption)
    vf += `,drawbox=x=0:y=ih-150:w=iw:h=150:color=${BG}@0.82:t=fill`
    vf += `,drawtext=fontfile='${FONT}':textfile='${tf}':fontcolor=white:fontsize=50:x=(w-text_w)/2:y=h-102`
  }
  if (s.tag) {
    const tf = textFile(`tag${i}.txt`, s.tag)
    vf += `,drawtext=fontfile='${FONT_B}':textfile='${tf}':fontcolor=white@0.9:fontsize=28:box=1:boxcolor=${BG}@0.75:boxborderw=14:x=40:y=36`
  }
  vf += `,fade=t=in:st=0:d=${FADE},fade=t=out:st=${(dur - FADE).toFixed(2)}:d=${FADE},format=yuv420p`
  const out = join(work, `seg${String(i).padStart(2, "0")}.mp4`)
  const input = isImg ? ["-loop", "1", "-framerate", String(FPS), "-t", String(dur), "-i", src] : ["-ss", String(s.start || 0), "-t", String(dur), "-i", src]
  run("ffmpeg.exe", ["-y", "-v", "error", ...input, "-vf", vf, "-an", "-r", String(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-t", String(dur), out])
  parts.push(out)
  console.log(`seg ${i}: ${s.src} ${dur}s`)
})

const list = join(work, "list.txt")
writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n"))
const silent = join(work, "video.mp4")
run("ffmpeg.exe", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", silent])

const total = plan.segments.reduce((a, s) => a + s.dur, 0)
if (total >= 180) throw new Error(`film is ${total}s; rules require under 3:00`)
const out = resolve(base, plan.out)
mkdirSync(dirname(out), {recursive: true})
const score = resolve(base, plan.score)
run("ffmpeg.exe", ["-y", "-v", "error", "-i", silent, "-stream_loop", "-1", "-i", score,
  "-filter_complex", `[1:a]atrim=0:${total},afade=t=in:st=0:d=1.5,afade=t=out:st=${total - 3}:d=3,loudnorm=I=-16:TP=-1.5:LRA=11[a]`,
  "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out])
console.log(`wrote ${out} (${total.toFixed(1)} s planned)`)
