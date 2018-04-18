import VNode from './vnode';
import { isArray, isEmpty } from './util';
export default h;


const classIdSpliter = /([\.#]?[^\s#.]+)/;
const spaceStriper = /^\s*|\s*$/;
const propSpliter = /\s*=\s*/;

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

  result.className && result.className.join(' ');
  return result;
}

/**
 * 
 * @param {String|Function} selector a built-in tag name or custom function that returns an object created by h.
 * @param {Object} props optional. any style, event listeners, and className should be put here.
 * @param {*} children optional children. Any string, instance of VNode will be fine.
 */
function h(selector, props, ...children) {
  var tagInfo, vnode;

  if (typeof selector === 'function') {
    // use `new` in case it is a class.
    return new selector(props, ...children);
  } else if (selector === 'text') {
    return children.length === 0
      ? String(props)
      : String(props) + ' ' + children.join(' ');
  }

  (props || (props = {}));

  // handle children re-maps.
  if ((props instanceof VNode) ||
      (typeof props === 'string') ||
      (typeof props === 'number')
    ) {
    children.unshift(props);
    props = {};
  }
  
  // handle children re-maps.
  if (isArray(props)) {
    children = [...props, ...children];
    props = {};
  }

  if (isArray(children[0])) {
    children = children[0];
  }

  // handle array-literal `className`.
  if (props.className && isArray(props.className)) {
    props.className = props.className.join(' ');
  }

  if (typeof selector === 'string') {
    tagInfo = parseSelector(selector);
    if (tagInfo.className) {
      props.className = props.className
        ? props.className + ' ' + tagInfo.className
        : tagInfo.className;
    }

    if (tagInfo.id) {
      props.id = props.id ? props.id : tagInfo.id;
    }

    return new VNode(tagInfo.tagName, props, children);
  } else {
    throw new Error('The first parameter to `h` function must be a string or a function.')
  }
}