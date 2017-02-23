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
  onError: e => console.error(e)
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
    basePath: path.resolve(basePath),
    onError: options.onError,
    watch: options.watch
  };
  const compiler = new Compiler(removeUndefinedAttr(compilerOptions));

  const rendererOptions = {
    head: options.head,
    useStore: options.store,
    plugins: options.plugins,
    onError: options.onError
  };
  const renderer = new Renderer(compiler, removeUndefinedAttr(rendererOptions));

  options.preCompile.forEach(filePath => compiler.compile(path.resolve(basePath, filePath)).catch(options.onError));

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