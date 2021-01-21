import { normalize } from "https://deno.land/std@0.80.0/path/mod.ts";
import {
  existsSync,
  WalkEntry,
  walkSync,
} from "https://deno.land/std@0.80.0/fs/mod.ts";

import { IContextData } from "./types.ts";
import { buildPage } from "./index.ts";
import { isPathAbsolute, isTemplate } from "./utils.ts";

/**
 * If given a relative path, prepend with cwd, else return given path
 */
function _getTemplateAbs(path: string): string {
  return isPathAbsolute(path) ? path : normalize(`${Deno.cwd()}/${path}/`);
}

/**
 * Build a page using given template and data and return page as string
 */
export async function buildTemplateToString(
  templatePath: string,
  data: IContextData,
  componentsDirPath?: string,
): Promise<string> {
  const templateAbs = _getTemplateAbs(templatePath);

  if (!existsSync(templatePath)) {
    throw new Error(`Can't build using '${templateAbs}': file does not exist.`);
  }

  if (componentsDirPath && !existsSync(componentsDirPath)) {
    throw new Error(
      `Can't build using '${componentsDirPath}' as components root: directory does not exist.`,
    );
  }

  const components = componentsDirPath
    ? Array.from(walkSync(componentsDirPath)).filter((file: WalkEntry) =>
      isTemplate(file.name)
    )
    : [];

  return await buildPage(
    templateAbs,
    data,
    { filename: "index" },
    components,
    false,
  );
}
