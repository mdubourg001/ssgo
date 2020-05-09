import { parse } from "https://cdn.pika.dev/html5parser@^1.1.0";

import { walkSync } from "https://deno.land/std/fs/walk.ts";
import { existsSync } from "https://deno.land/std/fs/exists.ts";
import { writeFileStrSync } from "https://deno.land/std/fs/write_file_str.ts";
import { readFileStrSync } from "https://deno.land/std/fs/read_file_str.ts";

import { CREATORS_DIR_ABS, COMPONENTS_DIR_ABS } from "./constants.ts";
import {
  INode,
  ICreator,
  ICustomComponent,
  IContextData,
  IBuildPageOptions,
  IBuildPageParams,
  IBuildPageCall,
} from "./types.ts";
import { isScript, isTemplate, formatAttributes, isComment } from "./utils.ts";
import { buildHtml } from "./build.ts";

// ----- globals ----- //

let projectMap: ICreator[] = [];

// ----- build misc. ----- //

/**
 * Cache a call to buildPage
 */
function cacheBuildPageCall(
  creatorAbs: string,
  { template: templateAbs, data, options }: IBuildPageParams
) {
  if (!existsSync(templateAbs))
    throw new Error(`Can't find given template: ${templateAbs}`);

  const pageBuildCall: IBuildPageCall = {
    template: {
      name: templateAbs,
      customComponents: [],
      staticFiles: [],
    },
    data,
    options,
  };
  const creatorEntry: ICreator = {
    name: creatorAbs,
    pageBuildCalls: [pageBuildCall],
  };

  const existingEntry: ICreator | undefined = projectMap.find(
    ({ name }) => name === creatorAbs
  );
  if (!!existingEntry) existingEntry.pageBuildCalls.push(pageBuildCall);
  else projectMap.push(creatorEntry);
}

/**
 * Bind templates to the custom-components and static files they use
 */
function bindTemplateToStatic() {}

/**
 * Serialize back to HTML files
 */
function serialize(node: INode) {
  let result = "";

  if (isComment(node)) {
    return "";
  } else if (node.type === "Text") {
    result += node.value;
  } else if (node.type === "Tag") {
    result += `<${node.rawName} ${formatAttributes(node.attributes)}`;
    if (node.close === null) return result + "/>";
    else result += ">";

    for (let child of node.body || []) result += serialize(child);

    result += node.close?.value;
  }

  return result;
}

// ----- internals ----- //

/**
 * Build a given template with given data and write the file to fs
 * Function given to creators as first param
 */
function buildPage(
  templateAbs: string,
  data: IContextData,
  options: IBuildPageOptions,
  availableComponents: ICustomComponent[]
) {
  const read = readFileStrSync(templateAbs, { encoding: "utf8" });
  const parsed = parse(read).reverse();

  parsed.forEach((node: INode) => {
    node.parent = parsed;
    buildHtml(
      node,
      data,
      availableComponents,
      () => {},
      () => {}
    );
  });

  const serialized = parsed
    .reverse()
    .map((node: INode) => serialize(node))
    .join("");

  console.log(serialized);
}

/**
 * Build the project
 */
export async function build() {
  const creators = Array.from(walkSync(CREATORS_DIR_ABS)).filter((file) =>
    isScript(file.name)
  );
  const components = Array.from(walkSync(COMPONENTS_DIR_ABS)).filter((file) =>
    isTemplate(file.name)
  );

  for (let creator of creators) {
    const module = await import(creator.path);
    // as every valid creator should export a default function
    if (!module.default || typeof module.default !== "function") continue;

    module.default(function (
      template: string,
      data: IContextData,
      options: IBuildPageOptions
    ): void {
      const templateAbs = `${Deno.cwd()}/${template}`;
      // caching the call to buildPage on the fly
      cacheBuildPageCall(creator.path, {
        template: templateAbs,
        data,
        options,
      });
      buildPage(templateAbs, data, options, components);
    });
  }
}

/**
 * Watch project files for change
 */
export function watch() {}

/**
 * Serve the bundle locally
 */
export function serve() {}
