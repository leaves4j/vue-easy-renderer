// @flow
import type { ICompiler, IRenderer, RendererOptions, RendererOptionParams, RendererContext, RenderOptions } from '../type';

const EventEmitter = require('events');
const Vue = require('vue');
const Vuex = require('vuex');
const Router = require('vue-router');
const serialize = require('serialize-javascript');
const vueServerRenderer = require('vue-server-renderer');
const SSRPlugin = require('../plugins/server');
const StreamTransform = require('./transform');
const VueHead = require('./head');

Vue.use(SSRPlugin);
Vue.use(Vuex);
Vue.use(Router);

const defaultRendererOptions: RendererOptions = {
  head: Object.create(null),
  plugins: [],
  preCompile: [],
  global: Object.create(null),
};

class Renderer extends EventEmitter implements IRenderer {
  compiler: ICompiler;
  options: RendererOptions;
  ready: boolean;
  Vue: Class<Vue>;
  vueRenderer: *;

  /**
   * Creates an instance of Renderer.
   * @param {ICompiler} compiler 
   * @param {RendererOptionParams} options 
   * @memberof Renderer
   */
  constructor(compiler: ICompiler, options?: RendererOptionParams) {
    super();
    this.compiler = compiler;
    this.vueRenderer = vueServerRenderer.createRenderer();
    this.options = Object.assign({}, defaultRendererOptions, options);
    this.init();
  }

  /**
   * 
   * 
   * @memberof Renderer
   */
  init(): void {
    const needCompiledPlugin: Array<string> = [];
    this.options.plugins.forEach((plugin) => {
      if (typeof plugin === 'string') {
        needCompiledPlugin.push(plugin);
      }
    });
    this.options.preCompile.push(...needCompiledPlugin);
    this.compiler.load(this.options.preCompile).then(() => {
      this.emit('ready');
    }).catch(e => this.emit('error', e));
  }

  /**
   * 
   * 
   * @returns {Promise<Class<Vue>>} 
   * @memberof Renderer
   */
  getVueClass(): Promise<Class<Vue>> {
    if (this.Vue) return Promise.resolve(this.Vue);

    const needCompiledPlugins: Array<string> = [];
    this.options.plugins.forEach((plugin) => {
      if (typeof plugin === 'string') {
        needCompiledPlugins.push(plugin);
      } else if (plugin.default && plugin.default.install) {
        Vue.use(plugin.default);
      } else {
        Vue.use(plugin);
      }
    });

    if (needCompiledPlugins.length === 0) {
      this.Vue = Vue;
      return Promise.resolve(this.Vue);
    }

    return Promise.all(needCompiledPlugins.map(pluginPath => this.compiler.import(pluginPath)))
      .then((plugins) => {
        plugins.forEach((plugin) => {
          if (plugin.default && plugin.default.install) {
            Vue.use(plugin.default);
          } else {
            Vue.use(plugin);
          }
        });
        this.Vue = Vue;
        return this.Vue;
      });
  }

  /**
   * get the component
   * 
   * @param {string} path 
   * @param {RendererContext} context 
   * @returns {Promise<Vue>} 
   * @memberof Renderer
   */
  getComponent(path: string, context: RendererContext): Promise<Vue> {
    return Promise.all([
      this.getVueClass(),
      this.compiler.import(path).then(object => object.default || object),
    ]).then(([VueClass, VueOptions]) => {
      const SSRVueOptions = Object.assign({}, VueOptions, { $context: context });
      const component = new VueClass(SSRVueOptions);
      if (component.$options.router) {
        return new Promise((resolve) => {
          component.$options.router.onReady(() => resolve(component));
        });
      }
      return component;
    });
  }

  /**
   * 
   * 
   * @param {string} path 
   * @param {Object} state 
   * @param {RenderOptions} options 
   * @returns {Promise<stream$Readable>} 
   * @memberof Renderer
   */
  renderToStream(path: string, state?: Object, options?: RenderOptions): Promise<stream$Readable> {
    const context: RendererContext = {
      state: state || {},
      url: options ? options.url : '/',
    };
    const isPure = options && options.pure;
    return this.getComponent(path, context).then((component) => {
      const bodyStream = this.vueRenderer.renderToStream(component);

      if (isPure) return bodyStream;

      const head = component.$options.$getHead();
      const mergedHead = VueHead.headMerge(head, this.options.head);
      const template = Renderer.getTemplateHtml(mergedHead, context.state, this.options.global);
      const transform = new StreamTransform(template.head, template.tail);
      return bodyStream.pipe(transform);
    });
  }
  renderToString(path: string, state?: Object, options?: RenderOptions): Promise<string> {
    const context: RendererContext = {
      state: state || {},
      url: options ? options.url : '/',
    };
    const isPure = options && options.pure;
    return this.getComponent(path, context).then(component => new Promise((resolve, reject) => {
      this.vueRenderer.renderToString(component, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        if (isPure) {
          resolve(result);
          return;
        }

        const head = component.$options.$getHead();
        const mergedHead = VueHead.headMerge(head, this.options.head);
        const indexHtml = Renderer.getTemplateHtml(mergedHead, context.state, this.options.global);
        const html = `${indexHtml.head}${result}${indexHtml.tail}`;
        resolve(html);
      });
    }));
  }

  /**
   * 
   * 
   * @static
   * @param {Object} headOptions 
   * @param {Object} state 
   * @param {Object} globalVars 
   * @returns {{ head: string, tail: string }} 
   * @memberof Renderer
   */
  static getTemplateHtml(headOptions: Object, state: Object, globalVars: Object): { head: string, tail: string } {
    const vueHead = new VueHead(headOptions);
    const globalString = Object.keys(globalVars).map(key => `window.${key} = ${serialize(globalVars[key], { isJSON: true })}; `).join('\n');
    const head = `<!DOCTYPE html>
<html>
<head>
  <script>window.__VUE_INITIAL_STATE__ = ${serialize(state, { isJSON: true })};</script>
  <script>${globalString}</script>
  ${vueHead.toHtmlString()}
</head>
<body>
  `;

    const tail = `
</body>
</html>`;

    return { head, tail };
  }
}
module.exports = Renderer;
