import { resolve } from "https://deno.land/std@0.70.0/path/mod.ts";
import { ensureDirSync } from "https://deno.land/std@0.70.0/fs/mod.ts";

import {
  TEMP_FILES_PREFIX,
  CREATORS_DIR_BASE,
  TEMPLATES_DIR_BASE,
  STATIC_DIR_BASE,
  COMPONENTS_DIR_BASE,
  setSsgoDir,
} from "../constants.ts";

import defaultCreator from "../default/_creator.ts";
import defaultTemplate from "../default/_template.ts";
import defaultStaticFile from "../default/_static.ts";

type Directory = Record<string, object | string>;

export const DEFAULT_PROJECT_STRUCTURE = {
  [CREATORS_DIR_BASE]: {
    "index.ts": defaultCreator,
  },
  [TEMPLATES_DIR_BASE]: {
    "index.html": defaultTemplate,
  },
  [STATIC_DIR_BASE]: {
    "index.css": defaultStaticFile,
  },
  [COMPONENTS_DIR_BASE]: {},
};

function makeDirFromStructure(
  root: string,
  structure: Directory,
  skipRootCreation = false
) {
  if (!skipRootCreation) ensureDirSync(root);

  for (let name of Object.keys(structure)) {
    // directory
    if (typeof structure[name] === "object") {
      makeDirFromStructure(resolve(root, name), structure[name] as Directory);
    }
    // file with content
    else if (typeof structure[name] === "string") {
      Deno.writeTextFileSync(resolve(root, name), structure[name] as string);
    }
  }
}

function createTempProject(structure = DEFAULT_PROJECT_STRUCTURE): string {
  const root = Deno.makeTempDirSync({ prefix: TEMP_FILES_PREFIX });

  makeDirFromStructure(root, structure, true);

  return root;
}

export function getTestEnv(structure = DEFAULT_PROJECT_STRUCTURE): string {
  const dir = createTempProject(structure);
  setSsgoDir(dir);
  return dir;
}

export { defaultCreator, defaultTemplate, defaultStaticFile };
