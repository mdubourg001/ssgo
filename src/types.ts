import { INode as IHTML5ParserNode } from "https://cdn.pika.dev/html5parser@^1.1.0";

// ----- internal ----- //

export type INode = IHTML5ParserNode & {
  parent?: INode | INode[];
  uuid?: string;
  built?: boolean;
};

export const IAttribute = {
  IF: "if",
  FOR: "for",
  OF: "of",
  EVAL: "eval:",
};

export interface IStaticFile {
  path: string;
  isCompiled: boolean;
}

export interface ICustomComponent {
  name: string;
  path: string;
}

export interface ITemplate {
  path: string;
  customComponents: ICustomComponent[];
  staticFiles: IStaticFile[];
}

export interface IBuildPageCall
  extends Pick<IBuildPageParams, Exclude<keyof IBuildPageParams, "template">> {
  template: ITemplate;
}

export interface ICreator {
  path: string;
  buildPageCalls: IBuildPageCall[];
  otherWatchedFiles: string[];
  otherWatchedDirs: string[];
}

// ----- public ----- //

export interface IContextData extends Record<string, any> {}

export interface IBuildPageOptions {
  filename: string;
  dir?: string;
}

export interface IBuildPageParams {
  template: string;
  data: IContextData;
  options: IBuildPageOptions;
}

export interface ISsgoBag {
  /**
   * Add a file to watcher. Whenever this file changes, the creator this
   * function is called from will be re-ran.
   */
  watchFile: (path: string) => void;
  /**
   * Add a directory to watcher. Whenever a file inside of this directory
   * changes, the creator this function is called from will be re-ran.
   */
  watchDir: (path: string) => void;
}
