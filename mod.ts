import type {
  IBuildPageOptions,
  IContextData,
  ISsgoBag as SsgoBag,
} from "./src/types.ts";

type BuildPage = (
  /**
   * The path of the template to use as page skeleton (relative to templates/ dir.)
   */
  template: string,
  /**
   * The contextual data used to build the page
   */
  data: IContextData,
  /**
   * Page build options
   */
  options: IBuildPageOptions,
) => void;

export type { BuildPage, SsgoBag };

export { buildTemplateToString } from "./src/lib.ts";
