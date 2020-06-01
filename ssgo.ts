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
} from "./src/constants.ts";
import { log } from "./src/utils.ts";
import getVersion from "./version.ts";

const FLAGS = parse(Deno.args);

log.info(`ssgo ${getVersion()}`);

if (FLAGS["_"].includes(VERSION_FLAG)) () => {};
else if (FLAGS["_"].includes(HELP_FLAG)) {
  log.info(
    `ssgo commands:
    - dev: build project to ${DIST_DIR_BASE} and watch project files for changes
    - build (default): build project to ${DIST_DIR_BASE}
    - init: initialize project directories (does NOT override if these already exist)
    - help: display help menu
  `,
  );
} // dev: build, watch files and serve
else if (FLAGS["_"].includes(DEV_FLAG)) {
  build().then(() => {
    watch();
  });
} // init: create missing project directories
else if (FLAGS["_"].includes(INIT_FLAG)) init();
// build only
else if (FLAGS["_"].includes(BUILD_FLAG) || FLAGS["_"].length === 0) {
  build().then(() => {
    sitemap(FLAGS[SITEMAP_OPTION]);
  });
} // unknow arguments
else log.error(`Unknow arguments: '${FLAGS["_"].join(" ")}'`);
