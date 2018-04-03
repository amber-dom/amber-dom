import VNode from './vnode';
import isArray from './isArray';
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
  return result;
}

function h(tagName, props, ...children) {
  var tagInfo, vnode;

  // handle no-props.
  if (
      (props && isArray(props)) ||
      (props && typeof props === 'string')
    ) {
    children = props;
    props = {};
  }

  (props || (props = {}));
  (children || (children = []));
  (props.className || (props.className = []));

  // handle object-literal `style`.
  if (props.style && typeof props.style === 'object') {
    let style = '';

    for (const key in props.style) {
      style += `${key}: ${props.style[key]}; `;
    }
    props.style = style;
  }

  // handle string type className.
  if (props.className && typeof props.className === 'string') {
    props.className = props.className.split(/\s+/);
  }

  if (typeof tagName === 'string') {
    tagInfo = parseTagName(tagName);
    (tagInfo.className || (tagInfo.className = [])).forEach((name) => {
      (props.className || (props.className = [])).push(name);
    });
    // any children will be handled by VNode, remember there's no
    // VText.
    return new VNode(tagInfo.tagName, props, children);
  } else if (typeof tagName === 'function') {
    // use `new` in case it is a class.
    return new tagName(props, children);
  }
}