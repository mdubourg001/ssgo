import cloneDeep from "https://cdn.skypack.dev/lodash.clonedeep";
import { parse } from "https://cdn.skypack.dev/html5parser";

import {
  IAttribute,
  IContextData,
  ICustomComponent,
  IHTMLAttr,
  INode,
  IStaticFile,
} from "./types.ts";
import {
  checkStaticFileExists,
  checkStaticFileIsInsideStaticDir,
  contextEval,
  getStaticFileBundlePath,
  getStaticFileFromRel,
  getUnprefixedAttributeName,
  interpolate,
  isComment,
  isDevelopmentEnv,
  isExternalURL,
  log,
  pushBefore,
  removeExt,
  removeFromParent,
} from "./utils.ts";
import { CHILDREN_COMPONENT_PROP, POTENTIAL_STATIC_ATTR } from "./constants.ts";
import { serialize } from "./index.ts";

/**
 * Handle the for/of attributes pair
 */
function computeForOf(
  node: INode,
  data: IContextData,
  availableComponents: ICustomComponent[],
  onCustomComponentFound: (event: ICustomComponent) => void,
  onStaticFileFound: (staticFile: IStaticFile, destRel: string) => void,
  onBuildError?: (e: Error) => void,
) {
  // ----- errors handling ----- //

  if ("attributes" in node) {
    const forAttr = node.attributes.find(
      (attr: IHTMLAttr) => attr.name.value === IAttribute.FOR,
    );
    const ofAttr = node.attributes.find(
      (attr: IHTMLAttr) => attr.name.value === IAttribute.OF,
    );

    if (!forAttr && !ofAttr) return;

    if (forAttr && !forAttr.value?.value) {
      log.error(
        `When parsing "${node.open.value}" : The ${IAttribute.FOR} attribute must be given a value.`,
        true,
      );
    } else if (ofAttr && !ofAttr.value?.value) {
      log.error(
        `When parsing "${node.open.value}" : The ${IAttribute.OF} attribute must be given a value.`,
        true,
      );
    }

    if (forAttr && !ofAttr) {
      log.error(
        `The use of ${forAttr.name.value}="${forAttr.value
          ?.value}" must be paired with the use of ${IAttribute.OF}="<iterable>".`,
        true,
      );
    } else if (ofAttr && !forAttr) {
      log.error(
        `The use of ${ofAttr.name.value}="${ofAttr.value
          ?.value}" must be paired with the use of ${IAttribute.FOR}="<iterator>".`,
        true,
      );
    }

    // ----- logic ----- //

    const evaluatedOf: Array<any> = contextEval(
      ofAttr?.value?.value ?? "",
      data,
      node.open.value,
    );

    if (typeof evaluatedOf[Symbol.iterator] !== "function") {
      log.error(
        `When parsing "${node.open.value}": "${ofAttr?.value
          ?.value} is not an iterable.`,
        true,
      );
    }

    // remove the for/of attributes from node attributes
    node.attributes = node.attributes.filter(
      (attr: IHTMLAttr) =>
        ![IAttribute.FOR.toString(), IAttribute.OF.toString()].includes(
          attr.name.value,
        ),
    );

    // @ts-ignore
    const parent = "body" in node.parent ? node.parent.body : node.parent;

    let index = evaluatedOf.length - 1;
    for (const item of [...evaluatedOf].reverse()) {
      const clone: INode = cloneDeep(node);
      clone.parent = node.parent;
      pushBefore(parent as INode[], node, clone);

      buildHtml(
        clone,
        { ...data, index: index--, [forAttr?.value?.value ?? "item"]: item },
        availableComponents,
        onCustomComponentFound,
        onStaticFileFound,
        onBuildError,
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
      (attr: IHTMLAttr) => attr.name.value === IAttribute.IF,
    );

    if (!ifAttr) return true;

    if (ifAttr && typeof ifAttr.value === "undefined") {
      log.error(
        `When parsing "${node.open.value}" : The ${IAttribute.IF} attribute must be given a value.`,
        true,
      );
    }

    // ----- logic ----- //

    const evaluatedIf: boolean = contextEval(
      ifAttr?.value?.value ?? "",
      data,
      node.open.value,
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
      (attr: IHTMLAttr) => attr.name.value !== IAttribute.IF.toString(),
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
  onCustomComponentFound: (component: ICustomComponent) => void,
  onStaticFileFound: (staticFile: IStaticFile, destRel: string) => void,
  onBuildError?: (e: Error) => void,
) {
  if ("name" in node) {
    // checking if tag matched a component
    const component: ICustomComponent | undefined = availableComponents.find(
      (file) => removeExt(file.name) === node.name,
    );
    if (!component) return;

    // binding the component to the template using it
    onCustomComponentFound(component);

    const props: IContextData = {};

    // evaluating every attribute's value to pass as components props
    if ("attributes" in node) {
      for (const attr of node.attributes) {
        if (!Object.values(IAttribute).includes(attr.name.value)) {
          props[attr.name.value] = contextEval(
            attr.value?.value ?? "",
            data,
            node.open.value,
          );
        }
      }
    }

    // building nodes nested inside of component
    if ("body" in node && !!node.body) {
      for (const childNode of node.body.reverse() as INode[]) {
        childNode.parent = node;
        buildHtml(
          childNode,
          data,
          availableComponents,
          onCustomComponentFound,
          onStaticFileFound,
          onBuildError,
        );
      }
      node.body.reverse();

      // adding the serialized content as 'children' prop
      const serializedChildren: string = node.body.map(serialize).join("");
      props[CHILDREN_COMPONENT_PROP] = serializedChildren;
    }

    // reading and parsing the component file
    const read = Deno.readTextFileSync(component.path);
    const parsed = parse(read);

    // building the parsed component
    parsed.forEach((componentNode: INode) => {
      componentNode.parent = parsed;
      buildHtml(
        componentNode,
        props,
        availableComponents,
        onCustomComponentFound,
        onStaticFileFound,
        onBuildError,
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
 * Handle eval: prefixed attributes
 */
function computeEval(node: INode, data: IContextData) {
  if ("attributes" in node) {
    for (const attr of node.attributes) {
      if (attr.name.value.startsWith(IAttribute.EVAL)) {
        if (typeof attr.value?.value === "undefined") {
          return log.warning(
            `When parsing ${node.open.value}: ${attr.name.value} has been given no value to evaluate.`,
          );
        }

        attr.name.value = getUnprefixedAttributeName(attr);
        let evaluatedValue = contextEval(attr.value?.value || "", data);

        // special treatment for eval:class="{ foo: true, bar: false }"
        if (attr.name.value === "class" && typeof evaluatedValue === "object") {
          let value = "";
          for (const key of Object.keys(evaluatedValue)) {
            if (evaluatedValue[key]) value += `${key} `;
          }
          evaluatedValue = value.trim();
        }

        attr.value.value = evaluatedValue;
      }
    }
  }
}

/**
 * Handle resolving and bundling static files
 */
function computeStaticFiles(
  node: INode,
  onStaticFileFound: (staticFile: IStaticFile, destRel: string) => void,
) {
  if ("attributes" in node) {
    for (const attr of node.attributes) {
      if (POTENTIAL_STATIC_ATTR.includes(attr.name.value)) {
        if (node.name === "a" && attr.name.value === "href") continue;
        if (typeof attr.value?.value === "undefined") continue;
        if (isExternalURL(attr.value.value)) continue;

        const staticFile = getStaticFileFromRel(attr.value.value);

        if (!checkStaticFileExists(staticFile.path, attr.value.value)) continue;
        if (
          !checkStaticFileIsInsideStaticDir(staticFile.path, attr.value.value)
        ) {
          continue;
        }

        attr.value.value = getStaticFileBundlePath(attr.value.value);
        onStaticFileFound(staticFile, attr.value.value);
      }
    }
  }
}

/**
 * Handle interpolation of given text node
 */
function computeText(node: INode, data: IContextData): boolean {
  if (node.type === "Text") {
    node.value = interpolate(node.value, data);
    return true;
  }

  return false;
}

/**
 * Drive the node build, and recursively call on node's children
 */
export async function buildHtml(
  node: INode,
  data: IContextData,
  availableComponents: ICustomComponent[],
  onCustomComponentFound: (component: ICustomComponent) => void,
  onStaticFileFound: (staticFile: IStaticFile, destRel: string) => void,
  onBuildError?: (e: Error) => void,
) {
  // preventing double builds of nodes or build of comments
  if (node.built) return;
  if (isComment(node)) return;

  try {
    if (computeText(node, data)) {
      node.built = true;
      return;
    }
    if (
      computeForOf(
        node,
        data,
        availableComponents,
        onCustomComponentFound,
        onStaticFileFound,
        onBuildError,
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
        onStaticFileFound,
        onBuildError,
      )
    ) {
      node.built = true;
      return;
    }
    computeEval(node, data);
    computeStaticFiles(node, onStaticFileFound);
  } catch (e) {
    node.built = true;
    log.error(e);

    if (!isDevelopmentEnv()) {
      log.error("Project build failed.");
      Deno.exit();
    } else if (onBuildError) {
      onBuildError(e);
    }
  }

  if ("body" in node && !!node.body) {
    for (const childNode of node.body.reverse() as INode[]) {
      (childNode as INode).parent = node;
      buildHtml(
        childNode,
        data,
        availableComponents,
        onCustomComponentFound,
        onStaticFileFound,
        onBuildError,
      );
    }
    node.body.reverse();
  }

  node.built = true;
}
