import type { BuildPage } from "https://deno.land/x/ssgo/mod.ts"

export default async (buildPage: BuildPage) => {
  buildPage("index.html", {}, { filename: "index" })
}
