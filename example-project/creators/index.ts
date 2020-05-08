export default async (buildPage: Function) => {
  const data = {
    title: "How I built a static site generator for Deno",
  };

  buildPage("creators/templates/index.html", data, { filename: "index" });
};
