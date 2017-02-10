'use strict';

const path = require('path');

const rendererFactory = require('./lib/factory');

function vueEasyRenderer(basePath, options) {
  const renderer = rendererFactory(basePath, options);

  return (req, res, next) => {
    res.vueRender = (vueFilePath, context, config) => {
      res.set('Content-Type', 'text/html');
      const filePath = path.resolve(basePath, vueFilePath);
      if (options.useStream) {
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