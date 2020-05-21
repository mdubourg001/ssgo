import markdownit from "https://cdn.pika.dev/@gerhobbelt/markdown-it@^10.0.0-30";
import startCase from "https://deno.land/x/lodash/startCase.js";
import {
  walkSync,
  readFileStrSync,
} from "https://deno.land/std@0.51.0/fs/mod.ts";

import { removeExt } from "../utils.ts";

export default async (buildPage: Function) => {
  const parser = markdownit("commonmark", {});

  const mdFiles = Array.from(await walkSync("md"));
  for (const md of mdFiles) {
    if (md.isFile) {
      const content = await readFileStrSync(md.path);
      const parsed = parser.render(content);

      const filename = removeExt(md.name);

      buildPage(
        "doc.html",
        {
          title: startCase(filename),
          content: parsed,
        },
        { filename, dir: "docs" },
      );
    }
  }
};
