import type { BuildPage } from "https://deno.land/x/ssgo/mod.ts";

export default function (buildPage: BuildPage) {
  buildPage(
    "index.html",
    { title: "ssgo/alpine list", list: ["bananas", "carrots", "baguette"] },
    { filename: "index.html" },
  );
}
