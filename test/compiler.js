const path = require('path');
const test = require('ava');
const MemoryFs = require('memory-fs');
const Compiler = require('../lib/renderer/compiler');

test('Compiler.import', async (t) => {
  const compiler = new Compiler(new MemoryFs(), { basePath: path.resolve(__dirname, './vue_file') });
  const vueOptions = await compiler.import(path.resolve(__dirname, './vue_file/store.vue'));
  t.truthy(vueOptions.default);
});
test('Compiler.load', async (t) => {
  const compiler = new Compiler(new MemoryFs(), { basePath: path.resolve(__dirname, './vue_file') });
  const preloadFiles = [
    path.resolve(__dirname, './vue_file/store.vue'),
    path.resolve(__dirname, './vue_file/simple.vue'),
  ];
  await compiler.load(preloadFiles);
  const startTime = Date.now();
  const vueOptions = await compiler.import(path.resolve(__dirname, './vue_file/store.vue'));
  const endTime = Date.now();
  t.true(endTime - startTime < 10);
  t.truthy(vueOptions.default);
});
