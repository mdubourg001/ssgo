import type { BuildPage } from "https://deno.land/x/ssgo@v0.12.6/mod.ts";

export default async (buildPage: BuildPage) => {
  buildPage("index.html", {}, { filename: "index" });
};
