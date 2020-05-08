import { walkSync } from "https://deno.land/std/fs/walk.ts";
import { existsSync } from "https://deno.land/std/fs/exists.ts";

import { CREATORS_DIR_ABS } from "./constants.ts";
import {
  ICreator,
  IContextData,
  IBuildPageOptions,
  IBuildPageParams,
  IBuildPageCall,
} from "./types.ts";
import { isScript } from "./utils.ts";

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
 * Parse the templates
 */
function parse() {}

/**
 * Bind templates to the custom-components and static files they use
 */
function bindTemplateToStatic() {}

/**
 * Do the expressions evaluation work
 */
function evaluate() {}

/**
 * Serialize back to HTML files
 */
function serialize() {}

// ----- internals ----- //

/**
 * Function given to creators as first param
 */
function buildPage(
  templateAbs: string,
  data: IContextData,
  options: IBuildPageOptions
) {}

/**
 * Build the project
 */
export async function build() {
  const creators = walkSync(CREATORS_DIR_ABS);

  for (let creator of creators) {
    if (isScript(creator.name)) {
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
        buildPage(templateAbs, data, options);
      });
    }
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
