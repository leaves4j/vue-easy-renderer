// @flow
import typeof FileSystem from 'fs';
import type { ICompiler, CompilerOptions, CompilerOptionParams } from '../type';

const path = require('path');
const vm = require('vm');
const webpack = require('webpack');
const nodeVersion = require('node-version');
const nodeExternals = require('webpack-node-externals');
const webpackMerge = require('webpack-merge');

const cacheMap: Map<string, any> = new Map();
const compilingWaitingQueueMap: Map<string, Array<{
  resolve: (result: any) => void,
  reject: (e: any) => void
}>> = new Map();

const defaultOptions: CompilerOptions = {
  basePath: __dirname,
  watch: false,
  global: Object.create(null),
  config: Object.create(null),
  outputPath: '/tmp/vue_ssr',
};

/**
 * Compiler Class
 * 
 * @class Compiler
 * @implements {ICompiler}
 */
class Compiler implements ICompiler {
  static cacheMap: Map<string, any>;
  fs: FileSystem;
  options: CompilerOptions;
  constructor(fs: FileSystem, options?: CompilerOptionParams) {
    this.options = Object.assign({}, defaultOptions, options);
    this.fs = fs;
    delete this.options.config.output;
  }

  /**
   * dynamic import
   * e.g.
   * const component = await compiler.import('component.vue');
   * 
   * @param {string} request 
   * @returns {Promise<any>} 
   * @memberof Compiler
   */
  import(request: string): Promise<any> {
    if (Compiler.cacheMap.has(request)) {
      return Promise.resolve(Compiler.cacheMap.get(request));
    }
    const compilingWaitingQueue = compilingWaitingQueueMap.get(request);
    if (compilingWaitingQueue) {
      return new Promise((resolve, reject) => compilingWaitingQueue.push({ resolve, reject }));
    }

    const resultPromise = new Promise((resolve, reject) =>
      compilingWaitingQueueMap.set(request, [{ resolve, reject }]));
    return this.load([request]).then(() => resultPromise);
  }

  /**
   * compile file
   * 
   * @param {Array<string>} filePaths 
   * @returns {Promise<void>} 
   * @memberof Compiler
   */
  compile(filePaths: Array<string>) {
    const fileMap: Map<string, string> = new Map();
    filePaths.forEach((filePath) => {
      fileMap.set(Compiler.getFileNameByPath(filePath), filePath);
    });
    const webpackConfig = this.getConfig(fileMap);
    const serverCompiler = webpack(webpackConfig);
    serverCompiler.outputFileSystem = this.fs;
    const runner = this.options.watch
      ? cb => serverCompiler.watch({}, cb)
      : cb => serverCompiler.run(cb);
    return new Promise((resolve, reject) => {
      runner((error, stats) => {
        if (error) {
          reject(error);
          return;
        }

        const info = stats.toJson();
        if (stats.hasErrors()) {
          reject(info.errors);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * load file into cache
   * 
   * @param {Array<string>} filePaths 
   * @returns {Promise<void>} 
   * @memberof Compiler
   */
  load(filePaths: Array<string>): Promise<void> {
    if (filePaths.length === 0) return Promise.resolve();
    filePaths.forEach((filePath) => {
      if (!compilingWaitingQueueMap.has(filePath)) {
        compilingWaitingQueueMap.set(filePath, []);
      }
    });

    return this.compile(filePaths).then(() => Promise.all(filePaths.map(filePath =>
      new Promise((resolve, reject) => {
        const fileName = Compiler.getFileNameByPath(filePath);
        this.fs.readFile(path.normalize(`${this.options.outputPath}/${fileName}.js`), (error, data) => {
          const compilingWaitingQueue = compilingWaitingQueueMap.get(filePath);
          if (error) {
            if (compilingWaitingQueue) {
              compilingWaitingQueue.forEach(callback => callback.reject(error));
            }
            reject(error);
            return;
          }

          const object = this.getObject(data.toString());
          Compiler.cacheMap.set(filePath, object);
          if (compilingWaitingQueue) {
            compilingWaitingQueue.forEach(callback => callback.resolve(object));
          }
          compilingWaitingQueueMap.delete(filePath);
          resolve();
        });
      }))).then());
  }

  /**
   * 
   * @param {string} sourceFile 
   * @returns {*} 
   * @memberof Compiler
   */
  getObject(sourceFile: string): any {
    const sandboxGlobal = Object.assign({}, global, { module, require }, this.options.global);
    const sandbox = vm.createContext(sandboxGlobal);
    return vm.runInContext(sourceFile, sandbox);
  }

  /**
   * get webpack config
   * 
   * @param {Map<string, string>} fileMap 
   * @returns {Object} 
   * @memberof Compiler
   */
  getConfig(fileMap: Map<string, string>): Object {
    const entry: { [fileName: string]: Array<string> } = Object.create(null);
    [...fileMap.entries()].forEach(([fileName, filePath]) => {
      entry[fileName] = [filePath];
    });
    const defaultConfig = {
      entry,
      target: 'node',
      output: {
        path: this.options.outputPath,
        filename: '[name].js',
        libraryTarget: 'commonjs2',
      },
      module: {
        rules: [{
          test: /\.vue$/,
          use: {
            loader: 'vue-loader',
            options: {
              loaders: {
                js: {
                  loader: 'babel-loader',
                  options: {
                    presets: [
                      ['env', { targets: { node: Number(nodeVersion.major) } }],
                    ],
                    plugins: ['transform-object-rest-spread'],
                    babelrc: false,
                  },
                },
                css: 'null-loader',
                sass: 'null-loader',
                scss: 'null-loader',
                less: 'null-loader',
              },
            },
          },
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', { targets: { node: Number(nodeVersion.major) } }],
              ],
              plugins: ['transform-object-rest-spread'],
              babelrc: false,
            },
          },
        },
        {
          test: /\.css$|\.scss|\.sass|\.less$/,
          use: {
            loader: 'null-loader',
          },
        }],
      },
      externals: [nodeExternals()],
      context: this.options.basePath,
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
          'process.env.VUE_ENV': '"server"',
        }),
      ],
    };

    return webpackMerge(defaultConfig, this.options.config);
  }
  /**
   * get file name by path
   * 
   * @static
   * @param {string} filePath 
   * @returns {string} 
   * @memberof Compiler
   */
  static getFileNameByPath(filePath: string): string {
    const pathHexStr: string = (new Buffer(filePath)).toString('hex');
    return `${path.basename(filePath)}.${pathHexStr}`;
  }
}

Compiler.cacheMap = cacheMap;

module.exports = Compiler;
