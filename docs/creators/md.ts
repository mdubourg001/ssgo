import markdownit from "https://cdn.pika.dev/@gerhobbelt/markdown-it@^10.0.0-30";
import startCase from "https://deno.land/x/lodash/startCase.js";
import {
  walkSync,
  readFileStrSync,
} from "https://deno.land/std@0.51.0/fs/mod.ts";

import { removeExt } from "../src/utils.ts";
import { DOCS_ROOT } from "../src/constants.ts";
import { ISidebarEntry } from "../src/types.ts";

export default async (buildPage: Function) => {
  const parser = markdownit("commonmark", {});

  const mdFiles = Array.from(await walkSync("md"));
  const sidebarEntries: ISidebarEntry[] = mdFiles.map((md) => ({
    title: startCase(removeExt(md.name).split("-").join(" ")),
    href: `/${DOCS_ROOT}/${removeExt(md.name)}.html`,
  }));

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
          sidebarEntries: sidebarEntries,
        },
        { filename, dir: DOCS_ROOT },
      );
    }
  }
};
