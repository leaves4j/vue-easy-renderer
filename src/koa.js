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

  return (ctx: Object, next: Function) => {
    const url: string = ctx.originalUrl;
    ctx.vueRender = (vueFilePath: string, state?: Object, options?: RenderOptions): Promise<any> => {
      ctx.set('Content-Type', 'text/html');
      const filePath = path.resolve(basePath, vueFilePath);
      const renderOptions = Object.assign({}, { url }, options);

      return renderer.renderToStream(filePath, state, renderOptions).then((result) => {
        ctx.body = result;
      }).catch((e) => {
        e.component = vueFilePath;
        errorHandler(e);
        return Promise.reject(e);
      });
    };
    ctx.vueRenderToStream = (vueFilePath: string, state?: Object, options?: RenderOptions): Promise<stream$Readable> => {
      const filePath = path.resolve(basePath, vueFilePath);
      const renderOptions = Object.assign({}, { url }, options);
      return renderer.renderToStream(filePath, state, renderOptions);
    };
    ctx.vueRenderToString = (vueFilePath: string, state?: Object, options?: RenderOptions): Promise<string> => {
      const renderOptions = Object.assign({}, { url }, options);
      const filePath = path.resolve(basePath, vueFilePath);
      return renderer.renderToString(filePath, state, renderOptions);
    };
    return next();
  };
}

module.exports = vueEasyRenderer;
