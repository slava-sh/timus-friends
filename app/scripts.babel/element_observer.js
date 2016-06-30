class ElementObserver {
  constructor() {
    this._handlers = [];
    this._observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof Element)) {
            continue;
          }

          for (const item of this._handlers) {
            if (node.matches(item.selector)) {
              console.log('online ' + item.selector);
              item.handler(node);
            }
          }
        }
      }
    });
  }

  forEach(selector, handler) {
    for (const node of Array.from(document.querySelectorAll(selector))) {
      console.log('offline ' + selector);
      handler(node);
    }
    this._handlers.push({ selector, handler });
  }

  observe() {
    this._observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
}
