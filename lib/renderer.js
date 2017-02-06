'use strict';

const vm = require('vm');
const Vue = require('vue');
const serialize = require('serialize-javascript');
const vueServerRenderer = require('vue-server-renderer');
const vueEasyRendererClientPlugin = require('../client/plugin');
const mfs = require('./mfs');
const StreamTransform = require('./transform');

Vue.use(vueEasyRendererClientPlugin);

/**
 * vue renderer
 * @class Renderer
 */
class Renderer {
  /**
   * Creates an instance of Renderer.
   *
   * @param {Compiler} compiler
   * @param {Object} [config]
   *
   * @memberOf Renderer
   */
  constructor(compiler, config) {
    this.compiler = compiler;
    this.vueRenderer = vueServerRenderer.createRenderer();
    this.baseHead = (config && config.head) || {};
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
      return Promise.resolve(htmlStream);
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
    let sourceCodePromise;
    const initData = context || {};
    try {
      const sourceCode = mfs.readFileSync(path, 'utf-8');
      sourceCodePromise = Promise.resolve(sourceCode);
    } catch (e) {
      sourceCodePromise = this.compiler.compile(path);
    }

    return sourceCodePromise.then(code => {
      const vueConfig = vm.runInNewContext(code, {
        module
      });
      const self = this;
      const mixin = {
        beforeCreate() {
          const data = typeof this.$options.data === 'function' ?
            this.$options.data.call(this) :
            this.$options.data || {};
          this.$options.data = Object.assign(data, initData);
          this.$options.head = Renderer.headMerge(this.$options.head || {}, self.baseHead);
        }
      };

      if (vueConfig.mixins) {
        vueConfig.mixins.push(mixin);
      } else {
        vueConfig.mixins = [mixin];
      }

      return Promise.resolve(new Vue(vueConfig));
    });
  }
  /**
   * get the html template head and tail
   *
   * @static
   * @param {any} head
   * @param {any} context
   * @returns {Promise}
   *
   * @memberOf Renderer
   */
  static getIndexHtmlTemplate(head, context) {
    const headHtml = `<html data-vue-meta-server-rendered ${head.htmlAttrs.text()}>
<head>
  ${head.meta.text()}${head.title.text()}${head.link.text()}${head.style.text()}${head.noscript.text()}
  <script>window.__VUE_INITIAL_DATA__ = ${serialize(context, {isJSON: true})};</script>
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
   * @static
   * @param {any} head
   * @param {any} baseHead
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