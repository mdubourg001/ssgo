import { build, watch, serve } from "./src/index.ts";
import {
  DEV_FLAG,
  SERVE_FLAG,
  BUILD_FLAG,
  HELP_FLAG,
  SERVE_PORT,
  DIST_DIR_BASE,
} from "./src/constants.ts";
import { log } from "./src/utils.ts";

if (Deno.args.includes(HELP_FLAG)) {
  log.info(
    `ssgo accepted arguments:
    - dev: build project to ${DIST_DIR_BASE}, watch for file changes and serve on port ${SERVE_PORT}
    - serve: serve ${DIST_DIR_BASE} directory on port ${SERVE_PORT}
    - build (default): build project only to ${DIST_DIR_BASE}
    - help: display help menu
  `
  );
}
// dev: build, watch files and serve
else if (Deno.args.includes(DEV_FLAG))
  build().then(() => {
    watch();
    serve();
  });
// serve: serve files only
else if (Deno.args.includes(SERVE_FLAG)) serve();
// build only
else if (Deno.args.includes(BUILD_FLAG) || Deno.args.length === 0) build();
// unknow arguments
else log.error(`Unknow arguments: '${Deno.args.join(" ")}'`);
