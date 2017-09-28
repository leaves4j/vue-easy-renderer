// @flow
import type { RenderOptions, VueEasyRendererOptionParams } from './type';

const path = require('path');
const rendererFactory = require('./renderer/factory');
const ErrorTypes = require('./error');

const noop = () => { };

function vueEasyRenderer(basePath: string, VEROptions?: VueEasyRendererOptionParams) {
  const errorHandler = (e: ErrorTypes.BaseError) => {
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
        const error = new ErrorTypes.RenderError(e);
        error.component = vueFilePath;
        error.state = state;
        errorHandler(error);
        return Promise.reject(error);
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
