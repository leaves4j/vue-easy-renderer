'use strict';

const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');

const vueEasyRenderer = require('../../index').koaRenderer;

const renderer = vueEasyRenderer(path.resolve(__dirname, './component'), {
  head: {
    title: 'hello world!',
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'}
    ]
  }
});
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
