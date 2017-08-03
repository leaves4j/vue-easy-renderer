'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var vueEasyRenderer = {};
vueEasyRenderer.install = function (Vue, options) {
  Vue.mixin({
    beforeCreate: function beforeCreate() {
      if (this.$isServer || this.$parent) return;
      var initState = window.__VUE_INITIAL_STATE__; //eslint-disable-line 
      if (this.$options.store && initState) {
        this.$options.store.replaceState(_extends({}, this.$options.store.state, initState));
      } else {
        var data = typeof this.$options.data === 'function' ? this.$options.data.call(this) : this.$options.data || {};
        this.$options.data = _extends({}, data, initState);
      }
    }
  });
};

module.exports = vueEasyRenderer;
