import type { BuildPage } from "https://deno.land/x/ssgo/mod.ts"

import { IS_DEV_MODE } from "../src/constants.ts"

export default async (buildPage: BuildPage) => {
  buildPage("index.html", { isDevMode: IS_DEV_MODE }, { filename: "index" })
}
