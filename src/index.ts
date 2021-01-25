import { parse } from "https://cdn.skypack.dev/html5parser"
import {
  Application,
  Context,
  send,
} from "https://deno.land/x/oak@v6.3.2/mod.ts"

import type { WebSocket } from "https://deno.land/std@0.84.0/ws/mod.ts"
import {
  copySync,
  emptyDirSync,
  ensureDirSync,
  existsSync,
  WalkEntry,
  walkSync,
} from "https://deno.land/std@0.84.0/fs/mod.ts"
import {
  basename,
  common,
  dirname,
  normalize,
  posix,
  relative,
  resolve,
} from "https://deno.land/std@0.84.0/path/mod.ts"

import {
  BUILDABLE_STATIC_EXT,
  COMPONENTS_DIR_ABS,
  CREATORS_DIR_ABS,
  CREATORS_FILTERING,
  CWD,
  DIST_DIR_ABS,
  DIST_DIR_BASE,
  REPOSITORY_URL,
  SERVE_HOST,
  SERVE_PORT,
  STATIC_DIR_ABS,
  TEMP_FILES_PREFIX,
  TEMPLATES_DIR_ABS,
  TEMPLATES_DIR_BASE,
  WATCHER_THROTTLE,
  WS_HOT_RELOAD_KEY,
} from "./constants.ts"
import type {
  IBuildPageCall,
  IBuildPageOptions,
  IBuildPageParams,
  IContextData,
  ICreator,
  ICustomComponent,
  INode,
  ISsgoBag,
  IStaticFile,
  ITemplate,
} from "./types.ts"
import {
  checkBuildPageOptions,
  checkComponentNameUnicity,
  checkEmptyTemplate,
  checkProjectDirectoriesExist,
  cleanTempFiles,
  createDefaultCreator,
  createDefaultStaticFile,
  createDefaultTemplate,
  formatAttributes,
  getFormattedErrorPage,
  getOutputPagePath,
  getRel,
  getStaticFileBundlePath,
  importModule,
  injectServeWebsocketScript,
  isComment,
  isDevelopmentEnv,
  isFileInDir,
  isScript,
  isTemplate,
  log,
  writeTempFileWithContentOf,
} from "./utils.ts"
import { buildHtml } from "./build.ts"
import getVersion from "../version.ts"

// ----- globals ----- //

let creators: WalkEntry[] = []
let components: WalkEntry[] = []

let projectMap: ICreator[] = []
let compilations: Promise<any>[] = []

// ----- business ----- //

/**
 * Walk through creators/ and components/ to init global vars
 */
function walkCreatorsAndComponents() {
  if (CREATORS_FILTERING) {
    const hr = CREATORS_FILTERING.split(",")
      .join(", ")
      .replace(/,([^,]*)$/, " and$1")
    log.info(`Narrowing the creators to run to ${hr} (if exist).`)
  }

  creators = Array.from(walkSync(CREATORS_DIR_ABS)).filter(
    (file: WalkEntry) => {
      // check if creator is included into the creators filtering
      const matchCreatorFiltering =
        !CREATORS_FILTERING ||
        CREATORS_FILTERING.split(",").includes(
          file.path.replace(common([CREATORS_DIR_ABS, file.path]), "")
        )

      return isScript(file.name) && matchCreatorFiltering
    }
  )

  components = existsSync(COMPONENTS_DIR_ABS)
    ? Array.from(walkSync(COMPONENTS_DIR_ABS)).filter((file: WalkEntry) =>
        isTemplate(file.name)
      )
    : []
}

function clearCreatorBuildPageCalls(creatorAbs: string) {
  const existingEntry: ICreator | undefined = projectMap.find(
    ({ path }) => path === creatorAbs
  )
  if (!existingEntry) return

  existingEntry.buildPageCalls = []
}

/**
 * Cache a call to buildPage
 */
function cacheBuildPageCall(
  creatorAbs: string,
  { template: templateRel, data, options }: IBuildPageParams
) {
  const templateAbs = normalize(`${TEMPLATES_DIR_ABS}/${templateRel}`)
  if (!existsSync(templateAbs)) {
    throw new Error(
      `When running ${getRel(
        creatorAbs
      )}: Can't find given template: ${templateRel} inside of ${TEMPLATES_DIR_BASE}/ directory.`
    )
  }

  const pageBuildCall: IBuildPageCall = {
    template: {
      path: templateAbs,
      customComponents: [],
      staticFiles: [],
    },
    data,
    options,
  }

  const existingEntry: ICreator | undefined = projectMap.find(
    ({ path }) => path === creatorAbs
  )

  if (!!existingEntry) existingEntry.buildPageCalls.push(pageBuildCall)
  else {
    projectMap.push({
      path: creatorAbs,
      buildPageCalls: [pageBuildCall],
      otherWatchedFiles: [],
      otherWatchedDirs: [],
    })
  }
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
      ]
    },
    []
  )

  existingEntries.forEach((entry) => {
    entry.customComponents = Array.from(
      new Set([...entry.customComponents, event])
    )
  })
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
      ]
    },
    []
  )

  existingEntries.forEach((entry) => {
    entry.staticFiles = Array.from(new Set([...entry.staticFiles, event]))
  })
}

/**
 * Compile if needed, and add file to bundle
 */
function addStaticToBundle(
  staticFile: IStaticFile,
  destRel: string,
  override: boolean = false
) {
  const destAbs = normalize(`${DIST_DIR_ABS}/${destRel}`)
  if (!override && existsSync(destAbs)) return

  ensureDirSync(dirname(destAbs))

  if (staticFile.isCompiled) {
    compilations.push(
      new Promise(async (resolve) => {
        const tempAbs = writeTempFileWithContentOf(staticFile.path)

        // @ts-ignore
        const [diag, emit] = await Deno.bundle(tempAbs, undefined, {
          lib: ["dom", "esnext", "deno.ns"],
          allowJs: true,
        })
        Deno.remove(tempAbs)

        if (!diag) {
          Deno.writeTextFileSync(destAbs, emit)
          resolve({
            destRel,
            result: emit,
          })
        } else {
          log.error(
            `Error when calling Deno.bundle on ${getRel(staticFile.path)}:`
          )
          throw new Error(JSON.stringify(diag, null, 1))
        }
      })
    )
  } else {
    copySync(staticFile.path, destAbs, { overwrite: true })
  }
}

/**
 * Bind a file to a creator's watcher
 */
function addFileToWatcher(creatorAbs: string, fileAbs: string) {
  const existingEntry: ICreator | undefined = projectMap.find(
    ({ path }) => path === creatorAbs
  )
  const normalized = normalize(fileAbs)
  if (!existsSync(normalized)) {
    log.warning(`Can't find '${getRel(fileAbs)}', won't watch for changes.`)
  }

  if (!!existingEntry) {
    if (!existingEntry.otherWatchedFiles.includes(normalized)) {
      existingEntry?.otherWatchedFiles.push(normalized)
    }
  } else {
    projectMap.push({
      path: creatorAbs,
      buildPageCalls: [],
      otherWatchedFiles: [normalized],
      otherWatchedDirs: [],
    })
  }
}

/**
 * Bind a directory to a creator's watcher
 */
function addDirToWatcher(creatorAbs: string, dirAbs: string) {
  const existingEntry: ICreator | undefined = projectMap.find(
    ({ path }) => path === creatorAbs
  )
  const normalized = normalize(dirAbs)
  if (!existsSync(normalized)) {
    log.warning(
      `Can't find '${getRel(dirAbs)}' directory, won't watch for changes.`
    )
  }

  if (!!existingEntry) {
    if (!existingEntry.otherWatchedDirs.includes(normalized)) {
      existingEntry?.otherWatchedDirs.push(normalized)
    }
  } else {
    projectMap.push({
      path: creatorAbs,
      buildPageCalls: [],
      otherWatchedFiles: [],
      otherWatchedDirs: [normalized],
    })
  }
}

/**
 * Serialize back to HTML files
 */
export function serialize(node: INode) {
  let result = ""

  if (isComment(node)) {
    return ""
  } else if (node.type === "Text") {
    result += node.value.trim()
  } else if (node.type === "Tag") {
    const attributes = formatAttributes(node.attributes)
    result += `<${node.rawName}${attributes.length > 0 ? " " + attributes : ""}`
    if (node.close === null) return result + "/>"
    else result += ">"

    for (let child of node.body || []) result += serialize(child)

    result += node.close?.value
  }

  return result
}

/**
 * Build a given template with given data and write the file to fs
 * Function given to creators as first param
 */
export async function buildPage(
  templateAbs: string,
  data: IContextData,
  options: IBuildPageOptions,
  availableComponents: ICustomComponent[],
  writeToFS = true
) {
  log.info(`Building ${getRel(getOutputPagePath(options))}...`)

  const read = Deno.readTextFileSync(templateAbs)
  const parsed = parse(read).filter((n: INode) =>
    "value" in n ? n.value !== "\n" : true
  )
  let serialized = null

  checkEmptyTemplate(parsed, templateAbs)

  for (let node of parsed) {
    ;(node as INode).parent = parsed
    buildHtml(
      node,
      data,
      availableComponents,
      (e: ICustomComponent) => bindTemplateToCustomComponent(templateAbs, e),
      (e: IStaticFile, destRel: string) => {
        bindTemplateToStatic(templateAbs, e)
        addStaticToBundle(e, destRel)
      },
      (e: Error) => {
        serialized = getFormattedErrorPage(e.message, e.stack)
      }
    )
  }

  if (serialized === null) {
    serialized = parsed.map((node: INode) => serialize(node)).join("")
  }

  const outputPageAbs = getOutputPagePath(options)

  if (isDevelopmentEnv()) {
    serialized = injectServeWebsocketScript(serialized)
  }

  if (writeToFS) {
    ensureDirSync(dirname(outputPageAbs))
    Deno.writeTextFileSync(outputPageAbs, serialized)
  }

  return serialized
}

export async function runCreator(creator: WalkEntry) {
  if (basename(creator.path).startsWith(TEMP_FILES_PREFIX)) return

  const creatorRel = getRel(creator.path)
  log.info(`Running ${creatorRel}...`)

  const module = await importModule(creator.path)

  // as every valid creator should export a default function
  if (!module.default || typeof module.default !== "function") {
    log.warning(
      `When running ${creatorRel}: A creator must export a default function.`
    )
    return
  }

  // clearing creators buildPage cache if exists
  clearCreatorBuildPageCalls(creator.path)

  const modulePromise = module.default(
    async function (
      template: string,
      data: IContextData,
      options: IBuildPageOptions
    ) {
      const templateAbs = normalize(`${TEMPLATES_DIR_ABS}/${template}`)

      cacheBuildPageCall(creator.path, {
        template: template,
        data,
        options,
      })

      // not building pages directly in dev mode are pages are built on demand
      if (!isDevelopmentEnv()) {
        checkBuildPageOptions(template, options)
        await buildPage(templateAbs, data, options, components)
      }
    },
    {
      watchFile: (path: string) =>
        addFileToWatcher(creator.path, resolve(CWD, path)),
      watchDir: (path: string) =>
        addDirToWatcher(creator.path, resolve(CWD, path)),
      addStaticToBundle: (
        path: string,
        bundleDest: string = "",
        compile: boolean = false,
        override: boolean = false
      ) =>
        addStaticToBundle(
          { path: resolve(CWD, path), isCompiled: compile },
          getStaticFileBundlePath(`${bundleDest}/${basename(path)}`),
          override
        ),
      context: {
        mode: isDevelopmentEnv() ? "development" : "production",
        projectRoot: CWD,
      },
      log,
    } as ISsgoBag
  )

  if (modulePromise) {
    modulePromise.catch(
      (error: Error) =>
        error.stack &&
        log.error(
          `When running '${creatorRel}': ${error.stack}`,
          !isDevelopmentEnv()
        )
    )
  }

  return modulePromise
}

/**
 * Build the project
 */
export async function build(clean = false) {
  checkProjectDirectoriesExist(true)
  cleanTempFiles()
  walkCreatorsAndComponents()

  checkComponentNameUnicity(components)

  ensureDirSync(DIST_DIR_ABS)
  if (clean) {
    emptyDirSync(DIST_DIR_ABS)

    log.info(`Emptying ${getRel(DIST_DIR_ABS)} directory...`)
  }

  const builds: Promise<any>[] = []
  for (let creator of creators) {
    builds.push(runCreator(creator))
  }

  return new Promise(async (resolve) => {
    // wait for buildPage and Deno.bundle calls to end
    await Promise.all([Promise.all(builds), Promise.all(compilations)])

    resolve(0)
  })
}

/**
 * Watch project files for change
 */
export async function watch(listeners: Array<WebSocket>) {
  // https://github.com/Caesar2011/rhinoder/blob/master/mod.ts
  let timeout: number | null = null

  // notify listening websockets that dist/ changed
  function notifyListeners() {
    for (let listener of listeners) {
      if (!listener.isClosed) listener.send(WS_HOT_RELOAD_KEY)
    }
  }

  async function handleFsEvent(event: Deno.FsEvent) {
    if (["create", "modify", "remove"].includes(event.kind)) {
      for (const path of event.paths) {
        if (basename(path).startsWith(TEMP_FILES_PREFIX)) continue

        if (
          isFileInDir(path, CREATORS_DIR_ABS) &&
          creators.find((c) => c.path === path) !== undefined
        ) {
          console.log("")
          log.info(`${getRel(path)} changed.`)

          const creator = projectMap.find((c) => c.path === path)
          if (typeof creator !== "undefined") creator.buildPageCalls = []

          runCreator({ path } as WalkEntry).then(() => {
            notifyListeners()
            log.success("Done.")
          })
        } else if (isFileInDir(path, TEMPLATES_DIR_ABS)) {
          console.log("")
          log.info(`${getRel(path)} changed.`)

          // just notify the listeners for them to reload the page
          notifyListeners()
        } else if (isFileInDir(path, COMPONENTS_DIR_ABS)) {
          console.log("")
          log.info(`${getRel(path)} changed.`)

          // just notify the listeners for them to reload the page
          notifyListeners()
        } else if (isFileInDir(path, STATIC_DIR_ABS)) {
          const isUsed = projectMap.some((creator) =>
            creator.buildPageCalls.some((call) =>
              call.template.staticFiles.some((sf) => sf.path === path)
            )
          )

          if (isUsed) {
            console.log("")
            log.info(`${getRel(path)} changed.`)

            const bundlePath = getStaticFileBundlePath(
              path.replace(STATIC_DIR_ABS, "")
            )
            log.info(
              `Updating ${getRel(normalize(DIST_DIR_ABS + bundlePath))}...`
            )

            addStaticToBundle(
              {
                path,
                isCompiled: BUILDABLE_STATIC_EXT.includes(
                  posix.extname(basename(path))
                ),
              },
              bundlePath,
              true
            )

            Promise.all(compilations).then(() => {
              notifyListeners()
              log.success("Done.")
            })
          }
        } else {
          const creatorsToRun: ICreator[] = projectMap.filter(
            (creator) =>
              creator.otherWatchedFiles.includes(path) ||
              creator.otherWatchedDirs.some((dirAbs) =>
                isFileInDir(path, dirAbs)
              )
          )

          if (creatorsToRun.length > 0) {
            console.log("")
            log.info(`${getRel(path)} changed.`)

            Promise.all(
              creatorsToRun.map(({ path }) => runCreator({ path } as WalkEntry))
            ).then(() => {
              notifyListeners()
              log.success("Done.")
            })
          }
        }
      }
    }
  }

  const watcher = Deno.watchFs(CWD)
  log.info("Watching files for changes...")

  for await (const event of watcher) {
    if (event.kind !== "access") {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => handleFsEvent(event), WATCHER_THROTTLE)
    }
  }
}

/**
 * Serve the bundle locally
 */
export async function serve(listeners: Array<WebSocket> = []) {
  if (!existsSync(`${CWD}/${DIST_DIR_BASE}`)) {
    log.error(
      `Can't serve from '${CWD}/${DIST_DIR_BASE}': directory does not exists. Try running a build first (ssgo build).`
    )
    Deno.exit(1)
  }

  const app = new Application()

  app.use(async (context: Context) => {
    if (isDevelopmentEnv()) {
      // handling WS connection / upgrade
      if (context.request.url.pathname === "/__ws" && context.isUpgradable) {
        const sock = await context.upgrade()
        const index = listeners.findIndex(
          (l) =>
            (l.conn.remoteAddr as any).hostname ===
            (sock.conn.remoteAddr as any).hostname
        )

        if (index === -1) {
          listeners.push(sock)
        } else {
          listeners[index] = sock
        }
      } // handling files requests
      else {
        const jitBuilds = []

        for (const creator of projectMap) {
          for (const call of creator.buildPageCalls) {
            const reqPathnameAbs = normalize(
              `${CWD}/${DIST_DIR_BASE}/${context.request.url.pathname}`
            )

            // JIT build of requested dist templates
            if (
              getOutputPagePath(call.options) === reqPathnameAbs ||
              getOutputPagePath(call.options) === `${reqPathnameAbs}index.html`
            ) {
              jitBuilds.push(
                buildPage(
                  call.template.path,
                  call.data,
                  call.options,
                  components
                )
              )
            }
          }
        }

        // wait for builds to finish
        await Promise.all(jitBuilds)
        await send(context, context.request.url.pathname, {
          root: `${CWD}/${DIST_DIR_BASE}`,
          index: "index.html",
        })
      }
    } else {
      await send(context, context.request.url.pathname, {
        root: `${CWD}/${DIST_DIR_BASE}`,
        index: "index.html",
      })
    }
  })

  app.listen({ port: SERVE_PORT })
  log.info(`Serving ${DIST_DIR_BASE} on http://${SERVE_HOST}:${SERVE_PORT}`)
}

/**
 * Create missing project directories
 */
export async function init() {
  const directories = checkProjectDirectoriesExist()

  // creating ssgo directories...
  for (const dir of Object.keys(directories)) {
    if (directories[dir] === "noexists") {
      log.info(`Creating ${getRel(dir)}/ directory...`)
      ensureDirSync(dir)
    }
  }

  // if all directories are empty, creating default files
  if (Object.values(directories).every((state) => state !== "exists")) {
    log.info(`Creating default project files...`)

    createDefaultTemplate()
    createDefaultCreator()
    createDefaultStaticFile()
  }

  // creating the .gitignore
  if (!existsSync(".gitignore")) {
    Deno.writeTextFileSync(".gitignore", `**/*/__ssgo*\ndist`)
  }

  log.success(`Project initialized.`)
}

/**
 * Create the sitemap.xml file
 */
export function sitemap(host?: string) {
  if (typeof host === "undefined") return

  log.info("Generating sitemap.xml...")

  const now = new Date().toISOString()
  let urlEntries: string = projectMap.reduce(
    (acc: string, curr: ICreator): string => {
      for (let call of curr.buildPageCalls) {
        const loc = `${host}/${relative(
          DIST_DIR_ABS,
          getOutputPagePath(call.options)
        )}`
        acc += `\t<url>\n\t\t<loc>${loc}</loc>\n\t\t<lastmod>${now}</lastmod>\n\t</url>\n`
      }

      return acc
    },
    ""
  )

  Deno.writeTextFileSync(
    resolve(DIST_DIR_ABS, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}</urlset>`
  )
}

/**
 * Upgrade to latest ssgo version if exists
 */
export async function upgrade() {
  log.info("Upgrading ssgo...")

  const actual = getVersion()
  const tags = await fetch(`${REPOSITORY_URL}/tags`)

  if (tags.status === 200) {
    const latest = (await tags.json())[0]

    if (latest.name === `v${actual}`) {
      log.info("You are already using the latest version of ssgo.")
    } else {
      const installProcess = Deno.run({
        cmd: [
          "deno",
          "install",
          "--unstable",
          "-A",
          "-q",
          "-f",
          `https://deno.land/x/ssgo@${latest.name}/ssgo.ts`,
        ],
        stdout: "piped",
        stderr: "piped",
      })

      const status = await installProcess.status()

      if (!status.success) {
        throw new Error(
          `Something went wrong while upgrading to ${latest.name}. Aborting upgrade.`
        )
      } else {
        log.success(`Upgraded ssgo to ${latest.name}!`)
      }

      installProcess.close()
    }
  } else {
    log.error(
      "Something went wrong while fetching latest version. Aborting upgrade."
    )
  }
}
