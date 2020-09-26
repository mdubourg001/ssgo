import tosource from "https://cdn.skypack.dev/tosource";
import type { IAttribute } from "https://cdn.skypack.dev/html5parser";
import { parse } from "https://deno.land/std/flags/mod.ts";
import {
  red,
  blue,
  yellow,
  green,
} from "https://deno.land/std@0.70.0/fmt/colors.ts";
import {
  relative,
  resolve,
  basename,
  posix,
  normalize,
  extname,
  common,
  dirname,
} from "https://deno.land/std@0.70.0/path/mod.ts";
import {
  existsSync,
  walkSync,
  WalkEntry,
} from "https://deno.land/std@0.70.0/fs/mod.ts";

import type {
  INode,
  IContextData,
  ICustomComponent,
  IBuildPageOptions,
  IStaticFile,
} from "./types.ts";
import {
  VERBOSITY,
  CREATORS_DIR_BASE,
  CREATORS_DIR_ABS,
  TEMPLATES_DIR_BASE,
  TEMPLATES_DIR_ABS,
  COMPONENTS_DIR_ABS,
  STATIC_DIR_ABS,
  DIST_DIR_ABS,
  BUILDABLE_STATIC_EXT,
  DIST_STATIC_BASE,
  TEMP_FILES_PREFIX,
  DEV_FLAG,
} from "./constants.ts";
import defaultTemplate from "./default/_template.ts";
import defaultCreator from "./default/_creator.ts";
import defaultStaticFile from "./default/_static.ts";

export function isDevelopmentEnv(): boolean {
  return parse(Deno.args)["_"].includes(DEV_FLAG);
}

export function tapLog<T extends Array<any>>(...args: T): T {
  console.log(...args);
  return args;
}

export const log = {
  info: (message: string) => {
    VERBOSITY === 1 && console.log(blue("info"), message);
  },
  error: (message: string, throwErr: boolean = false) => {
    if (throwErr) throw new Error(message);
    else VERBOSITY === 1 && console.log(red("error"), message);
  },
  warning: (message: string) => {
    VERBOSITY === 1 && console.log(yellow("warning"), message);
  },
  success: (message: string) => {
    VERBOSITY === 1 && console.log(green("success"), message);
  },
};

/**
 * Check if a file is a script file (JS or TS)
 */
export function isScript(filename: string): boolean {
  return filename.endsWith(".ts") || filename.endsWith(".js");
}

/**
 * Check if a file is a template file (HTML or HTM)
 */
export function isTemplate(filename: string): boolean {
  return filename.endsWith(".html") || filename.endsWith(".htm");
}

/**
 * Evaluate the given expression in a given context
 */
export function contextEval(
  expression: string,
  context: IContextData,
  errorContext?: string,
) {
  try {
    const richContext = {
      // adding useful functions to context
      ssgo: {
        assrc: (expression: any) =>
          tosource(expression).replaceAll(/(?<!\\)(?:\\\\)*"/gi, `'`),
      },
      ...context,
    };

    // @ts-ignore
    for (const key of Object.keys(richContext)) window[key] = richContext[key];
    const evaluation = eval(expression);

    // @ts-ignore
    for (const key of Object.keys(richContext)) delete window[key];
    return evaluation;
  } catch (e) {
    if (typeof errorContext !== "undefined") {
      log.error(
        `When trying to evaluate '${errorContext.trim()}': ${e.message}`,
        true,
      );
    }
  }
}

/**
 * Get attributes as a name="value" string
 */
export function formatAttributes(attributes: IAttribute[]): string {
  let result = "";

  for (let attribute of attributes) {
    result += ` ${attribute.name.value}`;
    if (typeof attribute.value?.value !== "undefined") {
      result += `="${attribute.value.value}"`;
    }
  }

  return result.trim();
}

/**
 * Handle interpolation of text with context data
 */
export function interpolate(templateStr: string, data?: IContextData) {
  // FIXME - This allow everything as long as the second char isn't a opening bracket ('{')
  return templateStr.replace(/{{\s*{{0,1}[^{]+\s*}}/g, (match) => {
    return contextEval(match, data ?? {}, templateStr);
  });
}

/**
 * Remove the extension from a file name
 */
export function removeExt(basename: string) {
  return basename.split(".").slice(0, -1).join(".");
}

/**
 * Tell if node is a comment node
 */
export function isComment(node: INode): boolean {
  return "rawName" in node && node.rawName === "!--";
}

/**
 * Remove a node from its parent
 */
export function removeFromParent(node: INode) {
  if (!!node.parent) {
    const parent = "body" in node.parent ? node.parent?.body : node.parent;
    const index = (parent as Array<INode>).findIndex((n) => n === node);

    if (index !== -1) (parent as Array<INode>).splice(index, 1);
  }
}

/**
 * Add a item next to another inside of parent
 */
export function pushBefore<T>(array: T[], before: T, ...items: T[]) {
  const index = array.findIndex((i) => i === before);
  array.splice(index, 0, ...items);
}

/**
 * Get attribute name without its prefix (eval:, static:)
 */
export function getUnprefixedAttributeName(attribute: IAttribute) {
  return attribute.name.value.split(":").slice(1).join(":");
}

/**
 * Get path of dist built page
 */
export function getOutputPagePath(options: IBuildPageOptions): string {
  return resolve(
    Deno.cwd(),
    DIST_DIR_ABS,
    options.dir ?? "",
    options.filename.endsWith(".html")
      ? options.filename
      : options.filename + ".html",
  );
}

/**
 * Check if a URL leads to an external ressource
 */
export function isExternalURL(url: string) {
  return new RegExp("^(?:[a-z]+:)?//", "i").test(url);
}

export function getStaticFileFromRel(staticRel: string): IStaticFile {
  const staticFileAbs = normalize(`${STATIC_DIR_ABS}/${staticRel}`);
  const staticFileBasename = basename(staticFileAbs);

  return {
    path: staticFileAbs,
    isCompiled: BUILDABLE_STATIC_EXT.includes(
      posix.extname(staticFileBasename),
    ),
  };
}

/**
 * Get future path of static file in bundle
 */
export function getStaticFileBundlePath(staticRel: string): string {
  const ext = [".jsx", ".tsx", ".ts"].includes(extname(staticRel))
    ? ".js"
    : extname(staticRel);
  const base = basename(staticRel);
  const filename = base.startsWith(".") ? staticRel : removeExt(staticRel);

  return normalize(`/${DIST_STATIC_BASE}/${filename}${ext}`);
}

/**
 * Check if a file is inside of a directory
 */
export function isFileInDir(fileAbs: string, dirAbs: string): boolean {
  return (
    common([fileAbs, dirAbs]) === dirAbs ||
    common([fileAbs, dirAbs]) === dirAbs + "/"
  );
}

/**
 * Get path relative to cwd
 */
export function getRel(abs: string): string {
  return relative(Deno.cwd(), abs);
}

/**
 * Copy the content of a file to a temp file and returns the temp path
 */
export function writeTempFileWithContentOf(contentAbs: string): string {
  const contentStr = Deno.readTextFileSync(contentAbs);

  const tempAbs = Deno.makeTempFileSync({
    dir: dirname(contentAbs),
    prefix: TEMP_FILES_PREFIX,
    suffix: extname(contentAbs),
  });
  Deno.writeTextFileSync(tempAbs, contentStr);

  return tempAbs;
}

/**
 * Dynamically import module from abs path
 * Using a temp file to hack import cache
 */
export async function importModule(moduleAbs: string) {
  const tempModuleAbs = writeTempFileWithContentOf(moduleAbs);

  const module = await import(`file://${tempModuleAbs}`);
  Deno.remove(tempModuleAbs);
  return module;
}

/**
 * Clean the temp files left in project
 */
export function cleanTempFiles() {
  const tempFiles: WalkEntry[] = Array.from(
    walkSync(Deno.cwd()),
  ).filter((file: WalkEntry) => file.name.startsWith(TEMP_FILES_PREFIX));

  for (const file of tempFiles) {
    Deno.removeSync(file.path, { recursive: true });
  }
}

// ----- errors ----- //

/**
 * Check that a template has at least one node
 */
export function checkEmptyTemplate(
  parsedTemplate: INode[],
  templateAbs: string,
) {
  if (parsedTemplate.length === 0) {
    log.warning(
      `When parsing '${
        getRel(
          templateAbs,
        )
      }': This template/component file is empty.`,
    );
  }
}

/**
 * Check if two components have the same name
 */
export function checkComponentNameUnicity(components: ICustomComponent[]) {
  for (let component of components) {
    if (
      components.some(
        (c) =>
          removeExt(c.name) === removeExt(component.name) &&
          c.path !== component.path,
      )
    ) {
      log.error(
        `When listing custom components: Two components with the same name '${
          removeExt(
            component.name,
          )
        }' found.`,
        true,
      );
    }
  }
}

/**
 * Check if component contains a recursive call
 */
export function checkRecursiveComponent(node: INode, componentName: string) {
  if ("name" in node && node.name === removeExt(componentName)) {
    log.error(
      `When parsing '${componentName}': Recursive call of component found.`,
      true,
    );
  }

  if ("body" in node && !!node.body) {
    for (const childNode of node.body as INode[]) {
      checkRecursiveComponent(childNode, componentName);
    }
  }
}

/**
 * Check that buildPage options are valid
 */
export function checkBuildPageOptions(
  templateRel: string,
  options: IBuildPageOptions,
) {
  if (!options.filename) {
    log.error(
      `When building page with template '${templateRel}': No filename given to 'buildPage' call.`,
      true,
    );
  }
}

/**
 * Check that a static file exists and can be included in bundle
 */
export function checkStaticFileExists(
  staticFileAbs: string,
  staticAttrValue: string,
): boolean {
  if (!existsSync(staticFileAbs)) {
    log.warning(
      `Could not resolve ${staticAttrValue}: won't be included in output build.`,
    );
    return false;
  }
  return true;
}

/**
 * Check if a file is inside static/ dir
 */
export function checkStaticFileIsInsideStaticDir(
  staticFileAbs: string,
  staticAttrValue: string,
) {
  if (common([staticFileAbs, STATIC_DIR_ABS]) !== STATIC_DIR_ABS) {
    log.warning(
      `Could not resolve ${staticAttrValue} inside of 'static/' dir: won't be included in output build.`,
    );
    return false;
  }
  return true;
}

/**
 * Get the state of a directory
 * noexists -> directory doesn't exist
 * exists -> directory exists and isn't empty
 * empty -> directory exists but is empty
 */
export function getDirState(abs: string): "exists" | "empty" | "noexists" {
  return !existsSync(abs)
    ? "noexists"
    : Array.from(walkSync(abs)).filter((e) => e.path !== abs).length > 0
    ? "exists"
    : "empty";
}

/**
 * Check that mandatory directories exist
 */
export function checkProjectDirectoriesExist(throwErr: boolean = false) {
  const creatorsState = getDirState(CREATORS_DIR_ABS);
  if (creatorsState === "noexists" && throwErr) {
    log.error(
      `Could not find mandatory '${CREATORS_DIR_BASE}/' directory.`,
      throwErr,
    );
  }

  const templatesState = getDirState(TEMPLATES_DIR_ABS);
  if (templatesState === "noexists" && throwErr) {
    log.error(
      `Could not find mandatory '${TEMPLATES_DIR_BASE}/' directory.`,
      throwErr,
    );
  }

  return {
    [CREATORS_DIR_ABS]: creatorsState,
    [TEMPLATES_DIR_ABS]: templatesState,
    [STATIC_DIR_ABS]: getDirState(STATIC_DIR_ABS),
    [COMPONENTS_DIR_ABS]: getDirState(COMPONENTS_DIR_ABS),
  };
}

/**
 * Check if a string is a valid URL starting with http or https
 */
export function checkIsValidHttpUrl(str: string) {
  let url;

  try {
    url = new URL(str);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw "";
    }
  } catch (_) {
    log.error(
      `When trying to build sitemap.xml: '${str}' is not a valid URL strarting with 'http://' or 'https://'.`,
      true,
    );
  }
}

/**
 * Get an error page formatted with the given error
 */
export function getFormattedErrorPage(
  errorMessage: string,
  errorStack?: string,
) {
  const escapeTags = (str: string) =>
    str.replace("<", "&lt;").replace(">", "&gt;");

  return `
  <section style="font-family: sans-serif; padding: 1px 10px;">
    <h1 style="color: #D2283C;"><code>${escapeTags(errorMessage)}</code></h1>
    <div style="padding: 10px; background-color: #FDF3F4; border-radius: 1px; width: fit-content;">
      <code style="font-weight: bold; font-size: 1.3rem; white-space: pre-wrap;">${
    errorStack ? escapeTags(errorStack) : "No error stack provided."
  }</code>
    </div>
  </section>
  `;
}

/**
 *
 */
export function createDefaultTemplate() {
  Deno.writeTextFileSync(
    resolve(TEMPLATES_DIR_ABS, "index.html"),
    defaultTemplate,
  );
}

/**
 *
 */
export function createDefaultCreator() {
  Deno.writeTextFileSync(resolve(CREATORS_DIR_ABS, "index.ts"), defaultCreator);
}

/**
 *
 */
export function createDefaultStaticFile() {
  Deno.writeTextFileSync(
    resolve(STATIC_DIR_ABS, "index.css"),
    defaultStaticFile,
  );
}
