'use strict';

const path = require('path');
const Compiler = require('./compiler');
const Renderer = require('./renderer');

const defaultOptions = {
  head: {},
  compilerConfig: undefined,
  store: undefined,
  preCompile: [],
  plugins: [],
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
  options.preCompile = options.preCompile.map(filePath => path.resolve(basePath, filePath));

  const compilerOptions = {
    config: options.compilerConfig,
    basePath: path.resolve(basePath),
    watch: options.watch
  };
  const compiler = new Compiler(removeUndefinedAttr(compilerOptions));

  const rendererOptions = {
    head: options.head,
    useStore: options.store,
    plugins: options.plugins,
    preCompile: options.preCompile,
    global: options.global
  };
  const renderer = new Renderer(compiler, removeUndefinedAttr(rendererOptions));

  return renderer;
}

function removeUndefinedAttr(object) {
  Object.keys(object).forEach(key => {
    if (object[key] === undefined) {
      delete object[key];
    }
  });
  return object;
}
module.exports = rendererFactory;