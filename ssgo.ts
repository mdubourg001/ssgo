import { parse } from "https://deno.land/std@0.118.0/flags/mod.ts"

import { build, init, serve, sitemap, upgrade, watch } from "./src/index.ts"
import {
  BUILD_FLAG,
  CLEAN_OPTION,
  CWD_OPTION,
  DEV_FLAG,
  HELP_FLAG,
  HELP_TEXT,
  INIT_FLAG,
  SERVE_FLAG,
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
    log.info(HELP_TEXT)
    break

  // upgrade ssgo version if exists

  case FLAGS["_"].includes(UPGRADE_FLAG):
    upgrade()
    break

  // dev: build, watch files and serve

  case FLAGS["_"].includes(DEV_FLAG):
    build(clean).then(() => {
      log.success(`Project started in ${getSecondsFrom(t0)} seconds.`)

      // pairs of [WebSockets, IP address]
      const listeners: Array<[WebSocket, string]> = []

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
    build(true).then(() => {
      sitemap(FLAGS[SITEMAP_OPTION])

      log.success(`Project built in ${getSecondsFrom(t0)} seconds.`)
    })
    break

  // serve only

  case FLAGS["_"].includes(SERVE_FLAG):
    serve()
    break

  // unknow arguments

  default:
    log.error(`Unknow arguments: '${FLAGS["_"].join(" ")}'`)
}
