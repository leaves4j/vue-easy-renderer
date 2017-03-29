'use strict';

const path = require('path');
const webpack = require('webpack');
const node_version = require('node-version');
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
    this.watch = process.env.NODE_ENV !== 'production' && (options && options.watch);
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
    const extname = path.extname(filePath);
    if (extname !== '.vue' && extname !== '.js') {
      return Promise.reject(new Error('Compiler file should be a *.vue or *.js file'));
    }

    const config = this.getCompilerConfig(filePath);
    const serverCompiler = webpack(config);
    serverCompiler.outputFileSystem = cache.mfs;

    const runner = this.watch ? cb => serverCompiler.watch({}, cb) : cb => serverCompiler.run(cb);

    return new Promise((resolve, reject) => {
      runner((err, statsObject) => {
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
        rules: [{
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            loaders: {
              js: 'babel-loader',
              css: 'null-loader',
              sass: 'null-loader',
              scss: 'null-loader',
              less: 'null-loader',
            }
          }
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: [
              ['env', {
                targets: {
                  node: node_version.short > 7.6 ? 'current' : Number(node_version.short)
                }
              }]
            ]
          },
        }
        ]
      },
      context: this.basePath
    };
    const config = Object.assign(defaultConfig, this.config);
    // if (node_version.short > 7.6) {
    //   config.entry = {
    //     server: filePath
    //   };
    // } else {
    config.entry = {
      server: ['babel-regenerator-runtime', filePath]
    };
    // }

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