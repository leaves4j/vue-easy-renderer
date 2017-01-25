'use strict';

const webpack = require('webpack');
const path = require('path');

const webpack_config = {
  entry: {
    plugin: [path.resolve(__dirname, './plugin.js')],
  },
  output: {
    path: '../dist/',
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-2']
        },
        exclude: /node_modules/
      },
    ]
  }
};
module.exports = webpack_config;
