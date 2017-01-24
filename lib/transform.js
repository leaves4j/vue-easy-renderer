'use strict';

const stream = require('stream');

class RenderStreamTransform extends stream.Transform {
  constructor(head, tail, options) {
    super(options);
    this.head = head;
    this.tail = tail;
    this.fistFlag = true;
  }

  _transform(chunk, encoding, callback) {
    if (this.fistFlag) {
      this.push(new Buffer(this.head));
      this.fistFlag = false;
    }
    this.push(chunk);
    callback();
  }

  end() {
    this.push(new Buffer(this.tail));
    this.push(null);
  }
}

module.exports = RenderStreamTransform;
