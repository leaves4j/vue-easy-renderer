// @flow
import type { RendererOptionsParams, CompilerOptionParams, FactoryOptionParams } from '../type';

const path = require('path');
const MemoryFS = require('memory-fs');
const Compiler = require('../renderer/compiler');
const Renderer = require('../renderer/renderer');

const mfs = new MemoryFS();

const defaultOptions = {
  head: {},
  compilerConfig: {},
  preCompile: [],
  plugins: [],
  watch: false,
  outputPath: '/tmp/vue_ssr',
  global: Object.create(null),
};

/**
 * Get renderer
 *
 * @param {string} basePath
 * @param {Object} vOptions
 * @returns
 */
function rendererFactory(basePath: string, vOptions?: FactoryOptionParams): Renderer {
  const options = Object.assign({}, defaultOptions, vOptions);
  options.preCompile = options.preCompile.map(filePath => path.resolve(basePath, filePath));

  const compilerOptions: CompilerOptionParams = {
    config: options.compilerConfig,
    basePath: path.resolve(basePath),
    watch: options.watch,
    global: options.global,
    outputPath: options.outputPath,
  };
  const compiler = new Compiler(mfs, compilerOptions);

  const rendererOptions: RendererOptionsParams = {
    head: options.head,
    plugins: options.plugins,
    preCompile: options.preCompile,
    global: options.global,
  };
  const renderer = new Renderer(compiler, rendererOptions);

  return renderer;
}

module.exports = rendererFactory;
