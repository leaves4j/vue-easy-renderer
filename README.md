vue-easy-renderer
---
This package offers Node.js server-side rendering for Vue 2.0, Base on `vue-server-render`

+ [Installation](#installation)
+ [Example](#example)
+ [API](#api)
+ [Renderer Options](#renderer-options)

## Installation

```bash
npm install vue-easy-renderer -S
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

###Express.js

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
</head>
<body>
  <div server-rendered="true" data-v-30ca8d89>hello world!</div>
  <script>window.__VUE_INITIAL_DATA__ = {"world":"world!"};</script>
</body>
</html>
```
Detail in [Full example]()