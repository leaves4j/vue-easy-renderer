'use strict';

import Vue from 'vue';
import vueEasyRenderer from '../../../../dist/plugin';
import HelloWord from './hello_world.vue';

Vue.use(vueEasyRenderer);
const app = new Vue(HelloWord);
app.$mount('#app');