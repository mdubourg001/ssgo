// ----- cli ----- //

export const DEV_FLAG = "dev";
export const SERVE_FLAG = "serve";
export const BUILD_FLAG = "build";
export const HELP_FLAG = "help";
export const INIT_FLAG = "init";

// ----- config ----- //

export const WATCHER_THROTTLE = 300;

export const SERVE_PORT = 8080;

export const CREATORS_DIR_BASE = "creators";
export const CREATORS_DIR_ABS = `${Deno.cwd()}/${CREATORS_DIR_BASE}/`;

export const TEMPLATES_DIST_BASE = "templates";
export const TEMPLATES_DIST_ABS = `${Deno.cwd()}/${TEMPLATES_DIST_BASE}/`;

export const COMPONENTS_DIR_BASE = "components";
export const COMPONENTS_DIR_ABS = `${Deno.cwd()}/${COMPONENTS_DIR_BASE}/`;

export const STATIC_DIR_BASE = "static";
export const STATIC_DIR_ABS = `${Deno.cwd()}/${STATIC_DIR_BASE}/`;

export const DIST_DIR_BASE = "dist";
export const DIST_DIR_ABS = `${Deno.cwd()}/${DIST_DIR_BASE}/`;

export const DIST_STATIC_BASE = "static";
export const DIST_STATIC_ABS = `${DIST_DIR_ABS}/${DIST_STATIC_BASE}/`;

// ----- business ----- //

export const POTENTIAL_STATIC_ATTR = [
  "src",
  "href",
  "icon",
  "poster",
  "srcset",
];

export const BUILDABLE_STATIC_EXT = [".ts", ".jsx", ".tsx"];
