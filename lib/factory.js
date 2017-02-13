'use strict';

const path = require('path');
const Compiler = require('./compiler');
const Renderer = require('./renderer');

const defaultOptions = {
  head: {},
  compilerConfig: undefined,
  store: undefined,
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
    useStore: options.store,
    plugins: options.plugins
  };
  const renderer = new Renderer(compiler, rendererOptions);

  options.preCompile.forEach(filePath => compiler.compile(path.resolve(basePath, filePath)));

  return renderer;
}

module.exports = rendererFactory;