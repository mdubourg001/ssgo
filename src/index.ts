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
} from "https://deno.land/std@0.52.0/fs/mod.ts";
import {
  normalize,
  dirname,
  posix,
  basename,
  extname,
  resolve,
} from "https://deno.land/std@0.52.0/path/mod.ts";

import {
  WATCHER_THROTTLE,
  CREATORS_DIR_ABS,
  TEMPLATES_DIR_ABS,
  COMPONENTS_DIR_ABS,
  DIST_DIR_ABS,
  TEMPLATES_DIR_BASE,
  STATIC_DIR_ABS,
  BUILDABLE_STATIC_EXT,
  TEMP_FILES_PREFIX,
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
  ISsgoBag,
} from "./types.ts";
import {
  log,
  isScript,
  isTemplate,
  formatAttributes,
  isComment,
  getOutputPagePath,
  checkTopLevelNodesCount,
  checkEmptyTemplate,
  checkComponentNameUnicity,
  checkBuildPageOptions,
  checkProjectDirectoriesExist,
  getStaticFileBundlePath,
  isFileInDir,
  getRel,
  writeTempFileWithContentOf,
  importModule,
  cleanTempFiles,
} from "./utils.ts";
import { buildHtml } from "./build.ts";

// ----- globals ----- //

let creators: WalkEntry[] = [];
let components: WalkEntry[] = [];

let projectMap: ICreator[] = [];
let compilations: Promise<any>[] = [];

// ----- business ----- //

/**
 * Walk through creators/ and components/ to init global vars
 */
function walkCreatorsAndComponents() {
  creators = Array.from(walkSync(CREATORS_DIR_ABS)).filter((file: WalkEntry) =>
    isScript(file.name)
  );
  components = Array.from(
    walkSync(COMPONENTS_DIR_ABS)
  ).filter((file: WalkEntry) => isTemplate(file.name));
}

/**
 * Cache a call to buildPage
 */
function cacheBuildPageCall(
  creatorAbs: string,
  { template: templateRel, data, options }: IBuildPageParams
) {
  const templateAbs = normalize(`${TEMPLATES_DIR_ABS}/${templateRel}`);
  if (!existsSync(templateAbs)) {
    throw new Error(
      `When running ${getRel(
        creatorAbs
      )}: Can't find given template: ${templateRel} inside of ${TEMPLATES_DIR_BASE}/ directory.`
    );
  }

  const pageBuildCall: IBuildPageCall = {
    template: {
      path: templateAbs,
      customComponents: [],
      staticFiles: [],
    },
    data,
    options,
  };

  const existingEntry: ICreator | undefined = projectMap.find(
    ({ path }) => path === creatorAbs
  );

  if (!!existingEntry) existingEntry.buildPageCalls.push(pageBuildCall);
  else
    projectMap.push({
      path: creatorAbs,
      buildPageCalls: [pageBuildCall],
      otherWatchedFiles: [],
      otherWatchedDirs: [],
    });
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
function addStaticToBundle(
  staticFile: IStaticFile,
  destRel: string,
  override: boolean = false
) {
  const destAbs = normalize(`${DIST_DIR_ABS}/${destRel}`);
  if (!override && existsSync(destAbs))
    log.warning(
      `When trying to add ${getRel(destAbs)} to bundle: file already exists.`
    );

  ensureDirSync(dirname(destAbs));

  if (staticFile.isCompiled) {
    compilations.push(
      new Promise(async (resolve) => {
        const tempAbs = writeTempFileWithContentOf(
          staticFile.path,
          extname(staticFile.path)
        );

        // @ts-ignore
        const [diag, emit] = await Deno.bundle(tempAbs, undefined, {
          lib: ["dom", "esnext", "deno.ns"],
          allowJs: true,
        });
        Deno.remove(tempAbs);

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
 * Bind a file to a creator's watcher
 */
function addFileToWatcher(creatorAbs: string, fileAbs: string) {
  const existingEntry: ICreator | undefined = projectMap.find(
    ({ path }) => path === creatorAbs
  );
  const normalized = normalize(fileAbs);
  if (!existsSync(normalized))
    log.warning(`Can't find '${getRel(fileAbs)}', won't watch for changes.`);

  if (!!existingEntry) {
    if (!existingEntry.otherWatchedFiles.includes(normalized))
      existingEntry?.otherWatchedFiles.push(normalized);
  } else {
    projectMap.push({
      path: creatorAbs,
      buildPageCalls: [],
      otherWatchedFiles: [normalized],
      otherWatchedDirs: [],
    });
  }
}

/**
 * Bind a directory to a creator's watcher
 */
function addDirToWatcher(creatorAbs: string, dirAbs: string) {
  const existingEntry: ICreator | undefined = projectMap.find(
    ({ path }) => path === creatorAbs
  );
  const normalized = normalize(dirAbs);
  if (!existsSync(normalized))
    log.warning(
      `Can't find '${getRel(dirAbs)}' directory, won't watch for changes.`
    );

  if (!!existingEntry) {
    if (!existingEntry.otherWatchedDirs.includes(normalized))
      existingEntry?.otherWatchedDirs.push(normalized);
  } else {
    projectMap.push({
      path: creatorAbs,
      buildPageCalls: [],
      otherWatchedFiles: [],
      otherWatchedDirs: [normalized],
    });
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
  log.info(`Building ${getRel(getOutputPagePath(options))}...`);

  const read = readFileStrSync(templateAbs, { encoding: "utf8" });
  const parsed = parse(read).filter((n: INode) =>
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

  const outputPageAbs = getOutputPagePath(options);
  ensureDirSync(dirname(outputPageAbs));
  writeFileStrSync(outputPageAbs, serialized);
}

export async function runCreator(creator: WalkEntry) {
  if (basename(creator.path).startsWith(TEMP_FILES_PREFIX)) return;

  const creatorRel = getRel(creator.path);
  const module = await importModule(creator.path);

  // as every valid creator should export a default function
  if (!module.default || typeof module.default !== "function") {
    log.warning(
      `When running ${creatorRel}: A creator must export a default function.`
    );
    return;
  }

  log.info(`Running ${creatorRel}...`);
  return module.default(
    async function (
      template: string,
      data: IContextData,
      options: IBuildPageOptions
    ) {
      // caching the call to buildPage on the fly
      const templateAbs = normalize(`${TEMPLATES_DIR_ABS}/${template}`);
      cacheBuildPageCall(creator.path, {
        template: template,
        data,
        options,
      });

      checkBuildPageOptions(template, options);

      await buildPage(templateAbs, data, options, components);
    },
    {
      watchFile: (path: string) =>
        addFileToWatcher(creator.path, resolve(Deno.cwd(), path)),
      watchDir: (path: string) =>
        addDirToWatcher(creator.path, resolve(Deno.cwd(), path)),
      addStaticToBundle: (
        path: string,
        bundleDest: string = "",
        compile: boolean = false,
        override: boolean = false
      ) =>
        addStaticToBundle(
          { path: resolve(Deno.cwd(), path), isCompiled: compile },
          getStaticFileBundlePath(`${bundleDest}/${basename(path)}`),
          override
        ),
    } as ISsgoBag
  );
}

/**
 * Build the project
 */
export async function build() {
  checkProjectDirectoriesExist(true);
  cleanTempFiles();
  walkCreatorsAndComponents();

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

  async function handleFsEvent(event: Deno.FsEvent) {
    if (["create", "modify", "remove"].includes(event.kind)) {
      for (const path of event.paths) {
        if (basename(path).startsWith(TEMP_FILES_PREFIX)) continue;

        if (isFileInDir(path, CREATORS_DIR_ABS)) {
          console.log("");
          log.info(`${getRel(path)} changed.`);

          const creator = projectMap.find((c) => c.path === path);
          if (typeof creator !== "undefined") creator.buildPageCalls = [];

          runCreator({ path } as WalkEntry).then(() => log.success("Done."));
        } else if (isFileInDir(path, TEMPLATES_DIR_ABS)) {
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

          const rebuilds = [];
          for (const call of calls) {
            rebuilds.push(
              buildPage(call.template.path, call.data, call.options, components)
            );
          }
          Promise.all(rebuilds).then(() => log.success("Done."));
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

          const rebuilds = [];
          for (const call of calls) {
            rebuilds.push(
              buildPage(call.template.path, call.data, call.options, components)
            );
          }
          Promise.all(rebuilds).then(() => log.success("Done."));
        } else if (isFileInDir(path, STATIC_DIR_ABS)) {
          const isUsed = projectMap.some((creator) =>
            creator.buildPageCalls.some((call) =>
              call.template.staticFiles.some((sf) => sf.path === path)
            )
          );

          if (isUsed) {
            console.log("");
            log.info(`${getRel(path)} changed.`);

            const bundlePath = getStaticFileBundlePath(
              path.replace(STATIC_DIR_ABS, "")
            );
            log.info(
              `Updating ${getRel(normalize(DIST_DIR_ABS + bundlePath))}...`
            );

            addStaticToBundle(
              {
                path,
                isCompiled: BUILDABLE_STATIC_EXT.includes(
                  posix.extname(basename(path))
                ),
              },
              bundlePath,
              true
            );

            Promise.all(compilations).then(() => log.success("Done."));
          }
        } else {
          const creatorsToRun: ICreator[] = projectMap.filter(
            (creator) =>
              creator.otherWatchedFiles.includes(path) ||
              creator.otherWatchedDirs.some((dirAbs) =>
                isFileInDir(path, dirAbs)
              )
          );

          if (creatorsToRun.length > 0) {
            console.log("");
            log.info(`${getRel(path)} changed.`);

            Promise.all(
              creatorsToRun.map(({ path }) => runCreator({ path } as WalkEntry))
            ).then(() => log.success("Done."));
          }
        }
      }
    }
  }

  const watcher = Deno.watchFs(Deno.cwd());
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

/**
 * Create missing project directories
 */
export async function init() {
  const directories = checkProjectDirectoriesExist();

  // creating ssgo directories...
  for (const dir of Object.keys(directories)) {
    if (!directories[dir]) {
      log.info(`Creating ${getRel(dir)}/ directory...`);
      ensureDirSync(dir);
    }
  }

  // creating the .gitignore
  if (!existsSync(".gitignore"))
    writeFileStrSync(".gitignore", `**/*/__ssgo*\ndist`);

  log.success(`Project initialized.`);
}
