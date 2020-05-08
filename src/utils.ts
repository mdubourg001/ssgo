import eqDeep from "https://deno.land/x/lodash/eqDeep.js";
import { IAttribute } from "https://cdn.pika.dev/html5parser@^1.1.0";

import { INode, IContextData } from "./types.ts";

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
 * Has for/of handling push node clones into parent's body, this allows it for root node
 */
export function mockParent(root: INode[]) {
  return {
    body: {
      push: (node: INode) => {
        const updated: INode[] = [];
        for (let i = root.length - 1; i >= 0; i--) {
          if (root[i].cloneId === node.cloneId) updated.push(node, root[i]);
          else updated.push(root[i]);
        }
        root = updated;
      },
      filter: root.filter,
    },
  };
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

console.log();
