'use strict';

const vm = require('vm');
const Vue = require('vue');
const Vuex = require('vuex');
const meta = require('vue-meta');
const serialize = require('serialize-javascript');
const vueServerRenderer = require('vue-server-renderer');
const cache = require('./cache');
const StreamTransform = require('./transform');

const storeEnum = {
  ON: 'on',
  OFF: 'off',
  AUTO: 'auto'
};
/**
 * vue renderer
 * @class Renderer
 */
class Renderer {
  /**
   * Creates an instance of Renderer.
   *
   * @param {Compiler} compiler
   * @param {Object} [options]
   *
   * @memberOf Renderer
   */
  constructor(compiler, options) {
    const defaultOptions = {
      head: {},
      useStore: storeEnum.AUTO,
      plugins: []
    };
    this.vueClass = null;
    this.compiler = compiler;
    this.vueRenderer = vueServerRenderer.createRenderer();
    this.options = Object.assign(defaultOptions, options);
    this.getVueClass();
  }

  /**
   * Get configured Vue Class
   *
   * @returns
   *
   * @memberOf Renderer
   */
  getVueClass() {
    if (this.vueClass) return Promise.resolve(this.vueClass);

    Vue.use(meta, {keyName: 'head'});
    Vue.use(Vuex);

    const compilePlugins = [];
    this.options.plugins.forEach(plugin => {
      if (typeof plugin === 'string') {
        compilePlugins.push(plugin);
      } else if (plugin.install) {
        Vue.use(plugin);
      } else if (plugin.plugin) {
        const options = plugin.options;
        Vue.use(plugin.plugin, options);
      }
    });

    const pluginPromises = compilePlugins.map(pluginPath => this.getCodeObject(pluginPath));

    return Promise.all(pluginPromises).then(plugins => {
      plugins.forEach(plugin => {
        //for es6 export default with webpack
        if (plugin.default && plugin.default.install) {
          Vue.use(plugin.default);
        } else {
          Vue.use(plugin);
        }
      });
      this.vueClass = Vue;
      return this.vueClass;
    });
  }
  /**
   * render *.vue file to stream
   *
   * @param {string} path
   * @param {Object} [context]
   * @param {Object} [config]
   * @returns {Promise}
   *
   * @memberOf Renderer
   */
  renderToStream(path, context, config) {
    const isPure = config && config.pure;

    return this.getVueInstance(path, context).then(vueInstance => {
      const bodyStream = this.vueRenderer.renderToStream(vueInstance);
      let htmlStream;
      if (!isPure) {
        const head = vueInstance.$meta().inject();
        const indexHtml = Renderer.getIndexHtmlTemplate(head, context);
        const transform = new StreamTransform(indexHtml.headHtml, indexHtml.tailHtml);
        htmlStream = bodyStream.pipe(transform);
      } else {
        htmlStream = bodyStream;
      }
      return htmlStream;
    });
  }

  /**
   * render *.vue file to  to string
   *
   * @param {string} path
   * @param {Object} [context]
   * @param {Object} [config]
   * @returns {Promise}
   *
   * @memberOf Renderer
   */
  renderToString(path, context, config) {
    const isPure = config && config.pure;

    return this.getVueInstance(path, context).then(vueInstance => new Promise((resolve, reject) => {
      this.vueRenderer.renderToString(vueInstance, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        let html;

        if (!isPure) {
          const head = vueInstance.$meta().inject();
          const indexHtml = Renderer.getIndexHtmlTemplate(head, context);
          html = `${indexHtml.headHtml}${result}${indexHtml.tailHtml}`;
        } else {
          html = result;
        }

        resolve(html);
      });
    }));
  }

  /**
   * get vue instance
   *
   * @param {string} path
   * @param {Object} context
   * @returns {Promise}
   *
   * @memberOf Renderer
   */
  getVueInstance(path, context) {
    const initContext = context || {};

    return this.getCodeObject(path).then(vueConfig => {
      const self = this;
      const isStore = this.options.useStore === storeEnum.AUTO ? (!!vueConfig.store) : (this.options.useStore === storeEnum.ON);

      const mixin = {
        beforeCreate() {
          if (!isStore) {
            const data = typeof this.$options.data === 'function' ?
              this.$options.data.call(this) :
              this.$options.data || {};
            this.$options.data = Object.assign(data, initContext);
          }
          const head = typeof this.$options.head === 'function' ?
            this.$options.head.call(this) :
            this.$options.head || {};
          this.$options.head = Renderer.headMerge(head, self.options.head);
        }
      };
      if (vueConfig.mixins) {
        vueConfig.mixins.push(mixin);
      } else {
        vueConfig.mixins = [mixin];
      }

      if (isStore) {
        try {
          const store = vueConfig.store;
          store.replaceState(context);
        } catch (e) {
          console.error(e);
        }
      }

      return this.getVueClass().then(VueClass => new VueClass(vueConfig));
    });
  }

  /**
   * Get compiled code object
   *
   * @param {string} path
   * @returns {Promise}
   *
   * @memberOf Renderer
   */
  getCodeObject(path) {
    // const storage = cache.storage;
    // if (storage.has(path)) {
    //   return Promise.resolve(storage.get(path));
    // }

    let sourceCodePromise;
    try {
      const sourceCode = cache.mfs.readFileSync(path, 'utf-8');
      sourceCodePromise = Promise.resolve(sourceCode);
    } catch (e) {
      sourceCodePromise = this.compiler.compile(path);
    }
    return sourceCodePromise.then(code => {
      const sandbox = vm.createContext(Object.assign(global, {module, require}));
      const codeObject = vm.runInContext(code, sandbox);
      //storage.set(path, codeObject);
      return codeObject;
    });
  }


  /**
   * get the html template head and tail
   *
   * @static
   * @param {Object} head
   * @param {Object} context
   * @returns
   *
   * @memberOf Renderer
   */
  static getIndexHtmlTemplate(head, context) {
    const headHtml = `<html data-vue-meta-server-rendered ${head.htmlAttrs.text()}>
<head>
  ${head.meta.text()}${head.title.text()}${head.link.text()}${head.style.text()}${head.noscript.text()}
  <script>window.__VUE_INITIAL_STATE__ = ${serialize(context, {isJSON: true})};</script>
  ${head.script.text()}
</head>
<body ${head.bodyAttrs.text()}>
  `;

    const tailHtml = `
</body>
</html>`;

    return {headHtml, tailHtml};
  }

  /**
   * merge vue-meta setting
   *
   * @static
   * @param {string} head
   * @param {string} baseHead
   * @returns
   *
   * @memberOf Renderer
   */
  static headMerge(head, baseHead) {
    const newHead = {};
    const keys = ['title', 'titleTemplate', 'htmlAttrs', 'bodyAttrs', 'base', 'meta', 'link', 'style', 'script', 'noscript'];
    keys.forEach(key => {
      if (head[key] && baseHead[key]) {
        if (baseHead[key] instanceof Array) {
          newHead[key] = [];
          baseHead[key].forEach(item => newHead[key].push(item));
          head[key].forEach(item => newHead[key].push(item));
        } else {
          newHead[key] = head[key];
        }
      } else if (head[key] || baseHead[key]) {
        newHead[key] = head[key] || baseHead[key];
      }
    });
    return newHead;
  }
}

module.exports = Renderer;