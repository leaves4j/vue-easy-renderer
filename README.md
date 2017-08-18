vue-easy-renderer
---
`vue-easy-renderer` is a server-side rendering framework based on `vue-server-renderer`, which provides a simpler way to implement vue server rendering, including `Koa.js` and `Express.js` plugin.

[中文说明](https://github.com/leaves4j/vue-easy-renderer/blob/master/README-zh.md)

  - [Installation](#installation)
  - [Example](#example)
  - [API](#api)
  - [Renderer Options](#renderer-options)
  - [Vue Client Plugin](#vue-client-plugin)
  - [Component Head](#component-head)
  - [vuex or vue-router](#vuex-or-vue-router)
  - [ChangeLog](#changelog)
  - [License](#license)

## Installation

```bash
npm install vue-easy-renderer -S
```

Peer Dependency

```bash
npm i vue vuex vue-router vue-loader vue-server-renderer -S
```

## Example

**Vue File**

Create the vue file in `component/hello_word/hello_word.vue`

```html
<template>
  <div>hello {{world}}</div>
</template>
<style scoped>
</style>
<script>
  export default {
    name: 'HelloWorld',
    data() {
      return {
        world: ''
      };
    }
  }
</script>
```

**Koa.js 2**

```js
'use strict';

const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const vueEasyRenderer = require('vue-easy-renderer').koaRenderer;

const renderer = vueEasyRenderer(path.resolve(__dirname, './component'));
const app = new Koa();

app.use(serve('./dist'));
app.use(renderer);

// with ES7 async/await
// app.use(async ctx => {
//   await ctx.vueRender('simple.vue', {hello: 'world!'});
// });

app.use(ctx => ctx.vueRender('hello_world/hello_world.vue', {world: 'world!'}));

app.listen(8080);

console.log('vue-easy-renderer koa example start in 127.0.0.1:8080');
module.exports = app;

```

**Express.js**

```js
'use strict';

const path = require('path');
const express = require('express');
const vueEasyRenderer = require('vue-easy-renderer').connectRenderer;

const renderer = vueEasyRenderer(path.resolve(__dirname, './component'));
const app = express();

app.use(express.static('./dist'));
app.use(renderer);

app.get('/', (req, res) => res.vueRender('hello_world/hello_world.vue', {world: 'world!'}));

app.listen(8081);

console.log('vue-easy-renderer express example start in 127.0.0.1:8081');
module.exports = app;

```

**Result**

The browser get the html:

```html
<html>
<head>
 <script>window.__VUE_INITIAL_STATE__ = {"world":"world!"};</script>
</head>
<body>
  <div server-rendered="true" data-v-30ca8d89>hello world!</div>
</body>
</html>
```
Detail in [Full example](https://github.com/leaves4j/vue-easy-renderer/tree/master/example)

## API

**vueRender(path,data,config)**

Use `ctx.vueRender()` in koa.js or `res.vueRender()` in express

| Param | Type | Description |
| --- | --- | --- |
| path | `String` | `*.vue` file path base on [`Options.basePath`](#renderer-options)  |
| data | `Object` | render data, will be merged into vue instance `data`|
| [config] | `Object` | renderer config |
| [config.pure] | `Boolean` | default `false`, `pure:true` will  render `*.vue` file without head and tail

## Renderer Options

**vueEasyRenderer(basePath,options)**

With `Koa.js 2`

```js
const vueEasyRenderer = require('vue-easy-renderer').koaRenderer;
const renderer = vueEasyRenderer(bastPath, options);
```

With `Express.js`

```js
const vueEasyRenderer = require('vue-easy-renderer').connectRenderer;
const renderer = vueEasyRenderer(bastPath, options);
```

**Options**

| Param | Type | Description |
| --- | --- | --- |
| basePath | `string` | `*.vue` file base path |
| [options] | `Object` | renderer options |
| [options.plugins] | `Array<Object|string>` | vue plugins, e.g. `[vueRouter]`, it also support using plugin path string, e.g. `[path.resolve('../app/resource.js')]` |
| [options.preCompile] | `Array` | pre-compile `*.vue` file list |
| [options.head] | `Object` | common html head config see detail in [Component Head](#component-head) |
| [options.compilerConfig] | `Object` | server-side compiler webpack config, default config use `vue-loader` with `css-loader` and `babel-loader`|
| [options.onError] | `Function` | error handler|
| [options.onReady] | `Function` | ready event handler, renderer will emit an event when completed the work of initialization|
| [options.global] | `Object` | global variables, these variables will be injected into context of the vue rendering sandbox, just like global.xx in node or window.xx in browser|


## Vue Client Plugin

We can set the render data to vue instance `data` with the client plugin 

Base usage

```js
import Vue from 'vue';
import vueEasyRenderer from 'vue-easy-renderer/lib/plugins/client';
import App from './app.vue';

Vue.use(vueEasyRenderer);
const app = new Vue(App);
app.$mount('#app');
```

## Component Head

We can set head in component

```html
<template>
  <div id="app" class="hello">hello {{world}}</div>
</template>
<style scoped>
</style>
<script>

  export default {
    name: 'HelloWorld',
    data() {
      return {
        world: ''
      };
    },
    head: {
      title: 'hello',
      script: [
        {src: "/hello_world.js", async: 'async'}
      ],
      link: [
        { rel: 'stylesheet', href: '/style/hello_world.css' },
      ]
    },
  }
</script>
```

Then the result

```html
<html>
<head>
 <title>hello</title>
 <link rel="stylesheet" href="/style/hello_world.css"/>
 <script>window.__VUE_INITIAL_STATE__ = {"world":"world!"};</script>
 <script src="/hello_world.js" async="true"></script>
</head>
<body>
  <div id="app" server-rendered="true" class="hello" data-v-035d6643>hello world!</div>
</body>
</html>
```

## vuex or vue-router

When using vuex or vue-router in server-side rendering, we need to create a vuex or vue-router instance for each request, so when you inject a vuex or vue-router instance into a component, you need to add a factory function to the instance , The function will return an instance when called, the default method is named `$ ssrInstance`, such as:

**vuex**

```js
const options = {
  state: {
    hello: 'world!'
  }
};

const store = new Vuex(options);
store.$ssrInstance = () => new Vuex(options);
export default store;
```

**vue-router**

```js
const options = {
  mode: 'history',
  routes: [
    { path: '/user/:id', component: User }
  ]
})

const router = new VueRouter(options)
router.$ssrInstance = () => new Vuex(options);
export default router;
```
If you use `vue-router` in server rendering, you need to set `mode` to `history`
## ChangeLog

[ChangeLog](https://github.com/leaves4j/vue-easy-renderer/blob/master/CHANGELOG.md)

## License

MIT