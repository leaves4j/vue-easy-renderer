'use strict';

const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const webpack_config = {
  entry: {
    plugin: [path.resolve(__dirname, './plugin.js')],
  },
  output: {
    path: '../dist/',
    filename: '[name].js',
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
  },
  plugins: [
    new ExtractTextPlugin('../dist/style/[name].css')
  ]
};
module.exports = webpack_config;
