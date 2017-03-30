'use strict';

class VueHead {
  constructor(options) {
    this.options = options;
  }
  toHtmlString() {
    let htmlString = '';
    if (this.options) {
      Object.keys(this.options).forEach(option_key => {
        if (Array.isArray(this.options[option_key])) {
          this.options[option_key].forEach(attrs => {
            htmlString += VueHead.getTagHtmlString(option_key, attrs);
          });
        } else if (typeof this.options[option_key] === 'string') {
          htmlString += VueHead.getTagHtmlString(option_key, {innerHtml: this.options[option_key]});
        }
      });
    }
    return htmlString;
  }

  static getTagHtmlString(tag, attrs) {
    let attrsString = '';
    let contentString = '';
    if (attrs) {
      Object.keys(attrs).forEach(key => {
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
  static isClosedTag(tag) {
    const tags = ['meta', 'link', 'base'];
    return tags.findIndex(x => x === tag) === -1;
  }
}

module.exports = VueHead;