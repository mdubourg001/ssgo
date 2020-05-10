import { parse } from "https://cdn.pika.dev/html5parser@^1.1.0";

import { walkSync } from "https://deno.land/std/fs/walk.ts";
import { existsSync } from "https://deno.land/std/fs/exists.ts";
import { writeFileStrSync } from "https://deno.land/std/fs/write_file_str.ts";
import { readFileStrSync } from "https://deno.land/std/fs/read_file_str.ts";
import { ensureDirSync } from "https://deno.land/std/fs/ensure_dir.ts";
import { emptyDirSync } from "https://deno.land/std/fs/empty_dir.ts";

import {
  CREATORS_DIR_ABS,
  COMPONENTS_DIR_ABS,
  DIST_DIR_ABS,
} from "./constants.ts";
import {
  INode,
  ICreator,
  ICustomComponent,
  IContextData,
  IBuildPageOptions,
  IBuildPageParams,
  IBuildPageCall,
} from "./types.ts";
import {
  log,
  isScript,
  isTemplate,
  formatAttributes,
  isComment,
  getTargetDistFile,
  checkTopLevelNodesCount,
  checkEmptyTemplate,
  checkComponentNameUnicity,
  checkBuildPageOptions,
} from "./utils.ts";
import { buildHtml } from "./build.ts";
import { relative } from "https://deno.land/std/path/win32.ts";
// ----- globals ----- //

let projectMap: ICreator[] = [];

// ----- build misc. ----- //

/**
 * Cache a call to buildPage
 */
function cacheBuildPageCall(
  creatorAbs: string,
  { template: templateAbs, data, options }: IBuildPageParams
) {
  if (!existsSync(templateAbs))
    throw new Error(`Can't find given template: ${templateAbs}`);

  const pageBuildCall: IBuildPageCall = {
    template: {
      name: templateAbs,
      customComponents: [],
      staticFiles: [],
    },
    data,
    options,
  };
  const creatorEntry: ICreator = {
    name: creatorAbs,
    pageBuildCalls: [pageBuildCall],
  };

  const existingEntry: ICreator | undefined = projectMap.find(
    ({ name }) => name === creatorAbs
  );
  if (!!existingEntry) existingEntry.pageBuildCalls.push(pageBuildCall);
  else projectMap.push(creatorEntry);
}

/**
 * Bind templates to the custom-components and static files they use
 */
function bindTemplateToStatic() {}

/**
 * Serialize back to HTML files
 */
export function serialize(node: INode) {
  let result = "";

  if (isComment(node)) {
    return "";
  } else if (node.type === "Text") {
    result += node.value;
  } else if (node.type === "Tag") {
    result += `<${node.rawName} ${formatAttributes(node.attributes)}`;
    if (node.close === null) return result + "/>";
    else result += ">";

    for (let child of node.body || []) result += serialize(child);

    result += node.close?.value;
  }

  return result;
}

// ----- internals ----- //

/**
 * Build a given template with given data and write the file to fs
 * Function given to creators as first param
 */
function buildPage(
  templateAbs: string,
  data: IContextData,
  options: IBuildPageOptions,
  availableComponents: ICustomComponent[]
) {
  const read = readFileStrSync(templateAbs, { encoding: "utf8" });
  const parsed = parse(read).filter((n) =>
    "value" in n ? n.value !== "\n" : true
  );

  checkTopLevelNodesCount(parsed, templateAbs);
  checkEmptyTemplate(parsed, templateAbs);

  parsed.forEach((node: INode) => {
    node.parent = parsed;
    buildHtml(
      node,
      data,
      availableComponents,
      () => {},
      () => {}
    );
  });

  const serialized = parsed.map((node: INode) => serialize(node)).join("");

  log.info(`Creating or emptying ${DIST_DIR_ABS} directory...`);
  ensureDirSync(DIST_DIR_ABS);
  emptyDirSync(DIST_DIR_ABS);

  const targetFile = getTargetDistFile(options);
  log.info(`Writing ${relative(Deno.cwd(), targetFile)}...`);
  writeFileStrSync(targetFile, serialized);
}

/**
 * Build the project
 */
export async function build() {
  const creators = Array.from(walkSync(CREATORS_DIR_ABS)).filter((file) =>
    isScript(file.name)
  );
  const components = Array.from(walkSync(COMPONENTS_DIR_ABS)).filter((file) =>
    isTemplate(file.name)
  );

  checkComponentNameUnicity(components);

  const builds = [];
  for (let creator of creators) {
    const module = await import(creator.path);
    // as every valid creator should export a default function
    if (!module.default || typeof module.default !== "function") continue;

    log.info(`Running ${relative(Deno.cwd(), creator.path)}...`);
    const build = module.default(function (
      template: string,
      data: IContextData,
      options: IBuildPageOptions
    ): void {
      const templateAbs = `${Deno.cwd()}/${template}`;
      // caching the call to buildPage on the fly
      cacheBuildPageCall(creator.path, {
        template: templateAbs,
        data,
        options,
      });

      checkBuildPageOptions(templateAbs, options);

      log.info(
        `Building ${relative(Deno.cwd(), getTargetDistFile(options))}...`
      );
      buildPage(templateAbs, data, options, components);
    });

    builds.push(build);
  }

  Promise.all(builds).then(() => log.success("Project built."));
}

/**
 * Watch project files for change
 */
export function watch() {}

/**
 * Serve the bundle locally
 */
export function serve() {}
