export function addEvent(el, event: string, handler: Function): void {
  if (!el) {
    return;
  }
  if (el.attachEvent) {
    el.attachEvent('on' + event, handler);
  } else if (el.addEventListener) {
    el.addEventListener(event, handler, true);
  } else {
    el['on' + event] = handler;
  }
}

export function removeEvent(el, event: string, handler: Function): void {
  if (!el) {
    return;
  }
  if (el.detachEvent) {
    el.detachEvent('on' + event, handler);
  } else if (el.removeEventListener) {
    el.removeEventListener(event, handler, true);
  } else {
    el['on' + event] = null;
  }
}

export function getComputedStyle(elem, property?: string) {
  const computedStyle = elem.currentStyle || window.getComputedStyle(elem, null);
  return property ? computedStyle[property] : computedStyle;
}

export function getPosition(elem) {
  const doc = elem && elem.ownerDocument;
  const docElem = doc.documentElement;
  const body = doc.body;

  const box = elem.getBoundingClientRect ? elem.getBoundingClientRect() : { left: 0, top: 0 };

  const clientLeft = docElem.clientLeft || body.clientLeft || 0;
  const clientTop = docElem.clientTop || body.clientTop || 0;

  return { left: box.left - clientLeft, top: box.top - clientTop };
}

export function getSize(elem, mode = 'outside') {
  if (mode === 'inside') return { width: elem.clientWidth, height: elem.clientHeight };
  else if (mode === 'center')
    return {
      width: (elem.clientWidth + elem.offsetWidth) / 2,
      height: (elem.offsetHeight + elem.clientHeight) / 2
    };
  else if (mode === 'outside') return { width: elem.offsetWidth, height: elem.offsetHeight };
}

const dom = {
  hasClass(node, className) {
    const current = node.className || '';
    return (' ' + current + ' ').indexOf(' ' + className + ' ') !== -1;
  },
  addClass(node, className) {
    const current = node.className || '';
    if ((' ' + current + ' ').indexOf(' ' + className + ' ') === -1) {
      node.className = current ? current + ' ' + className : className;
    }
  },
  delClass(node, className) {
    const current = node.className || '';
    node.className = (' ' + current + ' ').replace(' ' + className + ' ', ' ').trim();
  }
};
export default dom;
