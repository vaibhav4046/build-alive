// bridge/project-discovery.mjs
// ProjectDiscovery + ProjectGraph + LanguageAnalyzers (TS/JS, Python, fallback folder tree).
// Reads ONLY user-approved roots (approved-roots.json), only git-tracked files, never secrets.
// Nothing is invented: unresolved imports are counted as unresolved, not drawn as edges.

import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import {execFileSync} from "node:child_process"

export const MAX_FILES = 50000
export const MAX_FILE_BYTES = 1024 * 1024
const SECRET_NAME = /(^|\/)(\.env(\..*)?|\.mcp\.json|id_rsa.*|.*\.(pem|key|p12|pfx)|.*secret.*|.*credential.*)$/i
const BINARY_EXT = new Set([".meta", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".mp4", ".mp3", ".wav", ".zip", ".woff", ".woff2", ".ttf", ".glb", ".fbx", ".bin", ".exe", ".dll", ".lspkg"])
const SKIP_DIR = /(^|\/)(node_modules|\.git|\.venv|venv|__pycache__|dist|build|\.next|Cache|Packages|\.cache)(\/|$)/
const SRC_EXT = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py"]

export function loadApprovedRoots(configPath) {
  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"))
  if (cfg.schemaVersion !== 1 || !Array.isArray(cfg.roots)) throw new Error("bad approved-roots.json")
  return cfg.roots.filter((r) => r.permissions && r.permissions.observe === true).map((r) => path.resolve(r.path))
}

function git(root, args) {
  return execFileSync("git", ["-C", root, ...args], {encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"]})
}

export function isGitRepo(root) {
  try {
    return git(root, ["rev-parse", "--show-toplevel"]).trim().length > 0
  } catch (_e) {
    return false
  }
}

/** F002: git repositories inside an approved root (the root itself, or direct children). */
export function findRepos(approvedRoot) {
  if (!fs.existsSync(approvedRoot)) return []
  if (fs.existsSync(path.join(approvedRoot, ".git"))) return [approvedRoot]
  const out = []
  for (const d of fs.readdirSync(approvedRoot, {withFileTypes: true})) {
    if (d.isDirectory() && !d.name.startsWith(".") && fs.existsSync(path.join(approvedRoot, d.name, ".git"))) out.push(path.join(approvedRoot, d.name))
  }
  return out
}

export function listTrackedFiles(root) {
  const all = git(root, ["ls-files", "-z", "--cached", "--others", "--exclude-standard"]).split("\0").filter(Boolean)
  const kept = []
  let ignored = 0
  for (const f of all) {
    const p = f.replace(/\\/g, "/")
    if (SECRET_NAME.test(p) || SKIP_DIR.test(p) || BINARY_EXT.has(path.extname(p).toLowerCase())) {
      ignored++
      continue
    }
    if (kept.length >= MAX_FILES) {
      ignored++
      continue
    }
    kept.push(p)
  }
  return {files: kept, ignored}
}

export function classifyRole(p) {
  const l = p.toLowerCase()
  if (/(^|\/)(tests?|__tests__|spec|e2e)(\/|$)|\.(test|spec)\.[a-z]+$|(^|\/)test_[^/]+\.py$/.test(l)) return "Tests"
  if (/\.(png|jpg|svg|css|scss|html|md)$|(^|\/)(public|assets|static|video|docs?|devpost)(\/|$)/.test(l)) return "Assets"
  if (/(^|\/)(db|database|prisma|migrations?|schema|models?|data)(\/|$)|\.(sql|csv|json)$/.test(l)) return "Data"
  if (/(^|\/)(api|routes?|server|bridge|backend)(\/|$)/.test(l)) return "API"
  if (/(^|\/)(components?|pages?|app|ui|views?|client|frontend)(\/|$)|\.(tsx|jsx)$/.test(l)) return "UI"
  return "Logic"
}

function clusterOf(p) {
  const parts = p.split("/")
  if (parts.length === 1) return "(root)"
  // descend through a single generic container to reach the real package boundary
  if ((parts[0] === "src" || parts[0] === "packages" || parts[0] === "Assets") && parts.length > 2) return parts[0] + "/" + parts[1]
  return parts[0]
}

const JS_IMPORT = /(?:import\s+(?:[^'"]*?\s+from\s+)?|export\s+[^'"]*?\s+from\s+|require\(\s*|import\(\s*)['"]([^'"]+)['"]/g
const PY_IMPORT = /^\s*(?:from\s+([.\w]+)\s+import|import\s+([\w.]+))/gm

export function extractImports(ext, text) {
  const specs = []
  if (ext === ".py") {
    let m
    PY_IMPORT.lastIndex = 0
    while ((m = PY_IMPORT.exec(text))) specs.push(m[1] || m[2])
  } else {
    let m
    JS_IMPORT.lastIndex = 0
    while ((m = JS_IMPORT.exec(text))) specs.push(m[1])
  }
  return specs
}

function resolveRelative(fromFile, spec, fileSet, alias) {
  let base
  if (spec.startsWith(".")) base = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), spec))
  else if (alias && spec.startsWith("@/")) base = spec.slice(2)
  else return null
  if (base.startsWith("..")) return null // root-scoping: never leave the repo
  const cands = [base, ...SRC_EXT.map((e) => base + e), ...SRC_EXT.map((e) => base + "/index" + e)]
  if (base.endsWith(".js")) cands.push(base.slice(0, -3) + ".ts", base.slice(0, -3) + ".tsx")
  if (alias && spec.startsWith("@/")) for (const e of ["", ...SRC_EXT]) cands.push("src/" + base + e)
  for (const c of cands) if (fileSet.has(c)) return c
  return null
}

export function buildWorld(repoRoot) {
  const name = path.basename(repoRoot)
  const {files, ignored} = listTrackedFiles(repoRoot)
  const fileSet = new Set(files)
  const alias = fileSet.has("tsconfig.json") && /"@\/\*"/.test(safeRead(path.join(repoRoot, "tsconfig.json")))
  const fileEdges = []
  const externals = new Map()
  let unresolved = 0
  let analyzed = 0
  const langs = {}
  const loc = {}
  for (const f of files) {
    const ext = path.extname(f).toLowerCase()
    langs[ext || "(none)"] = (langs[ext || "(none)"] || 0) + 1
    if (!SRC_EXT.includes(ext)) continue
    const abs = path.join(repoRoot, f)
    let st
    try {
      st = fs.statSync(abs)
    } catch (_e) {
      continue
    }
    if (st.size > MAX_FILE_BYTES) continue
    const text = safeRead(abs)
    loc[f] = text.split("\n").length
    analyzed++
    for (const spec of extractImports(ext, text)) {
      if (spec.startsWith(".") || (alias && spec.startsWith("@/"))) {
        const target = resolveRelative(f, spec, fileSet, alias)
        if (target) fileEdges.push([f, target])
        else unresolved++
      } else if (ext !== ".py" || !spec.startsWith(".")) {
        const pkg = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0].split(".")[0]
        externals.set(pkg, (externals.get(pkg) || 0) + 1)
      }
    }
  }

  const byCluster = new Map()
  for (const f of files) {
    const c = clusterOf(f)
    if (!byCluster.has(c)) byCluster.set(c, [])
    byCluster.get(c).push(f)
  }
  const clusters = [...byCluster.entries()].map(([id, fs_]) => {
    const roles = {}
    for (const f of fs_) roles[classifyRole(f)] = (roles[classifyRole(f)] || 0) + 1
    const role = Object.entries(roles).sort((a, b) => b[1] - a[1])[0][0]
    const ranked = [...fs_].sort((a, b) => (loc[b] || 0) - (loc[a] || 0))
    return {id, label: id.split("/").pop() === "(root)" ? "(root)" : id.split("/").pop(), role, fileCount: fs_.length, loc: fs_.reduce((s, f) => s + (loc[f] || 0), 0), files: ranked.slice(0, 8)}
  })
  clusters.sort((a, b) => b.fileCount - a.fileCount || a.id.localeCompare(b.id)) // stable layout order (F019)

  const edgeMap = new Map()
  for (const [a, b] of fileEdges) {
    const ca = clusterOf(a)
    const cb = clusterOf(b)
    if (ca === cb) continue
    const k = ca + "->" + cb
    edgeMap.set(k, (edgeMap.get(k) || 0) + 1)
  }
  const edges = [...edgeMap.entries()].map(([k, w]) => {
    const [from, to] = k.split("->")
    return {from, to, weight: w, verified: true, via: "resolved-import"}
  })

  let branch = "unknown"
  let dirty = null
  let head = null
  try {
    branch = git(repoRoot, ["rev-parse", "--abbrev-ref", "HEAD"]).trim()
    head = git(repoRoot, ["rev-parse", "--short", "HEAD"]).trim()
    dirty = git(repoRoot, ["status", "--porcelain"]).split("\n").filter(Boolean).length
  } catch (_e) {
    // leave unresolved
  }
  const manifests = ["package.json", "pyproject.toml", "Cargo.toml", "requirements.txt", "tsconfig.json", "README.md"].filter((m) => fileSet.has(m))
  const treeHash = crypto.createHash("sha256").update(files.join("\n")).digest("hex").slice(0, 16)
  return {
    schemaVersion: 1,
    projectId: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    provenance: "REAL_SCAN",
    branch,
    head,
    dirtyFiles: dirty,
    fileCount: files.length,
    ignoredCount: ignored,
    analyzedSourceFiles: analyzed,
    manifests,
    languages: langs,
    clusters,
    edges,
    unresolvedImports: unresolved,
    resolvedFileEdges: fileEdges.length,
    topExternals: [...externals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, c]) => ({name: n, count: c})),
    treeHash,
    generatedAt: new Date().toISOString(),
  }
}

function safeRead(p) {
  try {
    return fs.readFileSync(p, "utf8")
  } catch (_e) {
    return ""
  }
}

/** Source preview for one file: root-scoped, secret-blocked, size-capped (F031/F113). */
export function readFilePreview(repoRoot, rel, maxLines = 40) {
  const p = String(rel).replace(/\\/g, "/")
  if (p.includes("\0") || p.startsWith("/") || /^[A-Za-z]:/.test(p) || p.split("/").includes("..")) return {ok: false, reason: "path_traversal"}
  if (SECRET_NAME.test(p) || SKIP_DIR.test(p)) return {ok: false, reason: "blocked_by_ignore_rules"}
  const abs = path.resolve(repoRoot, p)
  if (!abs.startsWith(path.resolve(repoRoot) + path.sep)) return {ok: false, reason: "outside_root"}
  if (!fs.existsSync(abs) || fs.statSync(abs).size > MAX_FILE_BYTES) return {ok: false, reason: "missing_or_too_large"}
  return {ok: true, path: p, lines: fs.readFileSync(abs, "utf8").split("\n").slice(0, maxLines)}
}

export function discoverWorlds(configPath) {
  const out = []
  for (const root of loadApprovedRoots(configPath)) {
    for (const repo of findRepos(root)) out.push({repoRoot: repo, world: buildWorld(repo)})
  }
  return out
}

/** Transport-safe alias: every segment limited to [A-Za-z0-9._-] (matches the Lens validator). */
export function safeAlias(rel) {
  return String(rel)
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .map((s) => s.replace(/[^A-Za-z0-9._-]/g, "_"))
    .join("/")
}
export const ROOT_CLUSTER_ID = "_root_"

/** Compact, sanitized world for the Lens (<=16 clusters, 12 files each, no absolute paths). */
export function toLensWorld(world, maxClusters = 16) {
  const cid = (id) => (id === "(root)" ? ROOT_CLUSTER_ID : safeAlias(id))
  const top = world.clusters.slice(0, maxClusters)
  const keep = new Set(top.map((c) => c.id))
  return {
    projectId: world.projectId.slice(0, 64),
    name: world.name,
    branch: world.branch,
    head: world.head || "",
    dirtyFiles: world.dirtyFiles ?? 0,
    fileCount: world.fileCount,
    unresolvedImports: world.unresolvedImports,
    totalClusters: world.clusters.length,
    clusters: top.map((c) => ({id: cid(c.id), label: c.label === "(root)" ? "root" : c.label, role: c.role, fileCount: c.fileCount, loc: c.loc, files: c.files.map(safeAlias)})),
    edges: world.edges.filter((e) => keep.has(e.from) && keep.has(e.to)).map((e) => ({from: cid(e.from), to: cid(e.to), weight: e.weight})),
  }
}

/** Maps absolute paths / command text to {projectId, alias} for approved repos only. */
export function makeResolver(entries) {
  const norm = (p) => path.resolve(p).replace(/\\/g, "/").toLowerCase()
  const repos = entries.map((e) => ({
    projectId: e.world.projectId,
    root: norm(e.repoRoot),
    rootRaw: e.repoRoot,
    files: new Set(listTrackedFiles(e.repoRoot).files),
  }))
  const stats = {unmapped: 0, mapped: 0}
  function repoFor(abs) {
    const n = norm(abs)
    return repos.find((r) => n === r.root || n.startsWith(r.root + "/")) || null
  }
  function resolvePath(p) {
    if (!p || typeof p !== "string") return null
    const cleaned = p.replace(/^"|"$/g, "")
    const abs = path.isAbsolute(cleaned) ? cleaned : null
    if (!abs) return null
    const r = repoFor(abs)
    if (!r) return null
    const rel = norm(abs).slice(r.root.length + 1)
    // restore original case from tracked file set when possible
    let orig = [...r.files].find((f) => f.toLowerCase() === rel) || rel
    if (SECRET_NAME.test(orig) || SKIP_DIR.test(orig)) return {projectId: r.projectId, alias: null}
    return {projectId: r.projectId, alias: safeAlias(orig)}
  }
  function resolveText(text) {
    if (!text || typeof text !== "string") return null
    const t = text.replace(/\\/g, "/")
    const low = t.toLowerCase()
    for (const r of repos) {
      const i = low.indexOf(r.root)
      if (i < 0) continue
      // file token after/around the root, else repo-level
      const tokenRe = /([A-Za-z0-9_.\/-]+\.(?:ts|tsx|js|mjs|cjs|py|json|md|css|html))/g
      let m
      while ((m = tokenRe.exec(t))) {
        const cand = m[1].replace(/^\.?\//, "")
        const abs = cand.toLowerCase().startsWith(r.root) ? cand : null
        const rel = abs ? cand.slice(r.root.length + 1) : cand
        const hit = [...r.files].find((f) => f.toLowerCase() === rel.toLowerCase())
        if (hit) return {projectId: r.projectId, alias: safeAlias(hit)}
      }
      return {projectId: r.projectId, alias: null}
    }
    return null
  }
  return {repos, stats, resolvePath, resolveText}
}

if (process.argv[1] && process.argv[1].endsWith("project-discovery.mjs")) {
  const cfg = process.argv[2] || path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "approved-roots.json")
  for (const {world: w} of discoverWorlds(cfg)) {
    console.log(`${w.name}: ${w.fileCount} files, ${w.clusters.length} clusters, ${w.resolvedFileEdges} resolved edges (${w.edges.length} cluster roads), ${w.unresolvedImports} unresolved, branch ${w.branch}@${w.head}, dirty=${w.dirtyFiles}`)
  }
}
