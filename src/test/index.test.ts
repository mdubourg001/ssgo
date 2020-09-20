import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";
import { resolve } from "https://deno.land/std@0.70.0/path/mod.ts";
import { existsSync } from "https://deno.land/std@0.70.0/fs/mod.ts";

import { DIST_DIR_ABS } from "../constants.ts";

import { build } from "../index.ts";
import { getTestEnv } from "./helpers.ts";

Deno.test("index", async () => {
  getTestEnv();
  await build(true);

  assertEquals(existsSync(DIST_DIR_ABS), true);
});
