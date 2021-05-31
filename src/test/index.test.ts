import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts";
import { join } from "https://deno.land/std@0.97.0/path/mod.ts";
import { existsSync } from "https://deno.land/std@0.97.0/fs/mod.ts";

import {
  COMPONENTS_DIR_ABS,
  CREATORS_DIR_ABS,
  CREATORS_DIR_BASE,
  STATIC_DIR_ABS,
  TEMPLATES_DIR_ABS,
  TEMPLATES_DIR_BASE,
} from "../constants.ts";
import { init } from "../index.ts";
import { getTestEnv } from "./helpers.ts";

// -----
// ssgo init
// -----

Deno.test(
  "`ssgo init` in an empty dir should initialize a project",
  async () => {
    getTestEnv({});

    await init();

    assertEquals(existsSync(CREATORS_DIR_ABS), true);
    assertEquals(existsSync(TEMPLATES_DIR_ABS), true);
    assertEquals(existsSync(COMPONENTS_DIR_ABS), true);
    assertEquals(existsSync(STATIC_DIR_ABS), true);

    assertEquals(existsSync(".gitignore"), true);
    assertEquals(existsSync(join(CREATORS_DIR_ABS, "index.ts")), true);
    assertEquals(existsSync(join(TEMPLATES_DIR_ABS, "index.html")), true);
    assertEquals(existsSync(join(STATIC_DIR_ABS, "index.css")), true);
  },
);

Deno.test(
  "`ssgo init` in a partially inited dir should create missing directories",
  async () => {
    getTestEnv({ [CREATORS_DIR_BASE]: {}, [TEMPLATES_DIR_BASE]: {} });
    await init();

    assertEquals(existsSync(CREATORS_DIR_ABS), true);
    assertEquals(existsSync(TEMPLATES_DIR_ABS), true);
    assertEquals(existsSync(COMPONENTS_DIR_ABS), true);
    assertEquals(existsSync(STATIC_DIR_ABS), true);

    assertEquals(existsSync(".gitignore"), true);
    assertEquals(existsSync(join(CREATORS_DIR_ABS, "index.ts")), true);
    assertEquals(existsSync(join(TEMPLATES_DIR_ABS, "index.html")), true);
    assertEquals(existsSync(join(STATIC_DIR_ABS, "index.css")), true);
  },
);

Deno.test(
  "`ssgo init` when a creator or template already exists should only create missing dirs",
  async () => {
    getTestEnv({ [CREATORS_DIR_BASE]: { "index.ts": "" } });
    await init();

    assertEquals(existsSync(CREATORS_DIR_ABS), true);
    assertEquals(existsSync(TEMPLATES_DIR_ABS), true);
    assertEquals(existsSync(COMPONENTS_DIR_ABS), true);
    assertEquals(existsSync(STATIC_DIR_ABS), true);

    assertEquals(existsSync(".gitignore"), true);
    assertEquals(existsSync(join(CREATORS_DIR_ABS, "index.ts")), true);
    assertEquals(existsSync(join(TEMPLATES_DIR_ABS, "index.html")), false);
    assertEquals(existsSync(join(STATIC_DIR_ABS, "index.css")), false);
  },
);
