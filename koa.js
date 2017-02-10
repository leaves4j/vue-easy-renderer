'use strict';

const path = require('path');
const rendererFactory = require('./lib/factory');

function vueEasyRenderer(basePath, options) {
  const renderer = rendererFactory(basePath, options);

  return (ctx, next) => {
    ctx.vueRender = (vueFilePath, context, config) => {
      ctx.set('Content-Type', 'text/html');
      const filePath = path.resolve(basePath, vueFilePath);
      const rendererFn = options.useStream ? renderer.renderToStream.bind(renderer) : renderer.renderToString.bind(renderer);
      return rendererFn(filePath, context, config).then(result => {
        ctx.body = result;
        return Promise.resolve();
      }).catch(e => {
        console.error('vueRenderError', e);
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