'use strict';

const path = require('path');
const express = require('express');

const vueFileRenderer = require('vue-easy-renderer').connectRenderer;

const renderer = vueFileRenderer(path.resolve(__dirname, './component'), {
  head: {
    title: 'hello world!',
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'}
    ]
  }
});
const app = express();
app.use(express.static('./dist'));
app.use(renderer);

app.use((req, res) => res.vueRender('hello_world/hello_world.vue', {world: 'world!'}));

app.listen(8081);

console.log('vue-easy-renderer express example start in 127.0.0.1:8081');
module.exports = app;
