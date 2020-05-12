export default async (buildPage: Function) => {
  buildPage("creators/templates/about.html", {}, { filename: "about" });

  const data = await new Promise((r) =>
    setTimeout(
      () =>
        r({
          title: "How I built a static site generator for Deno",
        }),
      1000
    )
  );

  buildPage("creators/templates/index.html", data, { filename: "index" });
};
