import cloneDeep from "https://deno.land/x/lodash/cloneDeep.js";
import { parse } from "https://cdn.pika.dev/html5parser@^1.1.0";

import { readFileStrSync } from "https://deno.land/std/fs/read_file_str.ts";

import {
  INode,
  IAttribute,
  IContextData,
  IStaticFoundEvent,
  ICustomComponent,
} from "./types.ts";
import {
  log,
  contextEval,
  interpolate,
  removeExt,
  isComment,
  removeFromParent,
  pushNextTo,
} from "./utils.ts";

/**
 * Handle the for/of attributes pair
 */
function computeForOf(
  node: INode,
  data: IContextData,
  availableComponents: ICustomComponent[],
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
      log.error(
        `When parsing "${node.open.value}" : The ${IAttribute.FOR} attribute must be given a value.`,
        true
      );
    else if (ofAttr && typeof ofAttr.value === "undefined")
      log.error(
        `When parsing "${node.open.value}" : The ${IAttribute.OF} attribute must be given a value.`,
        true
      );

    if (forAttr && !ofAttr)
      log.error(
        `The use of ${forAttr.name.value}="${forAttr.value?.value}" must be paired with the use of ${IAttribute.OF}="<iterable>".`,
        true
      );
    else if (ofAttr && !forAttr)
      log.error(
        `The use of ${ofAttr.name.value}="${ofAttr.value?.value}" must be paired with the use of ${IAttribute.FOR}="<iterator>".`,
        true
      );

    // ----- logic ----- //

    const evaluatedOf: Array<any> = contextEval(
      ofAttr?.value?.value ?? "",
      data,
      node.open.value
    );

    if (typeof evaluatedOf[Symbol.iterator] !== "function")
      log.error(
        `When parsing "${node.open.value}": "${ofAttr?.value?.value} is not an iterable.`,
        true
      );

    // remove the for/of attributes from node attributes
    node.attributes = node.attributes.filter(
      (attr) =>
        ![IAttribute.FOR.toString(), IAttribute.OF.toString()].includes(
          attr.name.value
        )
    );

    // @ts-ignore
    const parent = "body" in node.parent ? node.parent.body : node.parent;

    let index = evaluatedOf.length - 1;
    for (const item of evaluatedOf.reverse()) {
      const clone: INode = cloneDeep(node);
      clone.parent = node.parent;
      pushNextTo(parent as INode[], node, clone);

      buildHtml(
        clone,
        { ...data, index: index--, [forAttr?.value?.value ?? "item"]: item },
        availableComponents,
        onCustomComponentFound,
        onStaticFileFound
      );
    }

    // removing the node itself from its parent
    removeFromParent(node);
    return true;
  }

  return false;
}

/**
 * Handle the if attribute pair
 */
function computeIf(node: INode, data: IContextData): boolean {
  // ----- errors handling ----- //

  if ("attributes" in node) {
    const ifAttr = node.attributes.find(
      (attr) => attr.name.value === IAttribute.IF
    );

    if (!ifAttr) return true;

    if (ifAttr && typeof ifAttr.value === "undefined")
      log.error(
        `When parsing "${node.open.value}" : The ${IAttribute.IF} attribute must be given a value.`,
        true
      );

    // ----- logic ----- //

    const evaluatedIf: boolean = contextEval(
      ifAttr?.value?.value ?? "",
      data,
      node.open.value
    );

    if (!evaluatedIf && !!node.parent) {
      const parent = "body" in node.parent ? node.parent.body : node.parent;
      const index = (parent as Array<INode>).findIndex((n) => n === node);

      if (index !== -1) {
        // remove the node from parent's body
        (parent as Array<INode>).splice(index, 1);
      }

      return false;
    }

    // remove the if attribute from node attributes
    node.attributes = node.attributes.filter(
      (attr) => attr.name.value !== IAttribute.IF.toString()
    );
  }

  return true;
}

/**
 * Handle if node is a custom component
 */
function computeCustomComponents(
  node: INode,
  data: IContextData,
  availableComponents: ICustomComponent[],
  onCustomComponentFound: (event: IStaticFoundEvent) => void,
  onStaticFileFound: (event: IStaticFoundEvent) => void
) {
  if ("name" in node) {
    const component: ICustomComponent | undefined = availableComponents.find(
      (file) => removeExt(file.name) === node.name
    );
    if (!component) return;

    const props: IContextData = {};

    if ("attributes" in node) {
      for (const attr of node.attributes) {
        if (!Object.values(IAttribute).includes(attr.name.value))
          props[attr.name.value] = contextEval(
            attr.value?.value ?? "",
            data,
            node.open.value
          );
      }
    }

    const read = readFileStrSync(component.path, { encoding: "utf8" });
    const parsed = parse(read);

    parsed.forEach((componentNode: INode) => {
      componentNode.parent = parsed;
      buildHtml(
        componentNode,
        props,
        availableComponents,
        onCustomComponentFound,
        onStaticFileFound
      );
      componentNode.parent = node.parent;
    });

    if (!!node.parent) {
      const parent = "body" in node.parent ? node.parent.body : node.parent;
      const index = (parent as INode[]).findIndex((n) => n === node);

      if (index !== -1) {
        // add new built nodes next to node in parent's body
        (parent as Array<INode>).splice(index, 1, ...parsed);
      }
    }

    return true;
  }

  return false;
}

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
  availableComponents: ICustomComponent[],
  onCustomComponentFound: (event: IStaticFoundEvent) => void,
  onStaticFileFound: (event: IStaticFoundEvent) => void
) {
  // preventing double builds of nodes or build of comments
  if (node.built) return;
  if (isComment(node)) return;

  if (
    computeForOf(
      node,
      data,
      availableComponents,
      onCustomComponentFound,
      onStaticFileFound
    )
  ) {
    node.built = true;
    return;
  }
  if (!computeIf(node, data)) {
    node.built = true;
    return;
  }
  if (
    computeCustomComponents(
      node,
      data,
      availableComponents,
      onCustomComponentFound,
      onStaticFileFound
    )
  ) {
    node.built = true;
    return;
  }
  computeStaticFiles(node, data, onStaticFileFound);
  computeText(node, data);

  if ("body" in node && !!node.body) {
    for (const childNode of node.body.reverse() as INode[]) {
      (childNode as INode).parent = node;
      buildHtml(
        childNode,
        data,
        availableComponents,
        onCustomComponentFound,
        onStaticFileFound
      );
    }
    node.body.reverse();
  }

  node.built = true;
}
