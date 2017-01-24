'use strict';

const path = require('path');
const Koa = require('koa');
const vueEasyRender = require('../../index');

const app = new Koa();
app.use(vueEasyRender.koaRenderer(path.resolve(__dirname, '../vue_file')));
app.use(async ctx => {
  await ctx.vueRender('simple.vue', {hello: 'world!'});
  // const data = await new Promise(r => {
  //   setTimeout(() => {
  //     ctx.body = 1234
  //     r(123);
  //   }, 1000);
  // });
  // //= data;
  // //next();
});
app.listen(8080);
module.exports = app;
