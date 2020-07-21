import { parse } from "https://deno.land/std/flags/mod.ts";
import { build, watch, init, sitemap } from "./src/index.ts";
import {
  DEV_FLAG,
  BUILD_FLAG,
  HELP_FLAG,
  INIT_FLAG,
  DIST_DIR_BASE,
  VERSION_FLAG,
  SITEMAP_OPTION,
  ENV,
} from "./src/constants.ts";
import { log } from "./src/utils.ts";
import getVersion from "./version.ts";

const FLAGS = parse(Deno.args);
export let SSGO_ENV = ENV.PROD;

log.info(`ssgo ${getVersion()}`);

switch (true) {
  // display version only
  case FLAGS["_"].includes(VERSION_FLAG):
    break;

  // display help
  case FLAGS["_"].includes(HELP_FLAG):
    log.info(
      `ssgo commands:
       - dev: build project to ${DIST_DIR_BASE} and watch project files for changes
       - build (default): build project to ${DIST_DIR_BASE}
       - init: initialize project directories (does NOT override if these already exist)
       - help: display help menu
  
       options:
       --sitemap [host]: generate a sitemap of the built pages for the given host
    `
    );
    break;

  // dev: build, watch files and serve
  case FLAGS["_"].includes(DEV_FLAG):
    // setting the env to DEV
    SSGO_ENV = ENV.DEV;

    build().then(() => {
      log.success("Project built.");

      watch();
    });
    break;

  // init: create missing project directories
  case FLAGS["_"].includes(INIT_FLAG):
    init();
    break;

  // build only
  case FLAGS["_"].includes(BUILD_FLAG) || FLAGS["_"].length === 0:
    build().then(() => {
      sitemap(FLAGS[SITEMAP_OPTION]);

      log.success("Project built.");
    });
    break;

  // unknow arguments
  default:
    log.error(`Unknow arguments: '${FLAGS["_"].join(" ")}'`);
}
