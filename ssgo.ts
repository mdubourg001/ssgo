import { parse } from "https://deno.land/std/flags/mod.ts"
import type { WebSocket } from "https://deno.land/std/ws/mod.ts"
import { build, watch, serve, init, sitemap } from "./src/index.ts"
import {
  DEV_FLAG,
  BUILD_FLAG,
  HELP_FLAG,
  INIT_FLAG,
  DIST_DIR_BASE,
  VERSION_FLAG,
  SITEMAP_OPTION,
} from "./src/constants.ts"
import { log, checkAreValidCLIOptions } from "./src/utils.ts"
import getVersion from "./version.ts"

log.info(`ssgo ${getVersion()}`)

const FLAGS = checkAreValidCLIOptions(parse(Deno.args))

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

       - build (default): build project to ${DIST_DIR_BASE}
            options:
            --sitemap [host]: generate a sitemap of the built pages for the given host

       - init: initialize project directories (does NOT override if these already exist)
       - help: display help menu
    `
    )
    break

  // dev: build, watch files and serve
  case FLAGS["_"].includes(DEV_FLAG):
    build().then(() => {
      log.success("Project built.")

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
    build().then(() => {
      sitemap(FLAGS[SITEMAP_OPTION])

      log.success("Project built.")
    })
    break

  // unknow arguments
  default:
    log.error(`Unknow arguments: '${FLAGS["_"].join(" ")}'`)
}
