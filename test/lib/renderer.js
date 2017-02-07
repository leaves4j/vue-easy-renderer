'use strict';

const path = require('path');
const chai = require('chai');
const Compiler = require('../../lib/compiler');
const Renderer = require('../../lib/renderer');
const mfs = require('../../lib/mfs');

const expect = chai.expect;

describe('Renderer', () => {
  it('Renderer.getVueInstance() should be ok', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
    const compiler = new Compiler();
    const renderer = new Renderer(compiler);

    renderer.getVueInstance(filePath, {hello: 'world!'}).then(vueInstance => {
      expect(vueInstance).to.have.property('hello');
      expect(vueInstance.hello).to.equal('world!');
      mfs.unlinkSync(filePath);
      done();
    }).catch(e => {
      done(e);
      mfs.unlinkSync(filePath);
    });
  });
  it('Renderer.renderToString() should be ok', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
    const compiler = new Compiler();
    const renderer = new Renderer(compiler);

    renderer.renderToString(filePath, {hello: 'world!'}).then(string => {
      expect(string).to.contain('<div server-rendered="true" class="test" data-v-ae5aeefe>hello world!</div>');
      mfs.unlinkSync(filePath);
      done();
    }).catch(e => {
      done(e);
      mfs.unlinkSync(filePath);
    });
  });
  it('Renderer.renderToStream() should be ok', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
    const compiler = new Compiler();
    const renderer = new Renderer(compiler);

    renderer.renderToStream(filePath, {hello: 'world!'}).then(stream => {
      mfs.unlinkSync(filePath);
      done();
    }).catch(e => {
      done(e);
      mfs.unlinkSync(filePath);
    });
  });
  it('Renderer should be ok with store', done => {
    const filePath = path.resolve(__dirname, '../vue_file/store.vue');
    const compiler = new Compiler();
    const renderer = new Renderer(compiler, {useStore: 'auto'});

    renderer.renderToString(filePath, {world: 'world!'}).then(string => {
      expect(string).to.contain('<div server-rendered="true" class="test" data-v-4f52fa3c>hello world!</div>');
      mfs.unlinkSync(filePath);
      done();
    }).catch(e => {
      done(e);
      mfs.unlinkSync(filePath);
    });
  });
});