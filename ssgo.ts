import { build, watch, serve, init } from "./src/index.ts";
import {
  DEV_FLAG,
  SERVE_FLAG,
  BUILD_FLAG,
  HELP_FLAG,
  INIT_FLAG,
  SERVE_PORT,
  DIST_DIR_BASE,
} from "./src/constants.ts";
import { log } from "./src/utils.ts";
import getVersion from "./version.ts";

log.info(`ssgo ${getVersion()}`);

if (Deno.args.includes(HELP_FLAG)) {
  log.info(
    `ssgo accepted arguments:
    - dev: build project to ${DIST_DIR_BASE} and watch for file changes
    - build (default): build project only to ${DIST_DIR_BASE}
    - init: initialize project directories (does NOT override if these already exist)
    - help: display help menu
  `
  );
} // dev: build, watch files and serve
else if (Deno.args.includes(DEV_FLAG)) {
  build().then(() => {
    watch();
    serve();
  });
} // serve: serve files only
else if (Deno.args.includes(SERVE_FLAG)) serve();
// init: create missing project directories
else if (Deno.args.includes(INIT_FLAG)) init();
// build only
else if (Deno.args.includes(BUILD_FLAG) || Deno.args.length === 0) build();
// unknow arguments
else log.error(`Unknow arguments: '${Deno.args.join(" ")}'`);
