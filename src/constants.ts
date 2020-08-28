import { normalize } from "https://deno.land/std@0.66.0/path/mod.ts";

// ----- cli ----- //

export const DEV_FLAG = "dev";
export const SERVE_FLAG = "serve";
export const BUILD_FLAG = "build";
export const HELP_FLAG = "help";
export const INIT_FLAG = "init";
export const VERSION_FLAG = "version";

export const SITEMAP_OPTION = "sitemap";

// ----- config ----- //

export const TEMP_FILES_PREFIX = "__ssgo";

export const WATCHER_THROTTLE = 300;

export const SERVE_PORT = 5580;

export const CREATORS_DIR_BASE = "creators";
export const CREATORS_DIR_ABS = normalize(
  `${Deno.cwd()}/${CREATORS_DIR_BASE}/`,
);

export const TEMPLATES_DIR_BASE = "templates";
export const TEMPLATES_DIR_ABS = normalize(
  `${Deno.cwd()}/${TEMPLATES_DIR_BASE}/`,
);

export const COMPONENTS_DIR_BASE = "components";
export const COMPONENTS_DIR_ABS = normalize(
  `${Deno.cwd()}/${COMPONENTS_DIR_BASE}/`,
);

export const STATIC_DIR_BASE = "static";
export const STATIC_DIR_ABS = normalize(`${Deno.cwd()}/${STATIC_DIR_BASE}/`);

export const DIST_DIR_BASE = "dist";
export const DIST_DIR_ABS = normalize(`${Deno.cwd()}/${DIST_DIR_BASE}/`);

export const DIST_STATIC_BASE = "static";
export const DIST_STATIC_ABS = normalize(
  `${DIST_DIR_ABS}/${DIST_STATIC_BASE}/`,
);

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
