const path = require('path');
const test = require('ava');
const MemoryFs = require('memory-fs');
const Compiler = require('../../lib/renderer/compiler');

test('Compiler.constructor(), CompilerOptions.global', async (t) => {
  const compiler = new Compiler(new MemoryFs(), { global: { APP_VERSION: '1.0.0' } });
  const vueOptions = await compiler.import(path.resolve(__dirname, '../vue_file/compiler/options_global.vue'));
  t.is(vueOptions.default.data().appVersion, '1.0.0');
});

test('Compiler.constructor(), CompilerOptions.config', async (t) => {
  const webpackOptions = {
    module: { rules: [{ test: /\.jpg$/, use: { loader: 'null-loader' } }] },
  };
  const compiler = new Compiler(new MemoryFs(), { config: webpackOptions });
  const vueOptions = await compiler.import(path.resolve(__dirname, '../vue_file/compiler/options_config.vue'));
  t.is(vueOptions.default.name, 'config');
});

test('Compiler.import', async (t) => {
  const compiler = new Compiler(new MemoryFs());
  const vueOptions = await compiler.import(path.resolve(__dirname, '../vue_file/compiler/import.vue'));
  t.is(vueOptions.default.name, 'import');
});

test('Compiler.import with es-next', async (t) => {
  const compiler = new Compiler(new MemoryFs());
  const vueOptions = await compiler.import(path.resolve(__dirname, '../vue_file/compiler/es_next.vue'));
  t.is(vueOptions.default.name, 'ESNext');
});

test('Compiler.import when parallel', async (t) => {
  const compiler = new Compiler(new MemoryFs());
  const filePath = path.resolve(__dirname, '../vue_file/compiler/parallel.vue');
  const [file1, file2] = await Promise.all([
    compiler.import(filePath),
    compiler.import(filePath),
  ]);
  t.is(file1, file2);
  t.is(Compiler.cacheMap.get(filePath).default.name, 'parallel');
});

test('Compiler.load', async (t) => {
  const compiler = new Compiler(new MemoryFs());
  const path1 = path.resolve(__dirname, '../vue_file/compiler/load_1.vue');
  const path2 = path.resolve(__dirname, '../vue_file/compiler/load_2.vue');
  await compiler.load([path1, path2]);
  t.is(Compiler.cacheMap.get(path1).default.name, 'load1');
  t.is(Compiler.cacheMap.get(path2).default.name, 'load2');
});
