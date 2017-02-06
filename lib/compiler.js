'use strict';

const path = require('path');
const webpack = require('webpack');
const mfs = require('./mfs');

/**
 * *.vue file compiler
 *
 * @class Compiler
 */
class Compiler {
  /**
   * Creates an instance of Compiler.
   *
   * @param {Object} [config]
   *
   * @memberOf Compiler
   */
  constructor(config) {
    this.webpackConfig = config && config.webpackConfig;
    this.defaultConfig = {
      module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              loaders: {
                js: 'babel-loader',
                scss: 'css-loader'
              }
            }
          },
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              presets: ['es2015', 'stage-2']
            },
          }
        ]
      },
    };
  }

  /**
   * compile *.vue file to file
   *
   * @param {string} filePath
   * @returns {Promise}
   *
   * @memberOf Compiler
   */
  compile(filePath) {
    if (path.extname(filePath) !== '.vue') {
      return Promise.reject(new Error('Compiler file should be a *.vue file'));
    }

    const config = this.webpackConfig || this.defaultConfig;
    config.entry = {
      server: filePath
    };
    config.output = {
      path: path.dirname(filePath),
      filename: path.basename(filePath),
      libraryTarget: 'commonjs2'
    };
    config.target = 'node';

    const serverCompiler = webpack(config);
    serverCompiler.outputFileSystem = mfs;

    return new Promise((resolve, reject) => {
      serverCompiler.run((err, statsObject) => {
        if (err) {
          reject(err);
          return;
        }

        const stats = statsObject.toJson();
        stats.errors.forEach(error => console.error(error));
        stats.warnings.forEach(warning => console.warn(warning));
        resolve(mfs.readFileSync(filePath));
      });
    });
  }
}

module.exports = Compiler;