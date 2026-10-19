import ts from "typescript"
import { readFile } from "node:fs/promises"
import { pathToFileURL } from "node:url"
import { resolve as pathResolve } from "node:path"

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/"))
    return {
      url: pathToFileURL(pathResolve("src", `${specifier.slice(2)}.ts`)).href,
      shortCircuit: true,
    }
  return next(specifier, context)
}
export async function load(url, context, next) {
  if (url.endsWith(".ts"))
    return {
      format: "module",
      source: ts.transpileModule(await readFile(new URL(url), "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
      shortCircuit: true,
    }
  return next(url, context)
}
