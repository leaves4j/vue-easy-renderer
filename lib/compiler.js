'use strict';

const path = require('path');
const webpack = require('webpack');
const cache = require('./cache');

/**
 * *.vue file compiler
 *
 * @class Compiler
 */
class Compiler {
  /**
   * Creates an instance of Compiler.
   *
   * @param {Object} [options]
   *
   * @memberOf Compiler
   */
  constructor(options) {
    this.config = options && options.config;
    this.basePath = options && options.basePath;
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

    const config = this.getCompilerConfig(filePath);
    const serverCompiler = webpack(config);
    serverCompiler.outputFileSystem = cache.mfs;

    return new Promise((resolve, reject) => {
      serverCompiler.run((err, statsObject) => {
        if (err) {
          reject(err);
          return;
        }

        const stats = statsObject.toJson();
        stats.errors.forEach(error => console.error(error));
        stats.warnings.forEach(warning => console.warn(warning));
        resolve(cache.mfs.readFileSync(filePath));
      });
    });
  }
  getCompilerConfig(filePath) {
    const defaultConfig = {
      module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              loaders: {
                js: 'babel-loader',
                css: 'css-loader',
                sass: 'sass-loader',
                scss: 'sass-loader',
                less: 'less-loader',
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
          }]
      },
      context: this.basePath
    };
    const config = Object.assign(defaultConfig, this.config);
    config.entry = {
      server: filePath
    };
    config.output = {
      path: path.dirname(filePath),
      filename: path.basename(filePath),
      libraryTarget: 'commonjs2'
    };
    config.target = 'node';
    return config;
  }
}

module.exports = Compiler;