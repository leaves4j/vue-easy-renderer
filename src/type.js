// @flow
import typeof FileSystem from 'fs';

export type CompilerOptions = {
  config: Object,
  basePath: string,
  watch: boolean,
  global: Object,
  outputPath: string
};

export type CompilerOptionParams = {
  config?: Object,
  basePath?: string,
  watch?: boolean,
  global?: Object,
  outputPath?: string
};

export interface ICompiler {
  constructor(fs: FileSystem, compilerOptions: CompilerOptionParams): void;
  import(request: string): Promise<any>;
  load(requests: Array<string>): Promise<void>;
}

export type RendererOptions = {
  head: Object,
  plugins: Array<string | Object>,
  preCompile: Array<string>,
  global: Object
};

export type RendererOptionParams = {
  head?: Object,
  plugins?: Array<string | Object>,
  preCompile?: Array<string>,
  global?: Object
};

export type RendererContext = {
  state: Object,
  url: string
}

export type RenderOptions = {
  url: string,
  pure: boolean
}

export interface IRenderer {
  constructor(compiler: ICompiler, options: RendererOptionParams): void;
  renderToStream(path: string, state: Object, options: RenderOptions): Promise<stream$Readable>;
  renderToString(path: string, state: Object, options: RenderOptions): Promise<string>;
}

export type FactoryOptionParams = {
  head?: Object,
  compilerConfig?: Object,
  preCompile?: Array<string>,
  plugins?: Array<string | Object>,
  watch?: boolean,
  outputPath?: string,
  global?: Object,
}

export type VueEasyRendererOptionParams = {
  head?: Object,
  compilerConfig?: Object,
  preCompile?: Array<string>,
  plugins?: Array<string | Object>,
  watch?: boolean,
  outputPath?: string,
  global?: Object,
  onReady: () => void,
  onError: (e: Object) => void
}

