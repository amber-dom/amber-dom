import { modules } from './module-manager';
import VNode from './vnode';


const xlinkRe = /^xlink:(.*)$/;
const XLINK_NS = 'http://www.w3.org/1999/xlink';


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
  let res;

  if (parentNode && domNode.parentNode === parentNode) {
    node && parentNode.replaceChild(node, domNode) && (res = node);
    parentNode.removeChild(domNode) && (res = domNode);
  }

  else if (domNode && node) {
    res = node;
  }

  return res;
}

/**
 * Create a DOM node represented by `vnode`
 * @param {String|Number|VNode} vnode 
 */
export function create(vnode) {
  if (vnode == null)  return null;

  if (typeof vnode === 'string' || typeof vnode === 'number')
    return document.createTextNode(vnode);

  let i;
  const ns = vnode.ns,
        attrs = vnode.attrs,
        modAttrs = vnode.modAttrs,
        tagName = vnode.tagName,
        children = vnode.children,
        elem = ns
          ? document.createElementNS(ns, tagName)
          : document.createElement(tagName);


  elem.__attrs__ = attrs;
  for (const name in attrs) {
    setAttribute(elem, name, attrs[name]);
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

    elem.appendChild(childElement);
  });

  for (const name in modules) {
    (i = modules[name]) && (i = i.creating) && (i(elem, modAttrs[name]));
  }

  return elem;
}

export function setAttribute(elem, name, value) {
  let msg, isNS = !!(elem.tagName === 'svg');

  switch(name) {
    case 'key':
      elem.__key__ = value;
      break;

    case 'namespace':
      break;

    case 'children':
    case 'innerHTML':
      msg = failMsg(elem, name);
      console.warn(msg);
      break;

    default:
      // Set property as long as possible.
      if (value && !isNS && (name in elem) && (name !== 'type')) {
        try {
          elem[name] = value ? value : void 0;
        } catch(e) {
          msg = failMsg(elem, name);
          console.warn(msg);
        }
      }

      // Set to property as a fall back.
      else {
        isNS = isNS && !!(name.match(xlinkRe));
        if (value && isNS) {
          elem.setAttributeNS(XLINK_NS, name, value);
        } else if (!value && isNS) {
          elem.removeAttributeNS(XLINK_NS, name);
        } else if (value) {
          elem.setAttribute(name, value);
        } else {
          elem.removeAttribute(name);
        }
      }
    }
}

/**
 * Empty an element's children.
 * Remove from the last child might cause less repaint and reflow.
 * @param {Element} elem
 */
export function emptyChildren(elem) {
  if (elem && elem.childNodes && elem.childNodes.length) {
    let fc = elem.firstChild, lc = elem.lastChild;

    while(fc !== lc) {
      remove(elem, lc);
      lc = elem.lastChild;
    }
    remove(elem, fc);
  }
}


function failMsg(elem, attr) {
  let selector = elem.tagName;

  selector = elem.id
    ? `${selector}#${elem.id}`
    : selector;
  selector = elem.className
    ? `${selector}.${elem.className.join('.')}`
    : selector;
  
    return `Failed to set "${attr}" on element "${selector}".`
}