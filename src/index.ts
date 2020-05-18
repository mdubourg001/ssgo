import { parse } from "https://cdn.pika.dev/html5parser@^1.1.0";

import {
  emptyDirSync,
  walkSync,
  existsSync,
  writeFileStrSync,
  readFileStrSync,
  ensureDirSync,
  copySync,
  WalkEntry,
} from "https://deno.land/std/fs/mod.ts";
import { normalize, dirname } from "https://deno.land/std/path/mod.ts";

import {
  WATCHER_THROTTLE,
  SERVE_PORT,
  CREATORS_DIR_ABS,
  TEMPLATES_DIST_ABS,
  COMPONENTS_DIR_ABS,
  DIST_DIR_ABS,
  DIST_STATIC_ABS,
  TEMPLATES_DIST_BASE,
  STATIC_DIR_ABS,
} from "./constants.ts";
import {
  INode,
  ITemplate,
  ICreator,
  ICustomComponent,
  IStaticFile,
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
  isFileInDir,
  getRel,
} from "./utils.ts";
import { buildHtml } from "./build.ts";

// ----- globals ----- //

const creators = Array.from(walkSync(CREATORS_DIR_ABS)).filter((file) =>
  isScript(file.name)
);
const components = Array.from(walkSync(COMPONENTS_DIR_ABS)).filter((file) =>
  isTemplate(file.name)
);
let projectMap: ICreator[] = [];
let compilations: Promise<any>[] = [];

// ----- build misc. ----- //

/**
 * Cache a call to buildPage
 */
function cacheBuildPageCall(
  creatorAbs: string,
  { template: templateRel, data, options }: IBuildPageParams
) {
  const templateAbs = normalize(`${TEMPLATES_DIST_ABS}/${templateRel}`);
  if (!existsSync(templateAbs))
    throw new Error(
      `When running ${getRel(
        creatorAbs
      )}: Can't find given template: ${templateRel} inside of ${TEMPLATES_DIST_BASE}/ directory.`
    );

  const pageBuildCall: IBuildPageCall = {
    template: {
      path: templateAbs,
      customComponents: [],
      staticFiles: [],
    },
    data,
    options,
  };
  const creatorEntry: ICreator = {
    path: creatorAbs,
    buildPageCalls: [pageBuildCall],
  };

  const existingEntry: ICreator | undefined = projectMap.find(
    ({ path: name }) => name === creatorAbs
  );
  if (!!existingEntry) existingEntry.buildPageCalls.push(pageBuildCall);
  else projectMap.push(creatorEntry);
}

/**
 * Bind templates to the custom components they use
 */
function bindTemplateToCustomComponent(
  templateAbs: string,
  event: ICustomComponent
) {
  const existingEntries: ITemplate[] = projectMap.reduce(
    (acc: ITemplate[], { buildPageCalls }: ICreator) => {
      return [
        ...acc,
        ...buildPageCalls
          .filter((c) => c.template.path === templateAbs)
          .map((c) => c.template),
      ];
    },
    []
  );

  existingEntries.forEach((entry) => {
    entry.customComponents = Array.from(
      new Set([...entry.customComponents, event])
    );
  });
}

/**
 * Bind templates to the static files they use
 */
function bindTemplateToStatic(templateAbs: string, event: IStaticFile) {
  const existingEntries: ITemplate[] = projectMap.reduce(
    (acc: ITemplate[], { buildPageCalls: pageBuildCalls }: ICreator) => {
      return [
        ...acc,
        ...pageBuildCalls
          .filter((c) => c.template.path === templateAbs)
          .map((c) => c.template),
      ];
    },
    []
  );

  existingEntries.forEach((entry) => {
    entry.staticFiles = Array.from(new Set([...entry.staticFiles, event]));
  });
}

/**
 * Compile if needed, and add file to bundle
 */
function addStaticToBundle(staticFile: IStaticFile, destRel: string) {
  const destAbs = normalize(`${DIST_STATIC_ABS}/${destRel}`);
  if (existsSync(destAbs)) return;

  ensureDirSync(dirname(destAbs));

  if (staticFile.isCompiled) {
    compilations.push(
      new Promise(async (resolve) => {
        // @ts-ignore
        const [diag, emit] = await Deno.bundle(staticFile.path, undefined, {
          lib: ["dom", "esnext", "deno.ns"],
        });

        if (!diag) {
          writeFileStrSync(destAbs, emit);
          resolve({
            destRel,
            result: emit,
          });
        } else {
          log.error(
            `Error when calling Deno.bundle on ${getRel(staticFile.path)}:`
          );
          throw new Error(JSON.stringify(diag, null, 1));
        }
      })
    );
  } else {
    copySync(staticFile.path, destAbs, { overwrite: true });
  }
}

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
async function buildPage(
  templateAbs: string,
  data: IContextData,
  options: IBuildPageOptions,
  availableComponents: ICustomComponent[]
) {
  log.info(`Building ${getRel(getTargetDistFile(options))}...`);

  const read = readFileStrSync(templateAbs, { encoding: "utf8" });
  const parsed = parse(read).filter((n) =>
    "value" in n ? n.value !== "\n" : true
  );

  checkTopLevelNodesCount(parsed, templateAbs);
  checkEmptyTemplate(parsed, templateAbs);

  parsed.forEach(async (node: INode) => {
    node.parent = parsed;
    await buildHtml(
      node,
      data,
      availableComponents,
      (e: ICustomComponent) => bindTemplateToCustomComponent(templateAbs, e),
      (e: IStaticFile, destRel: string) => {
        bindTemplateToStatic(templateAbs, e);
        addStaticToBundle(e, destRel);
      }
    );
  });

  const serialized = parsed.map((node: INode) => serialize(node)).join("");

  const targetFile = getTargetDistFile(options);
  writeFileStrSync(targetFile, serialized);
}

export async function runCreator(creator: WalkEntry) {
  const module = await import(creator.path);
  // as every valid creator should export a default function
  if (!module.default || typeof module.default !== "function") {
    log.warning(
      `When running ${getRel(
        creator.path
      )}: A creator must export a default function.`
    );
    return;
  }

  log.info(`Running ${getRel(creator.path)}...`);
  return module.default(async function (
    template: string,
    data: IContextData,
    options: IBuildPageOptions
  ) {
    // caching the call to buildPage on the fly
    const templateAbs = normalize(`${TEMPLATES_DIST_ABS}/${template}`);
    cacheBuildPageCall(creator.path, {
      template: template,
      data,
      options,
    });

    checkBuildPageOptions(template, options);

    await buildPage(templateAbs, data, options, components);
  });
}

/**
 * Build the project
 */
export async function build() {
  checkComponentNameUnicity(components);

  log.info(`Creating or emptying ${getRel(DIST_DIR_ABS)} directory...`);
  ensureDirSync(DIST_DIR_ABS);
  emptyDirSync(DIST_DIR_ABS);

  const builds: Promise<any>[] = [];
  for (let creator of creators) {
    builds.push(runCreator(creator));
  }

  return new Promise(async (resolve) => {
    // wait for buildPage calls to end
    await Promise.all(builds);
    // wait for Deno.bundle calls to end
    await Promise.all(compilations);

    log.success("Project built.");
    resolve();
  });
}

/**
 * Watch project files for change
 */
export async function watch() {
  // https://github.com/Caesar2011/rhinoder/blob/master/mod.ts
  let timeout: number | null = null;

  function handleFsEvent(event: Deno.FsEvent) {
    if (["create", "modify", "remove"].includes(event.kind)) {
      for (const path of event.paths) {
        //console.log(event.kind, " --> ", getRel(path));

        if (isFileInDir(path, CREATORS_DIR_ABS)) {
          console.log("");
          log.info(`${getRel(path)} changed.`);

          const creator = projectMap.find((c) => c.path === path);
          if (typeof creator !== "undefined") creator.buildPageCalls = [];

          runCreator({ path } as WalkEntry);
        } else if (isFileInDir(path, TEMPLATES_DIST_ABS)) {
          console.log("");
          log.info(`${getRel(path)} changed.`);

          // buildPage calls that use the changed template
          const calls = projectMap.reduce(
            (acc, curr) => [
              ...acc,
              ...curr.buildPageCalls.filter((c) => c.template.path === path),
            ],
            [] as IBuildPageCall[]
          );

          for (const call of calls)
            buildPage(call.template.path, call.data, call.options, components);
        } else if (isFileInDir(path, COMPONENTS_DIR_ABS)) {
          console.log("");
          log.info(`${getRel(path)} changed.`);

          // buildPage calls that use a template that use the changed component
          const calls = projectMap.reduce(
            (acc, curr) => [
              ...acc,
              ...curr.buildPageCalls.filter((call) =>
                call.template.customComponents.some(
                  (comp) => comp.path === path
                )
              ),
            ],
            [] as IBuildPageCall[]
          );

          for (const call of calls)
            buildPage(call.template.path, call.data, call.options, components);
        } else if (isFileInDir(path, STATIC_DIR_ABS)) {
        }
      }
    }
  }

  const watcher = Deno.watchFs(".");
  log.info("Watching files for changes...");

  for await (const event of watcher) {
    if (event.kind !== "access") {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => handleFsEvent(event), WATCHER_THROTTLE);
    }
  }
}

/**
 * Serve the bundle locally
 */
export async function serve() {
  log.warning(`Serving is not implemented yet.`);
  //log.info(`Serving on port ${SERVE_PORT}...`);
}
