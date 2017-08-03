

const test = require('ava');
const VueHead = require('../../lib/renderer/head.js');

test('VueHead.toHtmlString() should be ok', (t) => {
  const headOptions = {
    meta: [{
      name: '123',
    }],
    title: 'test',
    script: [
      { src: 'a.js' },
      { src: 'b.js' },
    ],
  };
  const vueHead = new VueHead(headOptions);
  const html = vueHead.toHtmlString();
  t.is(html, '<meta name="123">\n<title>test</title>\n<script src="a.js"></script>\n<script src="b.js"></script>\n');
});

