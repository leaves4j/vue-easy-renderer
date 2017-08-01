// @flow

class VueHead {
  options: Object;
  constructor(options: Object) {
    this.options = options;
  }
  toHtmlString(): string {
    let htmlString = '';
    if (this.options) {
      Object.keys(this.options).forEach((optionKey) => {
        if (Array.isArray(this.options[optionKey])) {
          this.options[optionKey].forEach((attrs) => {
            htmlString += VueHead.getTagHtmlString(optionKey, attrs);
          });
        } else if (typeof this.options[optionKey] === 'string') {
          htmlString += VueHead.getTagHtmlString(optionKey, { innerHtml: this.options[optionKey] });
        }
      });
    }
    return htmlString;
  }

  static getTagHtmlString(tag: string, attrs: Object): string {
    let attrsString = '';
    let contentString = '';
    if (attrs) {
      Object.keys(attrs).forEach((key) => {
        if (key === 'innerHtml') {
          contentString = attrs[key];
        } else {
          attrsString += ` ${key}="${attrs[key]}"`;
        }
      });
    }
    let htmlString = '';
    if (VueHead.isClosedTag(tag)) {
      htmlString = `<${tag}${attrsString}>${contentString}</${tag}>\n`;
    } else {
      htmlString = `<${tag}${attrsString}>\n`;
    }
    return htmlString;
  }
  static isClosedTag(tag: string): boolean {
    const tags = ['meta', 'link', 'base'];
    return tags.findIndex(x => x === tag) === -1;
  }
  static headMerge(head: Object, baseHead: Object): Object {
    const newHead = {};
    const keys = ['title', 'titleTemplate', 'htmlAttrs', 'bodyAttrs', 'base', 'meta', 'link', 'style', 'script', 'noscript'];
    keys.forEach((key) => {
      if (head[key] && baseHead[key]) {
        if (Array.isArray(baseHead[key])) {
          newHead[key] = [];
          baseHead[key].forEach(item => newHead[key].push(item));
          head[key].forEach(item => newHead[key].push(item));
        } else {
          newHead[key] = head[key];
        }
      } else if (head[key] || baseHead[key]) {
        newHead[key] = head[key] || baseHead[key];
      }
    });
    return newHead;
  }
}

module.exports = VueHead;
