'use strict';

const {describe, it} = require('mocha');
const chai = require('chai');
const VueHead = require('../../lib/head.js');

const expect = chai.expect;
describe('VueHead', () => {
  it('VueHead.toHtmlString() should be ok', () => {
    const headOptions = {
      meta: [{
        name: '123'
      }],
      title: 'test',
      script: [
        {src: 'a.js'},
        {src: 'b.js'}
      ]
    };
    const vueHead = new VueHead(headOptions);
    const html = vueHead.toHtmlString();
    expect(html).equal('<meta name="123">\n<title>test</title>\n<script src="a.js"></script>\n<script src="b.js"></script>\n');
  });
});