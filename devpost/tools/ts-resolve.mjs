// Node loader hook: lets node resolve extensionless relative imports to .ts (Lens Studio style).
// Usage: node --no-warnings --import ./devpost/tools/ts-resolve.mjs <script.mjs>
import {register} from "node:module"

register(
  "data:text/javascript," +
    encodeURIComponent(`
import {existsSync} from "node:fs"
import {fileURLToPath, pathToFileURL} from "node:url"
import {dirname, resolve as pathResolve} from "node:path"
export async function resolve(specifier, context, next) {
  if (specifier.startsWith(".") && !/\\.[a-z]+$/i.test(specifier) && context.parentURL) {
    const file = pathResolve(dirname(fileURLToPath(context.parentURL)), specifier + ".ts")
    if (existsSync(file)) return next(pathToFileURL(file).href, context)
  }
  return next(specifier, context)
}
`),
  import.meta.url,
)
