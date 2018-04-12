import VNode from '../vnode/index';
import { isArray, isEmpty } from '../util';
export default h;


const classIdSpliter = /([\.#]?[^\s#.]+)/;
const spaceStriper = /^\s*|\s*$/;
const propSpliter = /\s*=\s*/;

function parseTagName(tagName) {
  const parts = tagName.split(classIdSpliter);
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
 * @param {String|Function} tagName a built-in tag name or custom function that returns an object created by h.
 * @param {Object} props optional. any style, event listeners, and className should be put here.
 * @param {*} children optional children. Any string, instance of VNode will be children.
 */
function h(tagName, props, ...children) {
  var tagInfo, vnode;

  if (typeof tagName === 'function') {
    // use `new` in case it is a class.
    return new tagName(props, ...children);
  }

  (props || (props = {}));
  (children || (children = []));

  // handle children re-maps.
  if ((props instanceof VNode) ||
      (typeof props === 'string')
    ) {
    children.unshift(props);
    props = {};
  }
  
  // handle children re-maps.
  if (isArray(props)) {
    children = [...props, children];
    props = {};
  }

  // handle object-literal `style`.
  if (props.style && typeof props.style === 'object') {
    let style = '';

    for (const key in props.style) {
      style += `${key}: ${props.style[key]}; `;
    }
    props.style = style;
  }

  // handle array-literal `className`.
  if (props.className && isArray(props.className)) {
    props.className = props.className.join(' ');
  }

  if (typeof tagName === 'string') {
    tagInfo = parseTagName(tagName);
    if (tagInfo.className) {
      (props.className || (props.className = ''));
      props.className += ' ' + tagInfo.className;
    }
    if (tagInfo.id) {
      props.id = props.id ? props.id : tagInfo.id;
    }
    // any children will be handled by VNode, remember there's no
    // VText.
    return new VNode(tagInfo.tagName, props, children);
  } else {
    throw new Error('The first parameter to `h` function must be a string or a function.')
  }
}