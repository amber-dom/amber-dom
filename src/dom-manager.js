import { eventHookRe, XLINK_NS, xlinkRe } from "./util";
import VNode from './vnode';

export default domManager;

// dom mangager. Used internally.
const domManager = {
  append,
  insertBefore,
  remove,
  create,
  setAttribute,
  emptyChildren
};

/**
 * @param {Element} parentNode 
 * @param {Element} node 
 */
export function append(parentNode, node) {
  parentNode.appendChild(node);
}

/**
 * @param {Element} parentNode
 * @param {Element} node 
 * @param {Element} domNode the reference node.
 */
export function insertBefore(parentNode, node, domNode) {
  parentNode.insertBefore(node, domNode);
}

/**
 * Remove a child on a node if it exists.
 * @param {Element} parentNode the parent of the node to be removed.
 * @param {Element} domNode the node to be removed.
 * @param {Element} node Optional replacement of `domNode`.
 */
export function remove(parentNode, domNode, node) {
  let i, res, hooks = domNode.$hooks;

  if (parentNode && domNode.parentNode === parentNode) {
    if (hooks && (i = hooks.beforeRemove) && (typeof i === 'function')) {
      if (i(domNode) === false)
        return;
    }
    
    (node) && (parentNode.replaceChild(node, domNode)) && (res = node);
    (parentNode.removeChild(domNode)) && (res = domNode);
    
    if (hooks && (i = hooks.removed) && (typeof i === 'function')) {
      i(domNode);
    }
  }

  else if (domNode && node) {
    res = node;
  }

  else {
    console.warn(`The element ${node.id ? node.tagName+'#'+node.id : node.tagName} wasn't mounted on document.`)
  }
  
  return res;
}

/**
 * Create a DOM node represented by `vnode`
 * @param {String|Number|VNode} vnode 
 */
export function create(vnode) {
  // create a text node if it is a string or a number.
  if (typeof vnode === 'string' || typeof vnode === 'number')
    return document.createTextNode(vnode);

  const tagName = vnode.tagName,
        props = vnode.props,
        children = vnode.children,
        ns = vnode.ns,
        element = ns
          ? document.createElementNS(ns, tagName)
          : document.createElement(tagName);

  let i;

  // for next diff.
  element.$props = props;
  for (const propName in props) {
    const event = propName.match(eventHookRe);
    if (event) {
      const handler = typeof props[propName] === 'function'
        ? props[propName]
        : new Error(`Handler to ${event[1]} is not a function`);

      if (handler instanceof Error) {
        console.warn(`Failed to add listener for ${event[1]}: ${handler.message}`);
      }

      // for next diff.
      (element.$listeners || (element.$listeners = {}))[event[1]] = handler;
      element.addEventListener(event[1], handler, false);
    }

    else {
      setAttribute(element, propName, props[propName], !!ns);
    }
  }

  children.forEach((child, i) => {
    let childElement;

    if (child instanceof VNode || typeof child === 'string') {
      childElement = create(child);
    }

    // TODO: add thunk.

    else {
      console.warn(`Unrecognizable node: ${child}`);
    }

    element.appendChild(childElement);
  });

  // Invoke "created hooks"
  if ((i = vnode.hooks) && (i = i.created) && (typeof i === 'function')) {
    i(element);
  }
  element.$hooks && (element.$hooks = vnode.hooks);
  delete props.$hooks;

  return element;
}

/**
 * Set attribute/property on an element.
 * @param {Element} element 
 * @param {String} attrName 
 * @param {String} value 
 */
export function setAttribute(element, attrName, value, isNameSpaced) {
  let ns, oldValue;

  attrName = attrName === 'className' ? 'class' : attrName;

  switch(attrName) {
  case 'key':
    element.key = value;
    break;
  
  case 'style':   /** if style is an object, it'll always be patched. */
    oldValue = element.$style;

    if (!value || typeof value === 'string' || typeof oldValue === 'string') {
      // if `value` is an object, it will be reset below.
      element.style.cssText = value || '';
    }
    
    if (value && typeof value === 'object') {
      // set every old style field to empty.
      if (typeof oldValue !== 'string') {
        for (let i in oldValue) {
          if (!(i in value))
            element.style[i] = '';
        }
      }
      
      // you might be wondering why don't I compare the value before setting
      // it. In fact, no comparison is needed because it won't cause the browser's
      // repaint or reflow if the new value is the same as old one.
      for (let i in value) {
        element.style[i] = value[i];
      }
    }

    // for next diff.
    value && (element.$style = value);

    break;
  
  case 'class':
    element.className = value || '';
    break;

  case 'children':
    console.warn(`Failed to set "children" on element ${element.tagName}.`);
    break;

  case 'innerHTML':
    console.warn(`Failed to set "innerHTML" on a "${element.tagName.toLocaleLowerCase()}".`);
    break;

  default:
    if (!isNameSpaced && (attrName in element) && (attrName !== 'type')) {
      // set it as a property.
      try {
        element[attrName] = value ? value : '';
      } catch(e) {
        console.warn(`Failed to set attribute: ${attrName} on element "${element.id ? element.tagName + element.id : element.tagName }"`)
      }

      if (value == null) {
        element.removeAttribute(attrName);
      }
    }

    else {
      ns = isNameSpaced && !!(attrName.match(xlinkRe));
      // set it as an attribute.
      if (value && ns) {
        element.setAttributeNS(XLINK_NS, attrName, value);
      } else if (!value && ns) {
        element.removeAttributeNS(XLINK_NS, attrName);
      } else if (value) {
        element.setAttribute(attrName, value);
      } else {
        element.removeAttribute(attrName);
      }
    }
  }
}

/**
 * Empty an element's children.
 * Removing from the last child might cause less repaint and reflow.
 * @param {Element} element 
 */
export function emptyChildren(element) {
  if (element && element.childNodes && element.childNodes.length) {
    let fc = element.firstChild, lc = element.lastChild;

    while(fc !== lc) {
      remove(element, lc);
      lc = element.lastChild;
    }
    remove(element, fc);
  }
}