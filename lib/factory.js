'use strict';

const path = require('path');
const Compiler = require('./compiler');
const Renderer = require('./renderer');

const defaultOptions = {
  head: {},
  compilerConfig: undefined,
  useStream: false,
  useStore: undefined,
  preCompile: [],
  plugins: []
};

/**
 * Get renderer
 *
 * @param {string} basePath
 * @param {Object} vOptions
 * @returns
 */
function rendererFactory(basePath, vOptions) {
  const options = Object.assign(defaultOptions, vOptions);

  const compilerOptions = {
    config: options.compilerConfig,
    basePath: path.resolve(basePath)
  };
  const compiler = new Compiler(compilerOptions);

  const rendererOptions = {
    head: options.head,
    useStore: options.useStore,
    plugins: options.plugins
  };
  const renderer = new Renderer(compiler, rendererOptions);

  options.preCompile.forEach(filePath => compiler.compile(path.resolve(basePath, filePath)));

  return renderer;
}

module.exports = rendererFactory;