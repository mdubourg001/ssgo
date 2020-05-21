export default async (buildPage: Function) => {
  buildPage("index.html", {}, { filename: "index" });
};
