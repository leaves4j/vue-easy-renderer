'use strict';

const path = require('path');
const rendererFactory = require('./lib/factory');

const noop = () => {};

function vueEasyRenderer(basePath, options) {
  const errorHandler = options.onError || (e => console.error(e)); //eslint-disable-line no-console
  const readyHandler = options.onReady || noop;

  const renderer = rendererFactory(basePath, options);
  renderer.on('error', errorHandler);
  renderer.on('ready', readyHandler);

  return (req, res, next) => {
    res.vueRender = (vueFilePath, context, config) => {
      res.set('Content-Type', 'text/html');
      const filePath = path.resolve(basePath, vueFilePath);

      renderer.renderToStream(filePath, context, config).then(stream => {
        stream.on('data', chunk => res.write(chunk));
        stream.on('end', () => res.end());
      }).catch(errorHandler);
    };
    res.vueRenderToStream = (vueFilePath, context, config) => {
      const filePath = path.resolve(basePath, vueFilePath);
      return renderer.renderToStream(filePath, context, config);
    };
    res.vueRenderToString = (vueFilePath, context, config) => {
      const filePath = path.resolve(basePath, vueFilePath);
      return renderer.renderToString(filePath, context, config);
    };
    return next();
  };
}

module.exports = vueEasyRenderer;