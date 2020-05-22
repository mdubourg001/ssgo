import markdownit from "https://cdn.pika.dev/@gerhobbelt/markdown-it@^10.0.0-30";
import {
  readFileStrSync,
} from "https://deno.land/std@0.51.0/fs/mod.ts";

import { DOCS } from "../src/constants.ts";

export default async (buildPage: Function) => {
  const parser = markdownit("commonmark", {});

  const sidebarEntries: Record<string, any> = {};
  for (const category of Object.keys(DOCS.categories)) {
    sidebarEntries[category] = DOCS.docs.filter((doc: any) =>
      doc.category === category
    );
  }

  for (const doc of DOCS.docs) {
    const content = await readFileStrSync(`md/${doc.md}`);
    const parsed = parser.render(content);

    buildPage(
      "doc.html",
      {
        title: doc.title,
        content: parsed,
        sidebarEntries: sidebarEntries,
        isDocs: true,
      },
      { filename: doc.path, dir: "docs" },
    );
  }
};
