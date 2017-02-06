'use strict';

const path = require('path');

const Compiler = require('./lib/compiler');
const Renderer = require('./lib/renderer');

function vueEasyRenderer(basePath, rendererConfig) {
  const head = (rendererConfig && rendererConfig.head) || {};
  const webpackConfig = (rendererConfig && rendererConfig.webpackConfig);
  const streamFlag = !(rendererConfig && rendererConfig.stream);
  const supportStore = rendererConfig && rendererConfig.store;
  const preCompile = (rendererConfig && rendererConfig.preCompile) || [];

  const compiler = new Compiler({webpackConfig});
  const renderer = new Renderer(compiler, {head, supportStore});
  return (req, res, next) => {
    res.vueRender = (vueFilePath, context, config) => {
      res.set('Content-Type', 'text/html');
      const filePath = path.resolve(basePath, vueFilePath);
      if (streamFlag) {
        renderer.renderToStream(filePath, context, config).then(stream => {
          stream.on('data', chunk => res.write(chunk));
          stream.on('end', () => res.end());
        }).catch(e => {
          console.error('vueRenderError', e);
        });
      } else {
        renderer.renderToString(filePath, context, config).then(result => {
          res.end(result);
        }).catch(e => {
          console.error('vueRenderError', e);
        });
      }
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