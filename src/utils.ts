import { IContextData } from "./types.ts";

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
