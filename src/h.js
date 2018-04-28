import { vnode, isVnode } from './vnode';
export default h;


const classIdSpliter = /([\.#]?[^\s#.]+)/;
const spaceStriper = /^\s*|\s*$/;
const propSpliter = /\s*=\s*/;
const stack = [];   // internal stack for parsing children.

/**
 * A selector might contain a tag name followed by some CSS selector.
 * This function was stripped and modiffied from hyperscript's  parseClass.
 * @see https://github.com/hyperhype/hyperscript/blob/master/index.js
 * @param {String} selector 
 */
function parseSelector(selector) {
  const parts = selector.split(classIdSpliter);
  const result = {};

  parts.forEach(part => {
    if (part === '')  return;

    if (!result.tagName) {
      result.tagName = part;
    } else if (part[0] === '.') {
      (result.className || (result.className = [])).push(part.substr(1));
    } else if (part[0] === '#') {
      result.id = part.substr(1);
    }
  });

  result.className && (result.className = result.className.join(' '));
  return result;
}

/**
 * Original propto: h(selector, props, ...children).
 * 
 * @param {String|Function} selector a built-in tag name or custom function that returns an object created by h.
 * @param {Object} attrs optional. any style, event listeners, and className should be put here.
 * @param {*} rest optional children. Can be nested.
 */
function h(selector, attrs) {
  // Case 1: `selector` is a function.
  if (typeof selector === 'function') {
    // use `new` in case it is a class.
    return new selector(...Array.prototype.slice.call(arguments, 1));
  }

  let tagInfo, children = [], child, lastPrimitive = false;

  (attrs || (attrs = {}))

  // collect children
  for (let i = arguments.length; i-- > 2; ) {
    stack.push(arguments[i]);
  }

  // if attrs is any of these below, it must be a child.
  if (isVnode(attrs) ||
    (typeof attrs === 'string') ||
    (typeof attrs === 'number') ||
    (typeof attrs === 'boolean') ||
    (attrs.pop != null)
  ) {
    stack.push(attrs);
    attrs = {};
  }

  // handle nested children if there's any.
  let idxKey = 0;
  while (stack.length) {
    if ((child = stack.pop()) && child.pop !== void 0) {
      for (let i = child.length; i--;)  stack.push(child[i]);
    }

    else {
      child = child == null ? '' : child;
      child = typeof child === 'boolean' ? '' : child;
      child = typeof child === 'number' ? String(child) : child;

      if (lastPrimitive && typeof child === 'string') {
        children[children.length - 1] += child;
      }

      else {
        if (isVnode(child) && (child.attrs.key == null)) {
          child.key = child.attrs.key = idxKey++;
        }
        children.push(child);
        lastPrimitive = typeof child === 'string' ? true : false;
      }
    }
  }

  // Case 2: `selector` is 'text'. 
  if (selector === 'text') {
    return children.length === 0
      ? ''
      : children.join('');
  }

  // Case 3: `selector` is a selector.
  else if (typeof selector === 'string') {
    tagInfo = parseSelector(selector);
    if (tagInfo.className) {
      attrs._className = tagInfo.className;
    }

    if (tagInfo.id) {
      attrs.id = attrs.id ? attrs.id : tagInfo.id;
    }

    return vnode(tagInfo.tagName, attrs, children);
  }
  
  else {
    throw new Error(`Unrecognized selector: ${selector}.`)
  }
}