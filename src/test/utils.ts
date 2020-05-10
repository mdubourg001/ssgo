import { parse } from "https://cdn.pika.dev/html5parser@^1.1.0";

import { buildHtml } from "../build.ts";
import { serialize } from "../ssgo.ts";
import { INode, IContextData } from "../types.ts";

export function buildHtmlAndSerialize(
  templateStr: string,
  data: IContextData
): string {
  const parsed = parse(templateStr).reverse();

  parsed.forEach((node: INode) => {
    node.parent = parsed;
    buildHtml(
      node,
      data,
      [],
      () => {},
      () => {}
    );
  });

  return parsed
    .reverse()
    .map((node: INode) => serialize(node).trim())
    .join("");
}
