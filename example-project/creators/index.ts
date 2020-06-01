import { ISsgoBag } from "https://denopkg.com/mdubourg001/ssgo/mod.ts";

export default async (buildPage: Function, ssgoBag: ISsgoBag) => {
  buildPage(
    "others/about.html",
    {},
    { filename: "about", dir: "others/pouet" },
  );

  ssgoBag.watchFile("test.txt");
  ssgoBag.watchDir("src");

  const data = await new Promise((r) =>
    setTimeout(
      () =>
        r({
          title: "How I built a static site generator for Deno",
        }),
      100,
    )
  );

  buildPage("index.html", data, { filename: "index" });

  // @ts-ignore
  ssgoBag.addStaticToBundle(".gitignore", "", false, true);
};
