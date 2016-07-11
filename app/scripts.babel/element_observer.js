const HANDLER_CLASS_PREFIX = 'tf__observer-';

class ElementObserver {
  constructor() {
    this._handlers = [];
    new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        Array.from(mutation.addedNodes).forEach(node => {
          if (!(node instanceof Element)) {
            return;
          }

          this._handlers.forEach(({ selector, handler }, i) => {
            if (node.matches(selector) &&
                !node.classList.contains(HANDLER_CLASS_PREFIX + i)) {
              handler(node);
            }
          });
        });
      });
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  forEach(selector, handler) {
    const handlerId = this._handlers.length;
    for (const node of Array.from(document.querySelectorAll(selector))) {
      handler(node);
      node.classList.add(HANDLER_CLASS_PREFIX + handlerId);
    }
    this._handlers.push({ selector, handler });
  }
}
