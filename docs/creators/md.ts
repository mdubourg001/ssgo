import { SsgoBag, BuildPage } from "https://deno.land/x/ssgo/mod.ts";
import markdownit from "https://cdn.skypack.dev/@gerhobbelt/markdown-it";
import { readFileStrSync } from "https://deno.land/std@0.61.0/fs/mod.ts";

import { DOCS } from "../src/constants.ts";

export default async (
  buildPage: BuildPage,
  { watchDir, addStaticToBundle }: SsgoBag
) => {
  watchDir("./md");
  watchDir("./src");

  addStaticToBundle("static/images/schema.png", "images", false, false);

  const parser = markdownit("commonmark", {});

  const sidebarEntries: Record<string, any> = {};
  for (const category of Object.keys(DOCS.categories)) {
    sidebarEntries[category] = DOCS.docs.filter(
      (doc: any) => doc.category === category
    );
  }

  for (const doc of DOCS.docs) {
    const content = await readFileStrSync(`md/${doc.md}`);
    const parsed = parser.render(content);

    buildPage(
      "doc.html",
      {
        title: doc.title,
        md: doc.md,
        content: parsed,
        sidebarEntries: sidebarEntries,
        isDocs: true,
        pageUrl: doc.path,
      },
      { filename: doc.path, dir: "docs" }
    );
  }
};
