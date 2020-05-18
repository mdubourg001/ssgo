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
import {
  relative,
  normalize,
  dirname,
} from "https://deno.land/std/path/mod.ts";

import {
  WATCHER_THROTTLE,
  CREATORS_DIR_ABS,
  COMPONENTS_DIR_ABS,
  DIST_DIR_ABS,
  DIST_STATIC_ABS,
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
 * Bind templates to the custom components they use
 */
function bindTemplateToCustomComponent(
  templateAbs: string,
  event: ICustomComponent
) {
  const existingEntries: ITemplate[] = projectMap.reduce(
    (acc: ITemplate[], { pageBuildCalls }: ICreator) => {
      return [
        ...acc,
        ...pageBuildCalls
          .filter((c) => c.template.name === templateAbs)
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
    (acc: ITemplate[], { pageBuildCalls }: ICreator) => {
      return [
        ...acc,
        ...pageBuildCalls
          .filter((c) => c.template.name === templateAbs)
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

        if (diag === null) {
          writeFileStrSync(destAbs, emit);
          resolve({
            destRel,
            result: emit,
          });
        } else {
          log.error(
            `Error when calling Deno.bundle on ${relative(
              Deno.cwd(),
              staticFile.path
            )}:`
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
  if (!module.default || typeof module.default !== "function") return;

  log.info(`Running ${relative(Deno.cwd(), creator.path)}...`);
  return module.default(async function (
    template: string,
    data: IContextData,
    options: IBuildPageOptions
  ) {
    const templateAbs = `${Deno.cwd()}/${template}`;
    // caching the call to buildPage on the fly
    cacheBuildPageCall(creator.path, {
      template: templateAbs,
      data,
      options,
    });

    checkBuildPageOptions(templateAbs, options);

    log.info(`Building ${relative(Deno.cwd(), getTargetDistFile(options))}...`);
    await buildPage(templateAbs, data, options, components);
  });
}

/**
 * Build the project
 */
export async function build() {
  checkComponentNameUnicity(components);

  log.info(
    `Creating or emptying ${relative(Deno.cwd(), DIST_DIR_ABS)} directory...`
  );
  ensureDirSync(DIST_DIR_ABS);
  emptyDirSync(DIST_DIR_ABS);

  const builds = [];
  for (let creator of creators) {
    builds.push(runCreator(creator));
  }

  Promise.all(builds).then(async () => {
    // wait for Deno.bundle calls to end
    await Promise.all(compilations);
    log.success("Project built.");
  });
}

/**
 * Watch project files for change
 */
export async function watch() {
  // https://github.com/Caesar2011/rhinoder/blob/master/mod.ts
  let timeout: number | null = null;

  function handleFsEvent(event: Deno.FsEvent) {
    console.log(event.kind, " --> ", event.paths);
    if (["create", "modify", "remove"].includes(event.kind)) {
      for (const path of event.paths) {
        console.log(isFileInDir(path, CREATORS_DIR_ABS));
      }
    }
  }

  const watcher = Deno.watchFs(".");
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
export function serve() {}
