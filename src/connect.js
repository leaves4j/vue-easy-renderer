// @flow
import type { RenderOptions, VueEasyRendererOptionParams } from './type';

const path = require('path');
const rendererFactory = require('./renderer/factory');

const noop = () => { };

function vueEasyRenderer(basePath: string, VEROptions?: VueEasyRendererOptionParams) {
  const errorHandler = (e) => {
    e.name = `VueEasyRenderer: ${e.name}`;
    e.type = 'VueEasyRendererError';
    if (VEROptions && VEROptions.onError) {
      VEROptions.onError(e);
    } else {
      console.error(e); // eslint-disable-line no-console
    }
  };
  const readyHandler = (VEROptions && VEROptions.onReady) || noop;

  const renderer = rendererFactory(basePath, VEROptions);
  renderer.on('error', errorHandler);
  renderer.on('ready', readyHandler);

  return (req: Object, res: Object, next: Function): void => {
    const url: string = req.originalUrl;
    res.vueRender = (vueFilePath: string, state?: Object, options?: RenderOptions): Promise<void> => {
      res.set('Content-Type', 'text/html');
      const filePath = path.resolve(basePath, vueFilePath);
      const renderOptions = Object.assign({}, { url }, options);
      return renderer.renderToStream(filePath, state, renderOptions).then((stream) => {
        stream.on('data', chunk => res.write(chunk));
        stream.on('end', () => res.end());
      }).catch((e) => {
        e.component = vueFilePath;
        errorHandler(e);
        next(e);
      });
    };
    res.vueRenderToStream = (vueFilePath: string, state?: Object, options?: RenderOptions): Promise<stream$Readable> => {
      const filePath = path.resolve(basePath, vueFilePath);
      const renderOptions = Object.assign({}, { url }, options);
      return renderer.renderToStream(filePath, state, renderOptions);
    };
    res.vueRenderToString = (vueFilePath: string, state?: Object, options?: RenderOptions): Promise<string> => {
      const renderOptions = Object.assign({}, { url }, options);
      const filePath = path.resolve(basePath, vueFilePath);
      return renderer.renderToString(filePath, state, renderOptions);
    };
    return next();
  };
}

module.exports = vueEasyRenderer;
