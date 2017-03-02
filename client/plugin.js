'use strict';

const meta = require('vue-meta');

if (typeof Object.assign !== 'function') {
  Object.assign = target => {
    if (target == null) {
      throw new TypeError('Object.assign() Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (let index = 1; index < arguments.length; index++) {
      const source = arguments[index];
      if (source != null) {
        for (const key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}

const vueEasyRenderer = {};
vueEasyRenderer.install = (Vue, options) => {
  Vue.use(meta, {keyName: 'head'});
  Vue.mixin({
    beforeCreate() {
      if (this.$isServer || this.$parent) return;
      /*global window*/
      const initState = window.__VUE_INITIAL_STATE__;
      if (this.$options.store && initState) {
        this.$options.store.replaceState(Object.assign(this.$options.store.state, initState));
      } else {
        const data = typeof this.$options.data === 'function' ?
          this.$options.data.call(this) :
          this.$options.data || {};
        this.$options.data = Object.assign(data, initState || {});
      }
    }
  });
};

module.exports = vueEasyRenderer;