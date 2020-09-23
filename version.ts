import { log } from "./src/utils.ts";

const VERSION = Deno.readTextFileSync("./VERSION");

function hasBumpFlag() {
  return (
    Deno.args.includes("patch") ||
    Deno.args.includes("minor") ||
    Deno.args.includes("major")
  );
}

function getNextVersionNumber(actualVersion: string): string | undefined {
  const [major, minor, patch] = actualVersion
    .split(".")
    .map((n) => parseInt(n, 10));

  if (Deno.args.includes("patch")) {
    return [major, minor, patch + 1].map((n) => n.toString()).join(".");
  } else if (Deno.args.includes("minor")) {
    return [major, minor + 1, 0].map((n) => n.toString()).join(".");
  } else if (Deno.args.includes("major")) {
    return [major + 1, 0, 0].map((n) => n.toString()).join(".");
  }
}

function bumpVersion() {
  const nextVersionNumber = getNextVersionNumber(VERSION) as string;

  Deno.writeTextFileSync("./VERSION", nextVersionNumber);
  log.success(`Version bumped from ${VERSION} to ${nextVersionNumber}`);
}

// can be ran as Deno script to bump version
if (hasBumpFlag()) bumpVersion();

// can be imported as a module to display version number
export default () => VERSION;
