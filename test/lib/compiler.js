'use strict';

const path = require('path');
const {describe, it} = require('mocha');
const Compiler = require('../../lib/compiler');
const cache = require('../../lib/cache');

describe('Compiler', () => {
  it('Compiler.compile() should be ok with vue file', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
    const compiler = new Compiler();
    compiler.compile(filePath).then(() => {
      const file = cache.mfs.readFileSync(filePath);
      if (file) {
        done();
      } else {
        done('compiler file write fail');
      }

      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
    }).catch(e => {
      done(e);
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
    });
  });
  it('Compiler.compile() should be ok with js file', done => {
    const filePath = path.resolve(__dirname, '../vue_file/test.js');
    const compiler = new Compiler();
    compiler.compile(filePath).then(() => {
      const file = cache.mfs.readFileSync(filePath);
      if (file) {
        done();
      } else {
        done('compiler file write fail');
      }

      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
    }).catch(e => {
      done(e);
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
    });
  });
  it('Compiler.constructor() should be ok with options.watch', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
    const compiler = new Compiler({watch: true});
    compiler.compile(filePath).then(() => {
      const file = cache.mfs.readFileSync(filePath);
      if (file) {
        done();
      } else {
        done('compiler file write fail');
      }

      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
    }).catch(e => {
      done(e);
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
    });
  });
  it('Compiler.compile() should be ok with es6/es7', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple_es_next.vue');
    const compiler = new Compiler({watch: true});
    compiler.compile(filePath).then(() => {
      const file = cache.mfs.readFileSync(filePath);
      if (file) {
        done();
      } else {
        done('compiler file write fail');
      }

      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
    }).catch(e => {
      done(e);
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
    });
  });
});