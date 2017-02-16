'use strict';

const path = require('path');
const rendererFactory = require('./lib/factory');

function vueEasyRenderer(basePath, options) {
  const errorHandler = e => console.error(e) || options.onError;
  const renderer = rendererFactory(basePath, options);

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