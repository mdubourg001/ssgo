export default `import type { BuildPage } from "https://deno.land/x/ssgo/mod.ts";

export default function (buildPage: BuildPage) {
  buildPage(
    "index.html",
    { title: "Hello from ssgo !" },
    {
      filename: "index.html",
      dir: "",
    }
  );
}
`;
