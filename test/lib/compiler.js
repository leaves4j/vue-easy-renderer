'use strict';

const path = require('path');
const Compiler = require('../../lib/compiler');
const mfs = require('../../lib/mfs');

describe('Compiler', () => {
  it('Compiler.compile() should be ok with vue file', done => {
    const filePath = path.resolve(__dirname, '../vue_file/simple.vue');
    const compiler = new Compiler();
    compiler.compile(filePath).then(() => {
      const file = mfs.readFileSync(filePath);
      if (file) {
        done();
      } else {
        done('compiler file write fail');
      }
      mfs.unlinkSync(filePath);
    }).catch(e => {
      done(e);
      mfs.unlinkSync(filePath);
    });
  });
});