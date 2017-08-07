

const path = require('path');
const test = require('ava');
const MemoryFS = require('memory-fs');
const Compiler = require('../../lib/renderer/compiler');
const Renderer = require('../../lib/renderer/renderer');


test('Renderer.constructor() should be ok with options.head', async (t) => {
  const filePath = path.resolve(__dirname, '../vue_file/simple_head.vue');
  const compiler = new Compiler(new MemoryFS());
  const renderer = new Renderer(compiler);
  try {
    const string = await renderer.renderToString(filePath, { hello: 'world!' });
    t.true(string.includes('<title>TITLE_TEST</title'));
  } catch (e) {
    t.fail(e);
  }
});
test.cb('Renderer.constructor() should be ok with options.preCompile', (t) => {
  const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
  const compiler = new Compiler(new MemoryFS());
  const renderer = new Renderer(compiler, { preCompile: [filePath] });

  renderer.on('ready', async () => {
    const startTime = Date.now();
    const vueOptions = await compiler.import(path.resolve(__dirname, '../vue_file/simple.vue'));
    const endTime = Date.now();
    t.true(endTime - startTime < 10);
    t.truthy(vueOptions.default);
    t.end();
  });
});
test('Renderer.constructor() should be ok with options.global', async (t) => {
  const filePath = path.resolve(__dirname, '../vue_file/simple_global.vue');
  const compiler = new Compiler(new MemoryFS(), { global: { APP_VERSION: 'v1.0.0' } });
  const renderer = new Renderer(compiler, { global: { APP_VERSION: 'v1.0.0' } });
  const string = await renderer.renderToString(filePath, {});

  t.true(string.includes('<script src="/app.js?_v=v1.0.0" defer="true">'));
  t.true(string.includes('<script>window.APP_VERSION = "v1.0.0"; </script>'));
});
test('renderer.getComponent() should be ok', async (t) => {
  const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
  const compiler = new Compiler(new MemoryFS());
  const renderer = new Renderer(compiler);

  const component = await renderer.getComponent(filePath, { state: { hello: 'world!' } });
  t.is(component.hello, 'world!');
});
test('renderer.renderToString() should be ok', async (t) => {
  const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
  const compiler = new Compiler(new MemoryFS());
  const renderer = new Renderer(compiler);
  renderer.on('error', e => t.fail(e));
  const string = await renderer.renderToString(filePath, { hello: 'world!' });
  t.true(string.includes('hello world!'));
});

test('renderer.renderToString() should be ok with option pure', async (t) => {
  const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
  const compiler = new Compiler(new MemoryFS());
  const renderer = new Renderer(compiler);
  renderer.on('error', e => t.fail(e));
  const string = await renderer.renderToString(filePath, { hello: 'world!' }, { pure: true });
  t.true(string.includes('hello world!'));
  t.false(string.includes('html'));
});

test('renderer.renderToStream() should be ok', async (t) => {
  const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
  const compiler = new Compiler(new MemoryFS());
  const renderer = new Renderer(compiler);
  await renderer.renderToStream(filePath, { hello: 'world!' });
  t.pass();
});

test('Renderer should be ok with store', async (t) => {
  const filePath = path.resolve(__dirname, '../vue_file/store.vue');
  const compiler = new Compiler(new MemoryFS());
  const renderer = new Renderer(compiler, { useStore: 'auto' });
  renderer.on('error', e => t.fail(e));
  const string = await renderer.renderToString(filePath, { world: 'world!' });
  t.true(string.includes('hello world!'));
});

test.cb('renderer.on(\'ready\') should be ok', (t) => {
  const compiler = new Compiler(new MemoryFS(), { basePath: path.resolve(__dirname, '../vue_file') });
  const renderer = new Renderer(compiler);
  renderer.on('ready', () => {
    t.pass();
    t.end();
  });
  renderer.on('error', (e) => {
    t.fail(e);
    t.end();
  });
});

