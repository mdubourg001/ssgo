import { IAttribute } from "https://cdn.pika.dev/html5parser@^1.1.0";

import { IContextData } from "./types.ts";

export function tapLog<T extends Array<any>>(...args: T): T {
  console.log(...args);
  return args;
}

/**
 * Check if a file is a script file (JS or TS)
 */
export function isScript(filename: string): boolean {
  return filename.endsWith(".ts") || filename.endsWith(".js");
}

/**
 * Evaluate the given expression in a given context
 */
export function contextEval(expression: string, context: IContextData) {
  // @ts-ignore
  for (const key of Object.keys(context)) window[key] = context[key];
  return eval(expression);
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
    return contextEval(match, data ?? {});
  });
}
