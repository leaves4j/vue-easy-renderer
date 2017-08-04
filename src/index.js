
process.env.VUE_ENV = 'server';

const koaRenderer = require('./koa');
const connectRenderer = require('./connect');

module.exports = {
  koaRenderer,
  connectRenderer,
};
