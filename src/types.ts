// ----- internal ----- //

export interface IStaticFile {
  name: string;
  isCompiled: boolean;
}

export interface ICustomComponent {
  name: string;
}

export interface ITemplate {
  name: string;
  customComponents: ICustomComponent[];
  staticFiles: IStaticFile[];
}

export interface IBuildPageCall
  extends Pick<IBuildPageParams, Exclude<keyof IBuildPageParams, "template">> {
  template: ITemplate;
}

export interface ICreator {
  name: string;
  pageBuildCalls: IBuildPageCall[];
}

export interface IStaticFoundEvent {
  staticAbs: string;
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
