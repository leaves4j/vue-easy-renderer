// @flow

/**
 * Renderer base error
 * 
 * @class RendererError
 * @extends {Error}
 */
class BaseError extends Error {
  type: 'VueEasyRendererError';
  name: string;
  constructor(e: ?Error): void {
    super();
    this.type = 'VueEasyRendererError';
    if (e) {
      this.name = `[VueEasyRenderer]Error: ${e.name}`;
      this.stack = e.stack;
      this.message = e.message;
    }
  }
}

/**
 * render error
 * 
 * @class RenderError
 * @extends {RendererError}
 */
class RenderError extends BaseError {
  state: ?Object;
  component: string;
  constructor(e: ?Error): void {
    super(e);
    if (e) {
      this.name = `[VueEasyRenderer]RenderError: ${e.name}`;
    }
  }
}

module.exports = {
  BaseError,
  RenderError,
};
