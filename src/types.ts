import type { INode as IHTML5ParserNode } from "https://cdn.skypack.dev/html5parser"

// ----- internal ----- //

export type INode = IHTML5ParserNode & {
  parent?: INode | INode[]
  uuid?: string
  built?: boolean
}

export const IAttribute = {
  IF: "if",
  FOR: "for",
  OF: "of",
  EVAL: "eval:",
}

export interface IStaticFile {
  path: string
  isCompiled: boolean
}

export interface ICustomComponent {
  name: string
  path: string
}

export interface ITemplate {
  path: string
  customComponents: ICustomComponent[]
  staticFiles: IStaticFile[]
}

export interface IBuildPageCall
  extends Pick<IBuildPageParams, Exclude<keyof IBuildPageParams, "template">> {
  template: ITemplate
}

export interface ICreator {
  path: string
  buildPageCalls: IBuildPageCall[]
  otherWatchedFiles: string[]
  otherWatchedDirs: string[]
}

// ----- public ----- //

export interface IContextData extends Record<string, any> {}

export interface IBuildPageOptions {
  /**
   * The name of the page to create (with or without .html extension)
   */
  filename: string
  /**
   * The directory to put the created page in (relative to dist/ dir.)
   */
  dir?: string
}

export interface IBuildPageParams {
  /**
   * The path of the template to use as page skeleton (relative to templates/ dir.)
   */
  template: string
  /**
   * The contextual data used to build the page
   */
  data: IContextData
  /**
   * Page build options
   */
  options: IBuildPageOptions
}

export interface ISsgoBag {
  /**
   * Add a file to watcher. Whenever this file changes, the creator this
   * function is called from will be re-ran.
   * @param path - The path of the file to add to watcher, relative to the root of project
   */
  watchFile: (path: string) => void
  /**
   * Add a directory to watcher. Whenever a file inside of this directory
   * changes, the creator this function is called from will be re-ran.
   * @param path - The path of the dir to add to watcher, relative to the root of project
   */
  watchDir: (path: string) => void
  /**
   * Add a file to bundle's static files
   * @param path - The path of the file to add to bundle, relative to the root of project
   * @param bundleDest - The directories path to add the file to, relative to the bundle's static root (dist/static/)
   * @param compile - Wether or not the file should be compiled first (works for .jsx, .ts, .tsx)
   * @param override - Wether or not the file should override if already exists in bundle
   */
  addStaticToBundle: (
    path: string,
    bundleDest: string,
    compile?: boolean,
    override?: boolean
  ) => void
  /**
   * Log a message using internal ssgo logger
   */
  log: {
    /**
     * @param message - The message to log
     */
    info: (message: string) => void
    /**
     * @param message - The message to log
     */
    success: (message: string) => void
    /**
     * @param message - The message to log
     */
    warning: (message: string) => void
    /**
     * @param message - The message to log
     * @param throwErr - Should the program throw an error here
     */
    error: (message: string, throwErr: boolean) => void
  }
}
