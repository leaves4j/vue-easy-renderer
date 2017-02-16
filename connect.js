'use strict';

const path = require('path');

const rendererFactory = require('./lib/factory');

function vueEasyRenderer(basePath, options) {
  const errorHandler = e => console.error(e) || options.onError;
  const renderer = rendererFactory(basePath, options);

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