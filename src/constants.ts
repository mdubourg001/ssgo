import { parse } from "https://deno.land/std@0.80.0/flags/mod.ts";
import { normalize } from "https://deno.land/std@0.80.0/path/mod.ts";

// ----- cli ----- //

export const DEV_FLAG = "dev";
export const SERVE_FLAG = "serve";
export const BUILD_FLAG = "build";
export const HELP_FLAG = "help";
export const INIT_FLAG = "init";
export const VERSION_FLAG = "version";
export const UPGRADE_FLAG = "upgrade";

export const SITEMAP_OPTION = "sitemap";
export const PORT_OPTION = "port";
export const HOST_OPTION = "host";
export const ONLY_CREATORS_OPTION = "only-creators";

// ----- config ----- //

const FLAGS = parse(Deno.args);

export let VERBOSITY = 1;

export const IS_DEV_MODE = FLAGS["_"].includes(DEV_FLAG);
export const IS_PROD_MODE = FLAGS["_"].includes(BUILD_FLAG) ||
  FLAGS["_"].length === 0;

export const TEMP_FILES_PREFIX = "__ssgo";

export const WATCHER_THROTTLE = 300;

export const SERVE_PORT = FLAGS[PORT_OPTION] ?? 5580;
export const SERVE_HOST = FLAGS[HOST_OPTION] ?? "localhost";
export const WS_HOT_RELOAD_KEY = "__ssgo_ws_hot_reload";
export const WS_PING_KEY = "__ssgo_ws_ping";

export const CREATORS_FILTERING: string | undefined =
  FLAGS[ONLY_CREATORS_OPTION] ?? undefined;

export const CREATORS_DIR_BASE = "creators";
export const TEMPLATES_DIR_BASE = "templates";
export const COMPONENTS_DIR_BASE = "components";
export const STATIC_DIR_BASE = "static";
export const DIST_DIR_BASE = "dist";
export const DIST_STATIC_BASE = "static";

export let CREATORS_DIR_ABS = normalize(`${Deno.cwd()}/${CREATORS_DIR_BASE}/`);
export let TEMPLATES_DIR_ABS = normalize(
  `${Deno.cwd()}/${TEMPLATES_DIR_BASE}/`,
);
export let STATIC_DIR_ABS = normalize(`${Deno.cwd()}/${STATIC_DIR_BASE}/`);
export let COMPONENTS_DIR_ABS = normalize(
  `${Deno.cwd()}/${COMPONENTS_DIR_BASE}/`,
);
export let DIST_DIR_ABS = normalize(`${Deno.cwd()}/${DIST_DIR_BASE}/`);
export let DIST_STATIC_ABS = normalize(`${DIST_DIR_ABS}/${DIST_STATIC_BASE}/`);

export function setSsgoDir(path: string) {
  Deno.chdir(path);

  CREATORS_DIR_ABS = normalize(`${Deno.cwd()}/${CREATORS_DIR_BASE}/`);
  TEMPLATES_DIR_ABS = normalize(`${Deno.cwd()}/${TEMPLATES_DIR_BASE}/`);
  STATIC_DIR_ABS = normalize(`${Deno.cwd()}/${STATIC_DIR_BASE}/`);
  COMPONENTS_DIR_ABS = normalize(`${Deno.cwd()}/${COMPONENTS_DIR_BASE}/`);
  DIST_DIR_ABS = normalize(`${Deno.cwd()}/${DIST_DIR_BASE}/`);
  DIST_STATIC_ABS = normalize(`${DIST_DIR_ABS}/${DIST_STATIC_BASE}/`);
}

export function setVerbosity(verbosity: number) {
  VERBOSITY = verbosity;
}

// ----- business ----- //

export const POTENTIAL_STATIC_ATTR = [
  "src",
  "href",
  "icon",
  "poster",
  "srcset",
];

export const BUILDABLE_STATIC_EXT = [".ts", ".jsx", ".tsx"];

export const CHILDREN_COMPONENT_PROP = "children";

export const REPOSITORY_URL = "https://api.github.com/repos/mdubourg001/ssgo";
