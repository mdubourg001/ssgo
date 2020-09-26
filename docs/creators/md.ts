import type {
  SsgoBag,
  BuildPage,
} from "https://deno.land/x/ssgo/mod.ts";
import markdownit from "https://cdn.skypack.dev/@gerhobbelt/markdown-it";
import parseMarkdown from "https://cdn.skypack.dev/parse-md";
import _ from "https://cdn.skypack.dev/lodash";
import { walkSync } from "https://deno.land/std@0.70.0/fs/mod.ts";

// memoizing some work to prevent reading / parsing the same file twice
const readFile = _.memoize(Deno.readTextFileSync);
const parseMD = _.memoize(parseMarkdown);

export default async (
  buildPage: BuildPage,
  { watchDir, addStaticToBundle }: SsgoBag,
) => {
  // having this creator to re-run when a file inside of md/ or /src changes
  watchDir("./md");
  watchDir("./src");

  // adding an image needed by a markdown file to the dist/ dir
  addStaticToBundle("static/images/schema.png", "images", false, false);

  const parser = markdownit("commonmark", {});

  const mdFiles = Array.from(walkSync("md"));
  let sidebarEntries: Record<string, any> = {};

  // building sidebar entries from markdown metadatas
  for (const doc of mdFiles) {
    if (doc.isFile) {
      const file = await readFile(doc.path);
      const { metadata } = parseMD(file);

      if (!metadata.title || !metadata.path) continue;

      const entry = {
        weight: metadata.weight,
        path: `${metadata.path}.html`,
        title: metadata.title,
      };

      if (!metadata.category) {
        metadata.category = "None";
      }

      sidebarEntries = {
        ...sidebarEntries,
        [metadata.category]: sidebarEntries[metadata.category]
          ? [...sidebarEntries[metadata.category], entry]
          : [entry],
      };
    }
  }

  // building the pages
  for (const doc of mdFiles) {
    if (doc.isFile) {
      const file = await readFile(doc.path);
      const { metadata, content } = parseMD(file);
      const parsed = parser.render(content);

      if (metadata.title && metadata.path) {
        buildPage(
          "doc.html",
          {
            title: metadata.title,
            description: metadata.description,
            md: doc.path.replace("md/", ""),
            content: parsed,
            sidebarEntries: sidebarEntries,
            isDocs: true,
            pageUrl: metadata.path,
            sortCategories: (a: string, b: string): number => {
              const ordering: Record<string, number> = {
                None: 0,
                Templates: 1,
                Creators: 2,
                Components: 3,
                Guides: 4,
              };
              if (a in ordering && b in ordering) {
                return ordering[a] - ordering[b];
              } else return Infinity;
            },
          },
          { filename: metadata.path, dir: "docs" },
        );
      }
    }
  }
};
