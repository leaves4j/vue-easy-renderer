'use strict';

const MemoryFS = require('memory-fs');

const mfs = new MemoryFS();
const storage = new Map();

exports.storage = storage;
exports.mfs = mfs;
