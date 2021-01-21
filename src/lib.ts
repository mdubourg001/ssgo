import { normalize } from "https://deno.land/std@0.80.0/path/mod.ts"
import {
  existsSync,
  WalkEntry,
  walkSync,
} from "https://deno.land/std@0.80.0/fs/mod.ts"

import { IContextData } from "./types.ts"
import { buildPage } from "./index.ts"
import { isPathAbsolute, isTemplate } from "./utils.ts"
import { setVerbosity } from "./constants.ts"

/**
 * Build a page using given template and data and return page as string
 */
export async function buildTemplateToString(
  templatePath: string,
  data: IContextData,
  componentsDirPath?: string
): Promise<string> {
  // prevent logs when using from API
  setVerbosity(0)

  if (!isPathAbsolute(templatePath)) {
    throw new Error(
      `Please provide an absolute path for the template to use: try prepending your relative path with "path.dirname(path.fromFileUrl(import.meta.url))".`
    )
  }

  if (componentsDirPath && !isPathAbsolute(componentsDirPath)) {
    throw new Error(
      `Please provide an absolute path for the template to use: try prepending your relative path with "path.dirname(path.fromFileUrl(import.meta.url))".`
    )
  }

  if (!existsSync(templatePath)) {
    throw new Error(
      `Can't build using the template '${templatePath}': file does not exist.`
    )
  }

  if (componentsDirPath && !existsSync(componentsDirPath)) {
    throw new Error(
      `Can't build using '${componentsDirPath}' as components root: directory does not exist.`
    )
  }

  const components = componentsDirPath
    ? Array.from(walkSync(componentsDirPath)).filter((file: WalkEntry) =>
        isTemplate(file.name)
      )
    : []

  return await buildPage(
    templatePath,
    data,
    { filename: "index" },
    components,
    false
  )
}
