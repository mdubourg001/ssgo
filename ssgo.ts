import { parse } from "https://deno.land/std@0.80.0/flags/mod.ts"
import type { WebSocket } from "https://deno.land/std@0.80.0/ws/mod.ts"
import { build, init, serve, sitemap, upgrade, watch } from "./src/index.ts"
import {
  BUILD_FLAG,
  CLEAN_OPTION,
  CWD_OPTION,
  DEV_FLAG,
  DIST_DIR_BASE,
  HELP_FLAG,
  INIT_FLAG,
  SITEMAP_OPTION,
  UPGRADE_FLAG,
  VERSION_FLAG,
} from "./src/constants.ts"
import { checkAreValidCLIOptions, getSecondsFrom, log } from "./src/utils.ts"
import getVersion from "./version.ts"

const t0 = performance.now()

log.info(`ssgo ${getVersion()}`)

const FLAGS = checkAreValidCLIOptions(parse(Deno.args))
const clean = !!FLAGS[CLEAN_OPTION]

if (FLAGS[CWD_OPTION]) {
  log.info(`Setting the current working directory to ${FLAGS[CWD_OPTION]}`)
}

switch (true) {
  // display version only

  case FLAGS["_"].includes(VERSION_FLAG):
    break

  // display help

  case FLAGS["_"].includes(HELP_FLAG):
    log.info(
      `ssgo commands:
       - dev: build project to ${DIST_DIR_BASE} and watch project files for changes
            options:
            --host [host]: serve dist/ over specified host (default 'localhost')
            --port [port]: serve dist/ over specified port (default 5580)
            --clean: clean the dist/ directory before building

       - build (default): build project to ${DIST_DIR_BASE}
            options:
            --sitemap [host]: generate a sitemap of the built pages for the given host
            --only-creators [creators]: narrow the creators to run to the comma-separated list provided
            --clean: clean the dist/ directory before building

       - init: initialize project directories (does NOT override if these already exist)
       - help: display help menu

       global options:
       --cwd [path]: set the current working directory to the given path
    `
    )
    break

  // upgrade ssgo version if exists

  case FLAGS["_"].includes(UPGRADE_FLAG):
    upgrade()
    break

  // dev: build, watch files and serve

  case FLAGS["_"].includes(DEV_FLAG):
    build(clean).then(() => {
      log.success(`Project started in ${getSecondsFrom(t0)} seconds.`)

      const listeners: Array<WebSocket> = []

      serve(listeners)
      watch(listeners)
    })
    break

  // init: create missing project directories

  case FLAGS["_"].includes(INIT_FLAG):
    init()
    break

  // build only

  case FLAGS["_"].includes(BUILD_FLAG) || FLAGS["_"].length === 0:
    build(clean).then(() => {
      sitemap(FLAGS[SITEMAP_OPTION])

      log.success(`Project built in ${getSecondsFrom(t0)} seconds.`)
    })
    break

  // unknow arguments

  default:
    log.error(`Unknow arguments: '${FLAGS["_"].join(" ")}'`)
}
