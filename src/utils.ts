import { IAttribute } from "https://cdn.pika.dev/html5parser@^1.1.0";
import { red, blue, yellow, green } from "https://deno.land/std/fmt/colors.ts";
import { relative, basename } from "https://deno.land/std/path/mod.ts";

import { INode, IContextData, ICustomComponent } from "./types.ts";

export function tapLog<T extends Array<any>>(...args: T): T {
  console.log(...args);
  return args;
}

export const log = {
  info: (message: string) => {
    console.log(blue("info"), message);
  },
  error: (message: string, throwErr: boolean = false) => {
    if (throwErr) throw message;
    else console.log(red("error"), message);
  },
  warning: (message: string) => {
    console.log(yellow("warning"), message);
  },
  success: (message: string) => {
    console.log(green("success"), message);
  },
};

/**
 * Check if a file is a script file (JS or TS)
 */
export function isScript(filename: string): boolean {
  return filename.endsWith(".ts") || filename.endsWith(".js");
}

/**
 * Check if a file is a template file (HTML or HTM)
 */
export function isTemplate(filename: string): boolean {
  return filename.endsWith(".html") || filename.endsWith(".htm");
}

/**
 * Evaluate the given expression in a given context
 */
export function contextEval(
  expression: string,
  context: IContextData,
  errorContext?: string
) {
  try {
    // @ts-ignore
    for (const key of Object.keys(context)) window[key] = context[key];
    const evaluation = eval(expression);
    // @ts-ignore
    for (const key of Object.keys(context)) delete window[key];
    return evaluation;
  } catch (e) {
    if (typeof errorContext !== "undefined")
      log.error(`When trying to evaluate '${errorContext.trim()}'`, true);
    throw e;
  }
}

/**
 * Get attributes as a name="value" string
 */
export function formatAttributes(attributes: IAttribute[]) {
  let result = "";

  for (let attribute of attributes) {
    result += `${attribute.name.value}`;
    if (typeof attribute.value?.value !== "undefined")
      result += `="${attribute.value.value}" `;
  }

  return result;
}

/**
 * Handle interpolation of text with context data
 */
export function interpolate(templateStr: string, data?: IContextData) {
  // FIXME - This allow everything as long as the second char isn't a opening bracket ('{')
  return templateStr.replace(/{{\s*{{0,1}[^{]+\s*}}/g, (match) => {
    return contextEval(match, data ?? {}, templateStr);
  });
}

/**
 * Remove the extension from a file name
 */
export function removeExt(basename: string) {
  return basename.split(".").slice(0, -1).join(".");
}

/**
 * Tell if node is a comment node
 */
export function isComment(node: INode): boolean {
  return "rawName" in node && node.rawName === "!--";
}

/**
 * Remove a node from its parent
 */
export function removeFromParent(node: INode) {
  if (!!node.parent) {
    const parent = "body" in node.parent ? node.parent?.body : node.parent;
    const index = (parent as Array<INode>).findIndex((n) => n === node);

    if (index !== -1) (parent as Array<INode>).splice(index, 1);
  }
}

/**
 * Add a item next to another inside of parent
 */
export function pushNextTo<T>(array: T[], nextTo: T, ...items: T[]) {
  const index = array.findIndex((i) => i === nextTo);
  array.splice(index, 0, ...items);
}

// ----- errors ----- //

/**
 * Check unicity of top-level node
 */
export function checkTopLevelNodesCount(
  parsedTemplate: INode[],
  templateAbs: string
) {
  if (parsedTemplate.length > 1) {
    const templateRel = relative(Deno.cwd(), templateAbs);
    log.error(
      `When parsing '${templateRel}': A template/component file can't have more than one top-level node.`,
      true
    );
  }
}

/**
 * Check that a template has at least one node
 */
export function checkEmptyTemplate(
  parsedTemplate: INode[],
  templateAbs: string
) {
  if (parsedTemplate.length === 0) {
    const templateRel = relative(Deno.cwd(), templateAbs);
    log.warning(
      `When parsing '${templateRel}': This template/component file is empty.`
    );
  }
}

/**
 * Check if two components have the same name
 */
export function checkComponentNameUnicity(components: ICustomComponent[]) {
  for (let component of components) {
    if (
      components.some(
        (c) =>
          removeExt(c.name) === removeExt(component.name) &&
          c.path !== component.path
      )
    )
      log.error(
        `When listing custom components: Two components with the same name '${removeExt(
          component.name
        )}' found.`,
        true
      );
  }
}

/**
 * Check if component contains a recursive call
 */
export function checkRecursiveComponent(node: INode, componentName: string) {
  if ("name" in node && node.name === removeExt(componentName)) {
    log.error(
      `When parsing '${componentName}': Recursive call of component found.`,
      true
    );
  }

  if ("body" in node && !!node.body) {
    for (const childNode of node.body as INode[]) {
      checkRecursiveComponent(childNode, componentName);
    }
  }
}
