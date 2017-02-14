'use strict';

const {describe, it} = require('mocha');

describe('lib', () => {
  require('./compiler');
  require('./renderer');
});
