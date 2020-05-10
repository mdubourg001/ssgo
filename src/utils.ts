import { IAttribute } from "https://cdn.pika.dev/html5parser@^1.1.0";
import { red, blue, yellow, green } from "https://deno.land/std/fmt/colors.ts";

import { INode, IContextData } from "./types.ts";

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
      log.error(`When trying to evaluate '${errorContext.trim()}'`);
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
