import type { BuildPage } from "https://deno.land/x/ssgo/mod.ts"

export default async (buildPage: BuildPage) => {
  const versionRegex = /@v(?<version>.*)\//
  const url = await fetch("https://deno.land/x/ssgo/ssgo.ts").then(
    (response) => response.url
  )
  const matches = url.match(versionRegex)
  let version = undefined

  if (matches?.length && matches.length > 1) {
    version = matches[1] as string
  }

  buildPage("index.html", { currentVersion: version }, { filename: "index" })
}
