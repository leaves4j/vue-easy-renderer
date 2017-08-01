// @flow
import typeof FileSystem from 'fs';
import type { Readable } from 'stream';

declare module 'webpack' {
  declare type Stats = {
    toJson(): Object,
    hasErrors(): boolean
  }
  declare class Compiler {
    outputFileSystem: FileSystem;
    watch(options: Object, callback: (error: Error, stats: Stats) => void): void;
    run(callback: (error: Error, stats: Stats) => void): void;
  }

  declare class DefinePlugin {
    constructor(option: { [key: string]: string }): void;
  }
  declare module.exports: {
    (options: Object): Compiler;
    DefinePlugin: Class<DefinePlugin>
  };
}

declare module 'serialize-javascript' {
  declare var exports: {
    (input: Object, options: { isJSON: boolean }): string
  }
}

declare module 'node-version' {
  declare module.exports: {
    original: string,
      short: string,
        long: string,
          major: string,
            minor: string,
              build: string
  }
}
declare module 'webpack-node-externals' {
  declare module.exports: {
    (): any
  }
}

declare module 'vue' {
  declare class Component {
    $options: Object;
    constructor(VueOptions: Object): void;
    static use(vuePlugin: Object): void;
    static mixin(options: Object): void;
  }
  declare module.exports: typeof Component;
}

declare module 'vue-server-renderer' {
  declare type RenderCallback = (err: Error | null, html: string) => void;
  declare class VueServerRenderer {
    renderToString(vm: Vue, context?: Object, callback: RenderCallback): string;
    renderToStream(vm: Vue, context?: Object): Readable;
  }
  declare module.exports :{
    createRenderer(option ?: Object): VueServerRenderer
  }
}

declare module 'vuex' {
  declare module.exports :{ }
}

declare module 'vue-router' {
  declare module.exports :{ }
}
