import { vnode, isVnode } from './vnode';


const xlinkRe = /^xlink:(.*)$/;
const XLINK_NS = 'http://www.w3.org/1999/xlink';

/**
 * @param {Element} parentNode
 * @param {Element|TextNode} node 
 * @param {Element|TextNode} domNode the reference node.
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
export function remove(modules, parentNode, domNode, node) {
  let res, i;

  for (const name in modules) {
    (i = modules[name]) && (i = i.unmounting) && i(domNode);
  }
  (i = domNode.__unmounting__) && i(domNode);

  if (parentNode && domNode.parentNode === parentNode) {
    node && parentNode.replaceChild(node, domNode) && (res = node);
    node == null && parentNode.removeChild(domNode) && (res = domNode);
  }

  else if (domNode && node) {
    res = node;
  }

  return res;
}

/**
 * Create a DOM node represented by `vnode`
 * @param {String|Number|Object} vnode a virtual node.
 * @param {Object} modules a hash of module, with keys equal module names.
 */
export function create(modules, vnode, mountedNodes) {
  if (vnode == null)  return null;

  if (typeof vnode === 'string' || typeof vnode === 'number')
    return document.createTextNode(vnode);

  let i;
  const ns = vnode.ns,
        attrs = vnode.attrs,
        tagName = vnode.tagName,
        children = vnode.children,
        elem = ns
          ? document.createElementNS(ns, tagName)
          : document.createElement(tagName);

  (i = attrs.hooks) && (i.mounted) && (mountedNodes.push(elem)) && (elem.__mounted__ = i.mounted);
  i && (i.updating) && (elem.__updating__ = i.updating);
  i && (i.unmounting) && (elem.__unmounting__ = i.unmounting);

  elem.__attrs__ = {};
  for (const name in attrs) {
    if (!(name in modules)) {
      setAttribute(elem, name, attrs[name]);
      elem.__attrs__[name] = attrs[name];
    }
  }

  for (const name in modules) {
    (i = modules[name]) && (i = i.creating) && (i(elem, attrs[name]));
  }
  (i = attrs.hooks) && (i = i.creating) && i(elem);

  children.forEach((child, i) => {
    let childElement;

    if (isVnode(child) || typeof child === 'string') {
      childElement = create(modules, child, mountedNodes);
    }
    // TODO: add thunk.
    else {
      i = childErrMsg(child);
      console.warn(i);
      return;
    }

    elem.appendChild(childElement);
  });

  return elem;
}

export function setAttribute(elem, name, value) {
  let msg, isNS = !!(elem.tagName === 'svg');

  switch(name) {
    case 'key':
      elem.__key__ = value;
      break;

    case 'className':
    case '_className':
      if (value.join) {
        value = value.join(' ')
      }
      
      elem.className = value;
      break;

    case 'hooks':
    case 'namespace':
      break;

    case 'children':
    case 'innerHTML':
      msg = attrErrMsg(elem, name);
      console.warn(msg);
      break;

    default:
      // Set property as long as possible.
      if (value && !isNS && (name in elem) && (name !== 'type')) {
        try {
          elem[name] = value ? value : void 0;
        } catch(e) {
          msg = attrErrMsg(elem, name);
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
export function emptyChildren(modules, elem) {
  if (elem && elem.childNodes && elem.childNodes.length) {
    let fc = elem.firstChild, lc = elem.lastChild;

    while(fc !== lc) {
      remove(modules, elem, lc);
      lc = elem.lastChild;
    }
    remove(modules, elem, fc);
  }
}


function attrErrMsg(elem, attr) {
  let selector = elem.tagName;

  selector = elem.id
    ? `${selector}#${elem.id}`
    : selector;
  selector = elem.className
    ? `${selector}.${elem.className.join('.')}`
    : selector;
  
    return `Failed to set "${attr}" on element "${selector}".`
}

function childErrMsg(obj) {
  let msg = 'Unrecognizable child: \n{\n';
  let fields = [];

  for (let name in obj) {
    fields.push('\t' + name + ': ' + obj[name]);
  }
  msg += fields.join(',\n');
  msg += '\n}\n';
  return msg;
}