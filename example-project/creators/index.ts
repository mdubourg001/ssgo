export default async (buildPage: Function) => {
  buildPage("creators/templates/index.html", {}, { filename: "index" });
};
