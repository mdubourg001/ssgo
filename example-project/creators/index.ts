// import { ISsgoBag } from "https://deno.land/x/ssgo/mod.ts";

// export default async (buildPage: Function, ssgoBag: ISsgoBag) => {
//   buildPage(
//     "others/about.html",
//     {},
//     { filename: "about", dir: "others/pouet" }
//   );

//   ssgoBag.watchFile("test.txt");
//   ssgoBag.watchDir("src");

//   const data = await new Promise((r) =>
//     setTimeout(
//       () =>
//         r({
//           title: "How I built a static site generator for Deno",
//           content: `<h1 if="true">{{ title }}</h1><h1 for="a" of="[1, 2]">{{ index }} - {{ a }}</h1>`,
//         }),
//       100
//     )
//   );

//   buildPage("index.html", data, { filename: "index" });

//   // @ts-ignore
//   ssgoBag.addStaticToBundle(".gitignore", "", false, true);
// };
