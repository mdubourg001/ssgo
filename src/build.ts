import { INode } from "https://cdn.pika.dev/html5parser@^1.1.0";

import { IContextData, IStaticFoundEvent } from "./types.ts";

/**
 * Handle the for/of attributes pair
 */
function computeForOf(node: INode, data: IContextData) {}

/**
 * Handle the if attribute pair
 */
function computeIf(node: INode, data: IContextData): boolean {
  return true;
}

/**
 * Handle if node is a custom component
 */
function computeCustomComponents(
  node: INode,
  data: IContextData,
  onCustomComponentFound: (event: IStaticFoundEvent) => void
) {}

/**
 * Handle resolving and bundling static files
 */
function computeStaticFiles(
  node: INode,
  data: IContextData,
  onStaticFileFound: (event: IStaticFoundEvent) => void
) {}

/**
 * Handle interpolation of given text node
 */
function computeText(node: INode, data: IContextData) {}

/**
 * Drive the node build, and recursively call on node's children
 */
export function buildHtml(
  node: INode,
  data: IContextData,
  onCustomComponentFound: (event: IStaticFoundEvent) => void,
  onStaticFileFound: (event: IStaticFoundEvent) => void
) {
  computeForOf(node, data);
  computeIf(node, data);
  computeCustomComponents(node, data, onCustomComponentFound);
  computeStaticFiles(node, data, onStaticFileFound);
  computeText(node, data);

  if ("body" in node) {
    for (const childNode of node.body || []) {
      buildHtml(childNode, data, onCustomComponentFound, onStaticFileFound);
    }
  }
}
