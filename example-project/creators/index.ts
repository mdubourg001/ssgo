export default async (buildPage: Function, ssgoBag: any) => {
  buildPage("others/about.html", {}, { filename: "about" });

  ssgoBag.watchFile("test.txt");

  const data = await new Promise((r) =>
    setTimeout(
      () =>
        r({
          title: "How I built a static site generator for Deno",
        }),
      1000
    )
  );

  buildPage("index.html", data, { filename: "index" });
};
