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

  return (ctx, next) => {
    ctx.vueRender = (vueFilePath, context, config) => {
      ctx.set('Content-Type', 'text/html');
      const filePath = path.resolve(basePath, vueFilePath);

      return renderer.renderToStream(filePath, context, config).then(result => {
        ctx.body = result;
        return Promise.resolve();
      }).catch(e => {
        errorHandler(e);
        return Promise.resolve();
      });
    };
    ctx.vueRenderToStream = (vueFilePath, context, config) => {
      const filePath = path.resolve(basePath, vueFilePath);
      return renderer.renderToStream(filePath, context, config);
    };
    ctx.vueRenderToString = (vueFilePath, context, config) => {
      const filePath = path.resolve(basePath, vueFilePath);
      return renderer.renderToString(filePath, context, config);
    };
    return next();
  };
}

module.exports = vueEasyRenderer;