vue-easy-renderer
---
This package offers Node.js server-side rendering for Vue 2.0, Base on `vue-server-render`

+ [Installation](#installation)
+ [Example](#example)
+ [API](#api)
+ [Renderer Options](#renderer-options)
+ [Vue Client Plugin](#vue-client-plugin)
+ [Component Head](#component-head)

## Installation

```bash
npm install vue-easy-renderer -S
```

Peer Dependency

```bash
npm i vue vuex vue-loader -S
```

## Example

### Vue File

Create the vue file in `componet/hello_word/hello_word.vue`

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

### Koa.js 2

```js
'use strict';

const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const vueEasyRenderer = require('vue-easy-renderer').kaoRenderer;

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

### Express.js

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

### Result
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

### vueRender(path,data,config)

Use `ctx.vueRender()` in koa.js or `res.vueRender()` in express

| Param | Type | Description |
| --- | --- | --- |
| path | `String` | `*.vue` file path base on [`Options.basePath`](#renderer-options)  |
| data | `Object` | render data, will be merged into vue instance `data`|
| [config] | `Object` | renderer config |
| [config.pure] | `Boolean` | default `false`, `pure:true` will  render `*.vue` file without head and tail

## Renderer Options

### vueEasyRenderer(basePath,options)

With `Koa.js 2`

```js
const vueEasyRenderer = require('vue-easy-renderer').kaoRenderer;
```

With `Express.js`

```js
const vueEasyRenderer = require('vue-easy-renderer').connectRenderer;
```

**Params:**

| Param | Type | Description |
| --- | --- | --- |
| basePath | `string` | `*.vue` file base path |
| [options] | `Object` | renderer options |
| [options.store] | `string` | enum `'on'` `'off'` `'auto'`, default `'auto'`. when is 'on', renderer use vuex store, when 'auto', renderer will check the vue options, then renderer set data to vuex or vue data depend on vue options 'store' property|
| [options.plugins] | `Array` \| `string` | vue plugins, e.g. `[vueRouter]` or `[{plugin: vueRouter,options: {}}]`, it also support using plugin path string, e.g. `[path.resolve('../app/resource.js')]` |
| [options.preCompile] | `Array` | pre-compile `*.vue` file list |
| [options.head] | `Object` | common html head config see detail in [Component Head](#component-head) |
| [options.compilerConfig] | `Object` | server-side compiler webpack config, default config use `vue-loader` with `css-loader` and `babel-loader` in `preset-es2015 preset-stage-2`|


## Vue Client Plugin

We can set the render data to vue instance `data` with the client plugin 

Base usage

```js
import Vue from 'vue';
import vueEasyRenderer from 'vue-easy-renderer/dist/plugin';
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
<html data-vue-meta-server-rendered data-vue-meta="">
<head>
 <title data-vue-meta="true">hello</title>
 <link data-vue-meta="true" rel="stylesheet" href="/style/hello_world.css"/>
 <script>window.__VUE_INITIAL_STATE__ = {"world":"world!"};</script>
 <script data-vue-meta="true" src="/hello_world.js" async="true"></script>
</head>
<body data-vue-meta="">
  <div id="app" server-rendered="true" class="hello" data-v-035d6643>hello world!</div>
</body>
</html>
```

`vue-easy-render` uses [vue-meta](https://github.com/declandewet/vue-meta) to update the headers and html attributes of your application. You can take a look at [vue-meta documentation](https://github.com/declandewet/vue-meta) for the list of options you can give to head.



## License

MIT