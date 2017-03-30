vue-easy-renderer
---
`vue-easy-renderer` 是一个基于 `vue-server-renderer` 的服务端渲染工具, 他提供了更简单的方式来实现vue的服务端渲染， 包括 `Koa.js` 和 `Express.js` 的插件.

+ [Installation](#installation)
+ [Example](#example)
+ [API](#api)
+ [Renderer Options](#renderer-options)
+ [Vue Client Plugin](#vue-client-plugin)
+ [Component Head](#component-head)
+ [Change Log](#change-log)

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

### Koa.js 2

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

在 `koa.js` 中 `vueRender`挂载在`ctx`上，即 `ctx.vueRender()`，在`express.js`中挂载在`res`上，即 `res.vueRender()`

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| path | `String` | `*.vue` 基于 [`Options.basePath`](#renderer-options) 的路径  |
| data | `Object` | 渲染数据，将会被合并到vue实例的data中或者vuex的state中|
| [config] | `Object` | 渲染选项 |
| [config.pure] | `Boolean` | 默认 `false`, 当设置为`pure:true`时，将会只渲染vue文件的html,不包含头尾|
## Renderer 选项

### vueEasyRenderer(basePath,options)

**获取 vueEasyRenderer**

With `Koa.js 2`

```js
const vueEasyRenderer = require('vue-easy-renderer').kaoRenderer;
```

With `Express.js`

```js
const vueEasyRenderer = require('vue-easy-renderer').connectRenderer;
```

**参数:**

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| basePath | `string` | `*.vue` 文件路径 |
| [options] | `Object` | renderer 的 options |
| [options.watch] | `Boolean` | 默认值 `false`, 是否监控 '*.vue' 的变更, 当process.env.NODE_ENV|
| [options.store] | `string` | 枚举 `'on'` `'off'` `'auto'`, 默认为 `'auto'`. 当设置为`on`的时候，会将数据渲染到vuex的state中；如果为`off`，将会渲染到vue实例的data中，如果为`auto`，会自动检查vue是否使用了vuex，如果使用了vuex就回渲染到state中，否则渲染到data中|
| [options.plugins] | `Array` \| `string` | vue插件, 如 `[vueRouter]` 或者 `[{plugin: vueRouter,options: {}}]`, 同时也支持字符串，如： `[path.resolve('../app/resource.js')]` |
| [options.preCompile] | `Array` | 需要预编译的 `*.vue` 文件路径列表，如：`['test.vue']` |
| [options.head] | `Object` | 通用的html头部设置， 详情见 [Component Head](#component-head) |
| [options.compilerConfig] | `Object` | 服务端vue文件的编译器配置，为webpack配置文件，默认配置使用 `vue-loader` 、 `css-loader` 、 `babel-loader`|
| [options.onError] | `Function` | 异常处理方法|
| [options.onReady] | `Function` | ready 时间处理方法, renderer 将会在完成初始化工作之后emit一个ready事件|
| [options.global] | `Object` | 全局变量, 这些全局变量将会被注入的vue服务端渲染时的sandbox的作用域，相当于node中的global.xx，浏览器中的window.xx|


## Vue Client Plugin

服务端渲染完成后，我们需要把数据注入到浏览器中vue/vuex实例中，需要借助于客户端的插件

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

我们可以在组件中设置html的头部

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

## ChangeLog

[ChangeLog](https://github.com/leaves4j/vue-easy-renderer/blob/master/CHANGELOG.md)

## License

MIT