'use strict';

const path = require('path');
const chai = require('chai');
const {describe, it} = require('mocha');
const Compiler = require('../../lib/compiler');
const Renderer = require('../../lib/renderer');
const cache = require('../../lib/cache');

const expect = chai.expect;

describe('Renderer', () => {
  it('Renderer.constructor() should be ok with options.head', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple_head.vue');
    const compiler = new Compiler();
    const renderer = new Renderer(compiler);

    renderer.renderToString(filePath, {hello: 'world!'}).then(string => {
      expect(string).to.contain('<title>TITLE_TEST</title');
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
      done();
    }).catch(e => {
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
      done(e);
    });
  });
  it('Renderer.constructor() should be ok with options.preCompile', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
    const compiler = new Compiler();
    const renderer = new Renderer(compiler, {preCompile: [filePath]});

    renderer.on('ready', () => {
      try {
        cache.mfs.statSync(filePath);
        done();
      } catch (e) {
        done(e);
      }
    });
    renderer.on('error', done);
  });
  it('Renderer.constructor() should be ok with options.global', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple_global.vue');
    const compiler = new Compiler();
    const renderer = new Renderer(compiler, {global: {APP_VERSION: 'v1.0.0'}});

    renderer.renderToString(filePath, {}).then(string => {
      expect(string).to.contain('<script src="/app.js?_v=v1.0.0" defer="true">');
      expect(string).to.contain('<script>window.APP_VERSION = "v1.0.0"; </script>');
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
      done();
    }).catch(e => {
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
      done(e);
    });
  });
  it('renderer.getVueInstance() should be ok', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
    const compiler = new Compiler();
    const renderer = new Renderer(compiler);

    renderer.getVueInstance(filePath, {hello: 'world!'}).then(vueInstance => {
      expect(vueInstance).to.have.property('hello');
      expect(vueInstance.hello).to.equal('world!');
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
      done();
    }).catch(e => {
      done(e);
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
    });
  });
  it('renderer.renderToString() should be ok', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
    const compiler = new Compiler();
    const renderer = new Renderer(compiler);

    renderer.renderToString(filePath, {hello: 'world!'}).then(string => {
      expect(string).to.contain('<div server-rendered="true" class="test" data-v-167df365>hello world!</div>');
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
      done();
    }).catch(e => {
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
      done(e);
    });
  });
  it('renderer.renderToStream() should be ok', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
    const compiler = new Compiler();
    const renderer = new Renderer(compiler);

    renderer.renderToStream(filePath, {hello: 'world!'}).then(() => {
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
      done();
    }).catch(e => {
      cache.storage.delete(filePath);
      cache.mfs.unlinkSync(filePath);
      done(e);
    });
  });
  it('Renderer should be ok with store', done => {
    const filePath = path.resolve(__dirname, '../vue_file/store.vue');
    const compiler = new Compiler();
    const renderer = new Renderer(compiler, {useStore: 'auto'});

    renderer.renderToString(filePath, {world: 'world!'}).then(string => {
      expect(string).to.contain('<div server-rendered="true" class="test" data-v-483fa904>hello world!</div>');
      cache.mfs.unlinkSync(filePath);
      done();
    }).catch(e => {
      done(e);
      cache.mfs.unlinkSync(filePath);
    });
  });
  it('renderer.on(\'ready\') should be ok', done => {
    const compiler = new Compiler();
    const renderer = new Renderer(compiler);
    renderer.on('ready', done);
  });
});