export default `import { BuildPage } from "https://deno.land/x/ssgo/mod.ts";

export default function (buildPage: BuildPage) {
  buildPage(
    "index.html",
    { title: "Hello, ssgo !" },
    {
      filename: "index.html",
      dir: "",
    }
  );
}
`;
