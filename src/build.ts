import { v4 } from "https://deno.land/std/uuid/mod.ts";
import cloneDeep from "https://deno.land/x/lodash/cloneDeep.js";

import { INode, IAttribute, IContextData, IStaticFoundEvent } from "./types.ts";
import { contextEval, interpolate } from "./utils.ts";

const alreadyBuilt: INode[] = [];

/**
 * Handle the for/of attributes pair
 */
function computeForOf(
  node: INode,
  data: IContextData,
  onCustomComponentFound: (event: IStaticFoundEvent) => void,
  onStaticFileFound: (event: IStaticFoundEvent) => void
) {
  // ----- errors handling ----- //

  if ("attributes" in node) {
    const forAttr = node.attributes.find(
      (attr) => attr.name.value === IAttribute.FOR
    );
    const ofAttr = node.attributes.find(
      (attr) => attr.name.value === IAttribute.OF
    );

    if (!forAttr && !ofAttr) return;

    if (forAttr && typeof forAttr.value === "undefined")
      throw new Error(
        `When parsing "${node.open.value}" : The ${IAttribute.FOR} attribute must be given a value.`
      );
    else if (ofAttr && typeof ofAttr.value === "undefined")
      throw new Error(
        `When parsing "${node.open.value}" : The ${IAttribute.OF} attribute must be given a value.`
      );

    if (forAttr && !ofAttr)
      throw new Error(
        `The use of ${forAttr.name.value}="${forAttr.value?.value}" must be paired with the use of ${IAttribute.OF}="<iterable>".`
      );
    else if (ofAttr && !forAttr)
      throw new Error(
        `The use of ${ofAttr.name.value}="${ofAttr.value?.value}" must be paired with the use of ${IAttribute.FOR}="<iterator>".`
      );

    // ----- logic ----- //

    const evaluatedOf: Array<any> = contextEval(
      ofAttr?.value?.value ?? "",
      data
    );

    if (typeof evaluatedOf[Symbol.iterator] !== "function")
      throw new Error(
        `When parsing "${node.open.value}": "${ofAttr?.value?.value} is not an iterable.`
      );

    // remove the for/of attributes from node attributes
    node.attributes = node.attributes.filter(
      (attr) =>
        ![IAttribute.FOR.toString(), IAttribute.OF.toString()].includes(
          attr.name.value
        )
    );

    // generating a unique uuid for all clones
    node.cloneId = v4.generate();
    const clones: INode[] = [];

    let index = 0;
    for (const item of evaluatedOf) {
      const clone: INode = cloneDeep(node);
      clones.push(clone);

      buildHtml(
        clone,
        { ...data, index: index++, [forAttr?.value?.value ?? "item"]: item },
        onCustomComponentFound,
        onStaticFileFound
      );

      if (!!node.parent && "body" in node.parent) {
        clone.parent = node.parent;
      }
    }

    if (!!node.parent) {
      const parent = "body" in node.parent ? node.parent.body : node.parent;
      const index = (parent as Array<INode>)
        .map((item) => item.cloneId)
        .lastIndexOf(node.cloneId ?? "");

      if (index !== -1) {
        // add clones next to node in parent's body
        // remove the node itself from parent's body
        (parent as Array<INode>).splice(index, 1, ...clones);
      }
    }
  }
}

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
function computeText(node: INode, data: IContextData) {
  if (node.type === "Text") {
    node.value = interpolate(node.value, data);
  }
}

/**
 * Drive the node build, and recursively call on node's children
 */
export function buildHtml(
  node: INode,
  data: IContextData,
  onCustomComponentFound: (event: IStaticFoundEvent) => void,
  onStaticFileFound: (event: IStaticFoundEvent) => void
) {
  // preventing double builds of nodes
  if (alreadyBuilt.includes(node)) return;

  computeForOf(node, data, onCustomComponentFound, onStaticFileFound);
  computeIf(node, data);
  computeCustomComponents(node, data, onCustomComponentFound);
  computeStaticFiles(node, data, onStaticFileFound);
  computeText(node, data);

  if ("body" in node) {
    for (const childNode of node.body || []) {
      (childNode as INode).parent = node;
      buildHtml(childNode, data, onCustomComponentFound, onStaticFileFound);
    }
  }

  alreadyBuilt.push(node);
}
