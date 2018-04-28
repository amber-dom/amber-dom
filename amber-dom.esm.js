var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

function events () {
  return {
    name: 'events',
    creating: updateListeners,
    updating: updateListeners
  };
}

function updateListeners(elem, events) {
  var handler = void 0,
      params = void 0,
      value = void 0;

  for (var name in events) {
    value = events[name];

    // a single listener
    if (typeof value === 'function') {
      handler = value;
    }

    // a listener with params.
    else if (value && !!value.shift && (handler = value.shift()) && typeof handler === 'function') {
        params = value;
      }

      // remove a listener.
      else if (value === void 0) {
          handler = void 0;
          params = void 0;
        } else {
          console.warn('Failed to add ' + name + ' listener.');
          continue;
        }

    (elem.__listeners__ || (elem.__listeners__ = {}))[name] = { handler: handler, params: params };
    elem.addEventListener(name, proxyEvents);
  }
}

function proxyEvents(ev) {
  var handler = void 0,
      params = void 0,
      elem = ev.currentTarget,
      listeners = elem.__listeners__;

  if (listeners && (handler = listeners[ev.type])) {
    params = handler.params;
    handler = handler.handler;

    if (handler && params != null) handler.apply(undefined, [ev].concat(toConsumableArray(params)));else if (handler) handler(ev);
  }
}

function style () {
  return {
    name: 'style',
    creating: updateInlineStyle,
    updating: updateInlineStyle
  };
}

function updateInlineStyle(elem, style) {
  var oldStyle = elem.__style__;

  if (!style || typeof style === 'string' || typeof oldStyle === 'string') {
    elem.style.cssText = style || '';
  }

  if (style && (typeof style === 'undefined' ? 'undefined' : _typeof(style)) === 'object') {
    // set every old style field to empty.
    if (typeof oldStyle !== 'string') {
      for (var i in oldStyle) {
        if (!(i in style)) elem.style[i] = '';
      }
    }

    for (var _i in style) {
      elem.style[_i] = style[_i];
    }
  }

  elem.__style__ = style;
}

function dataset () {
  return {
    name: 'dataset',
    creating: updateDataset,
    updating: updateDataset
  };
}

function updateDataset(elem, dataset) {
  var oldset = elem.dataset;

  if (dataset == null) {
    for (var key in oldset) {
      delete oldset[key];
    }
    return;
  }

  // remove something dosen't exist.
  for (var _key in oldset) {
    if (!(_key in dataset) || dataset[_key] == null) {
      delete oldset[_key];
    }
  }

  // update or add.
  for (var _key2 in dataset) {
    if (dataset && dataset[_key2] !== oldset[_key2]) {
      oldset[_key2] = dataset[_key2];
    }
  }
}

var svgRe = /(svg|SVG)/;
var SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Add namespace for `vnode` and recursively add it to its children.
 * @param {Object} vnode A vnode.
 * @param {String} ns A namespace.
 */
function addNS(vnode, ns) {
  var children = vnode.children;

  vnode.ns = ns;
  for (var i = 0, len = children.length; i < len; i++) {
    var child = children[i];

    if (isVnode(child) && child.tagName !== 'foreignObject') {
      addNS(child, ns);
    }
  }
}

/**
 * @param {String} tagName a tag name. Must be specified.
 * @param {Object} attrs attributes to set on DOM.
 * @param {Array} children can be an empty array.
 */
function vnode(tagName, attrs, children) {

  var i = void 0,
      ns = attrs.namespace || (svgRe.test(tagName) ? SVG_NS : void 0);
  var vnode = {
    tagName: !!ns ? tagName : tagName.toUpperCase(),
    attrs: attrs,
    key: attrs.key,
    children: children,
    isVnode: true
  };

  // set up namespace.
  ns && addNS(vnode, ns);
  (i = attrs.hooks) && (i = i.init) && i(vnode);

  return vnode;
}

function isVnode(vnode) {
  return vnode && vnode.tagName && vnode.isVnode === true;
}

var xlinkRe = /^xlink:(.*)$/;
var XLINK_NS = 'http://www.w3.org/1999/xlink';

/**
 * @param {Element} parentNode
 * @param {Element|TextNode} node 
 * @param {Element|TextNode} domNode the reference node.
 */
function insertBefore(parentNode, node, domNode) {
  parentNode.insertBefore(node, domNode);
}

/**
 * Remove a child on a node if it exists.
 * @param {Element} parentNode the parent of the node to be removed.
 * @param {Element} domNode the node to be removed.
 * @param {Element} node Optional replacement of `domNode`.
 */
function remove(modules, parentNode, domNode, node) {
  var res = void 0,
      i = void 0;

  for (var name in modules) {
    (i = modules[name]) && (i = i.unmounting) && i(domNode);
  }
  (i = domNode.__unmounting__) && i(domNode);

  if (parentNode && domNode.parentNode === parentNode) {
    node && parentNode.replaceChild(node, domNode) && (res = node);
    node == null && parentNode.removeChild(domNode) && (res = domNode);
  } else if (domNode && node) {
    res = node;
  }

  return res;
}

/**
 * Create a DOM node represented by `vnode`
 * @param {String|Number|Object} vnode a virtual node.
 * @param {Object} modules a hash of module, with keys equal module names.
 */
function create(modules, vnode$$1, mountedNodes) {
  if (vnode$$1 == null) return null;

  if (typeof vnode$$1 === 'string' || typeof vnode$$1 === 'number') return document.createTextNode(vnode$$1);

  var i = void 0;
  var ns = vnode$$1.ns,
      attrs = vnode$$1.attrs,
      tagName = vnode$$1.tagName,
      children = vnode$$1.children,
      elem = ns ? document.createElementNS(ns, tagName) : document.createElement(tagName);

  (i = attrs.hooks) && i.mounted && mountedNodes.push(elem) && (elem.__mounted__ = i.mounted);
  i && i.updating && (elem.__updating__ = i.updating);
  i && i.unmounting && (elem.__unmounting__ = i.unmounting);

  elem.__attrs__ = {};
  for (var name in attrs) {
    if (!(name in modules)) {
      setAttribute(elem, name, attrs[name]);
      elem.__attrs__[name] = attrs[name];
    }
  }

  for (var _name in modules) {
    (i = modules[_name]) && (i = i.creating) && i(elem, attrs[_name]);
  }
  (i = attrs.hooks) && (i = i.creating) && i(elem);

  children.forEach(function (child, i) {
    var childElement = void 0;

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

function setAttribute(elem, name, value) {
  var msg = void 0,
      isNS = !!(elem.tagName === 'svg');

  switch (name) {
    case 'key':
      elem.__key__ = value;
      break;

    case 'className':
    case '_className':
      if (value.join) {
        value = value.join(' ');
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
      if (value && !isNS && name in elem && name !== 'type') {
        try {
          elem[name] = value ? value : void 0;
        } catch (e) {
          msg = attrErrMsg(elem, name);
          console.warn(msg);
        }
      }

      // Set to property as a fall back.
      else {
          isNS = isNS && !!name.match(xlinkRe);
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
function emptyChildren(modules, elem) {
  if (elem && elem.childNodes && elem.childNodes.length) {
    var fc = elem.firstChild,
        lc = elem.lastChild;

    while (fc !== lc) {
      remove(modules, elem, lc);
      lc = elem.lastChild;
    }
    remove(modules, elem, fc);
  }
}

function attrErrMsg(elem, attr) {
  var selector = elem.tagName;

  selector = elem.id ? selector + '#' + elem.id : selector;
  selector = elem.className ? selector + '.' + elem.className.join('.') : selector;

  return 'Failed to set "' + attr + '" on element "' + selector + '".';
}

function childErrMsg(obj) {
  var msg = 'Unrecognizable child: \n{\n';
  var fields = [];

  for (var name in obj) {
    fields.push('\t' + name + ': ' + obj[name]);
  }
  msg += fields.join(',\n');
  msg += '\n}\n';
  return msg;
}

var mountedNodes = [];

/**
 * @param {Element|Text} domRoot 
 * @param {Object} vRoot a vnode tree root.
 */
function patch(modules, domRoot, vRoot) {
  var mounted = void 0,
      i = void 0;

  if (domRoot instanceof Element || domRoot instanceof Text) {
    for (var name in modules) {
      (i = modules[name]) && (i = i.prepatch) && i(domRoot, vRoot);
    }

    domRoot = patchElement(modules, domRoot, vRoot);
    while (mounted = mountedNodes.shift()) {
      (i = mounted.__mounted__) && typeof i === 'function' && i(mounted);
    }

    for (var _name in modules) {
      (i = modules[_name]) && (i = i.postpacth) && i(domRoot, vRoot);
    }
  }
  return domRoot;
}

/**
 * Patch a DOM node with a vnode.
 * @param {Element|Text} element 
 * @param {Object} vnode a vnode object. 
 * @param {Boolean} same If 2 nodes are already checked by `isSameNode`, it should be set true.
 */
function patchElement(modules, element, vnode$$1, same) {
  if (vnode$$1 == null || typeof vnode$$1 === 'boolean') vnode$$1 = '';

  var i = void 0;

  // 1. both text nodes.
  if (element.nodeType === 3 && typeof vnode$$1 === 'string') {
    var oldText = element.textContent || element.nodeValue;
    if (oldText !== vnode$$1) element.textContent = vnode$$1;
  }

  // 2. are the same node.
  else if (same || isSameNode(element, vnode$$1)) {
      patchAttrs(modules, element, vnode$$1);

      for (var name in modules) {
        (i = modules[name]) && (i = i.updating) && i(element, vnode$$1.attrs[name]);
      }
      (i = element.__updating__) && i(element);

      patchChildren(modules, element, vnode$$1);
    }

    // 3. not the same node.
    else {
        var node = create(modules, vnode$$1, mountedNodes);
        // replace the `element` with `node`.
        element = remove(modules, element.parentNode, element, node);
      }

  return element;
}

/**
 * See if 2 nodes are the same.
 * @param {Element|Text} element 
 * @param {Object} vnode 
 */
function isSameNode(element, vnode$$1) {
  return element.__key__ === vnode$$1.key && element.tagName === vnode$$1.tagName;
}

/**
 * Patch 2 same nodes.
 * @param {Element} element 
 * @param {Object} vnode 
 */
function patchAttrs(modules, element, vnode$$1) {
  var attrs = vnode$$1.attrs,
      oldAttrs = element.__attrs__;

  // Just ensure it is right if `element` was created by a vnode.
  if (oldAttrs == null) {
    oldAttrs = element.__attrs__ = oldAttrs == null ? {} : oldAttrs;
    for (var a = element.attributes, i = a.length; i--;) {
      oldAttrs[a[i].name] = a[i].value;
    }
  }

  // remove attributes not on vnode.
  for (var name in oldAttrs) {
    if (oldAttrs[name] && !(attrs && attrs[name])) {
      setAttribute(element, name, oldAttrs[name] = void 0);
    }
  }

  // add new & update attributes.
  for (var _name2 in attrs) {
    if (!(_name2 in modules) && (!(_name2 in oldAttrs) || attrs[_name2] !== (_name2 === 'value' || _name2 === 'checked' ? element[_name2] : oldAttrs[_name2]))) {
      setAttribute(element, _name2, oldAttrs[_name2] = attrs[_name2]);
    }
  }
}

/**
 * Patch an element's children
 * @param {Element} element 
 * @param {Object} vnode 
 */
function patchChildren(modules, element, vnode$$1) {
  var oldChildren = element.childNodes,
      vChildren = vnode$$1.children,
      oldLen = oldChildren.length,
      vLen = vChildren.length;

  // nothing to patch.
  if (vLen === 0 && oldLen === 0) {
    return;
  }

  // Special case: if vnode contains only 1 child.
  else if (vLen === 1) {
      var ch = vChildren[0],
          elemToMove = void 0;

      if (oldLen === 1 && isSameNode(oldChildren[0], ch)) {
        patchElement(modules, oldChildren[0], ch, true);
      } else {
        // Try to find a child node that match.
        for (var i = 1; i < oldLen; i++) {
          if (isSameNode(oldChildren[i], ch)) {
            patchElement(modules, oldChildren[i], ch, true);

            elemToMove = oldChildren[i];
            break;
          }
        }

        // If it wasn't found, create one from the vnode.
        if (elemToMove === void 0) {
          elemToMove = create(modules, ch, mountedNodes);
        }
        emptyChildren(modules, element);
        element.appendChild(elemToMove);
      }
    }

    // case 1: both have children.
    else if (oldLen !== 0 && vLen > 1) {
        var keyedChildren = void 0,
            vStart = 0,
            vEnd = vLen - 1,
            oldStartCh = element.firstChild,
            oldEndCh = element.lastChild,
            vStartCh = vChildren[vStart],
            vEndCh = vChildren[vEnd],
            _elemToMove = void 0;

        while (vStart <= vEnd && oldStartCh !== oldEndCh) {
          while (vStart <= vEnd && oldStartCh !== oldEndCh && oldStartCh && vStartCh && isSameNode(oldStartCh, vStartCh)) {
            patchElement(modules, oldStartCh, vStartCh, true);

            oldStartCh = oldStartCh.nextSibling;
            vStartCh = vChildren[++vStart];
          }

          while (vStart <= vEnd && oldStartCh !== oldEndCh && oldEndCh && vEndCh && isSameNode(oldEndCh, vEndCh)) {
            patchElement(modules, oldEndCh, vEndCh, true);

            oldEndCh = oldEndCh.previousSibling;
            vEndCh = vChildren[--vEnd];
          }

          // in case there is no reordering, but just some insertions or removals.
          if (oldStartCh === oldEndCh || vStart >= vEnd) break;

          // Reorder corner case 1.
          if (isSameNode(oldStartCh, vEndCh)) {
            patchElement(modules, oldStartCh, vEndCh, true);
            _elemToMove = oldStartCh;
            oldStartCh = oldStartCh.nextSibling;
            // place it right behind oldEndCh.
            insertBefore(element, _elemToMove, oldEndCh.nextSibling);

            vEndCh = vChildren[--vEnd];
          }

          // Reorder corner case 2.
          else if (isSameNode(oldEndCh, vStartCh)) {
              patchElement(modules, oldEndCh, vStartCh, true);
              _elemToMove = oldEndCh;
              oldEndCh = oldEndCh.previousSibling;
              // place it right in front of oldStartCh.
              insertBefore(element, _elemToMove, oldStartCh);

              vStartCh = vChildren[++vStart];
            }

            // insert or reorder.
            else {
                // try to find element in old list.
                if (keyedChildren == null) {
                  keyedChildren = createKeyMap(oldChildren, oldStartCh, oldEndCh);
                }

                _elemToMove = keyedChildren[vStartCh.key];

                // not found. Create a new child.
                if (_elemToMove == null) {
                  _elemToMove = create(modules, vStartCh, mountedNodes);
                  // place it right in front of oldStartCh
                  insertBefore(element, _elemToMove, oldStartCh);
                }
                // found. Move it to its place.
                else {
                    patchElement(modules, _elemToMove, startChild);
                    keyedChildren[_elemToMove.key] = void 0;
                    // place it right in front of oldStartCh
                    insertBefore(element, _elemToMove, oldStartCh);
                  }
                vStartCh = vChildren[++vStart];
              }
        }

        if (oldStartCh) {

          // oldStartCh is ahead of oldEndCh, which means
          // there are children to be removed.
          while (oldStartCh !== oldEndCh) {
            _elemToMove = oldStartCh;
            oldStartCh = oldStartCh.nextSibling;
            remove(modules, element, _elemToMove);
          }

          if (isSameNode(oldEndCh, vChildren[vEnd])) {
            patchElement(modules, oldEndCh, vChildren[vEnd], true);
            if (vStart === vEnd) {
              return;
            }
            vEnd--;
          } else {
            _elemToMove = oldEndCh;
            oldEndCh = oldEndCh.nextSibling;
            remove(modules, element, _elemToMove);
          }

          // append new children if there's any.
          for (var _i = vStart; _i <= vEnd; _i++) {
            insertBefore(element, create(modules, vChildren[_i], mountedNodes), oldEndCh);
          }
        }
      }

      // case 2: remove all DOM children.
      else if (oldLen !== 0) {
          emptyChildren(modules, element);
        }

        // case 3: insert new DOM children.
        else if (vLen !== 0) {

            for (var _i2 = 0, _newCh = vChildren[0]; _i2 < vLen; _i2++, _newCh = vChildren[_i2]) {
              element.appendChild(create(modules, _newCh, mountedNodes));
            }
          }
}

/**
 * Create a map of keyed children.
 * @param {NodeList} children
 * @param {Node} start the node to start from.
 * @param {Node} end  the node to end with
 * @returns { {key: Node} } a map with key equals key, value equals a node associated with this key.
 */
function createKeyMap(children, start, end) {
  var keyedChildren = {};

  if (start === end && start.key) {
    keyedChildren[String(start.key)] = start;
  }

  while (start !== end) {
    if (start.key != null) {
      keyedChildren[String(start.key)] = start;
    }
    start = start.nextSibling;
  }

  if (start === end && start.key) {
    keyedChildren[String(start.key)] = start;
  }

  return keyedChildren;
}

var classIdSpliter = /([\.#]?[^\s#.]+)/;
var stack = []; // internal stack for parsing children.

/**
 * A selector might contain a tag name followed by some CSS selector.
 * This function was stripped and modiffied from hyperscript's  parseClass.
 * @see https://github.com/hyperhype/hyperscript/blob/master/index.js
 * @param {String} selector 
 */
function parseSelector(selector) {
  var parts = selector.split(classIdSpliter);
  var result = {};

  parts.forEach(function (part) {
    if (part === '') return;

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
    return new (Function.prototype.bind.apply(selector, [null].concat(toConsumableArray(Array.prototype.slice.call(arguments, 1)))))();
  }

  var tagInfo = void 0,
      children = [],
      child = void 0,
      lastPrimitive = false;

  attrs || (attrs = {});

  // collect children
  for (var i = arguments.length; i-- > 2;) {
    stack.push(arguments[i]);
  }

  // if attrs is any of these below, it must be a child.
  if (isVnode(attrs) || typeof attrs === 'string' || typeof attrs === 'number' || typeof attrs === 'boolean' || attrs.pop != null) {
    stack.push(attrs);
    attrs = {};
  }

  // handle nested children if there's any.
  var idxKey = 0;
  while (stack.length) {
    if ((child = stack.pop()) && child.pop !== void 0) {
      for (var _i = child.length; _i--;) {
        stack.push(child[_i]);
      }
    } else {
      child = child == null ? '' : child;
      child = typeof child === 'boolean' ? '' : child;
      child = typeof child === 'number' ? String(child) : child;

      if (lastPrimitive && typeof child === 'string') {
        children[children.length - 1] += child;
      } else {
        if (isVnode(child) && child.attrs.key == null) {
          child.key = child.attrs.key = idxKey++;
        }
        children.push(child);
        lastPrimitive = typeof child === 'string' ? true : false;
      }
    }
  }

  // Case 2: `selector` is 'text'. 
  if (selector === 'text') {
    return children.length === 0 ? '' : children.join('');
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
    } else {
      throw new Error('Unrecognized selector: ' + selector + '.');
    }
}

var modules = {
  style: style,
  events: events,
  dataset: dataset,
  all: function all() {
    return [style(), events(), dataset()];
  }
};

/**
 * Initialize modules.
 * @param {Array|Object|null} mods an array of modules.
 */
function init(mods) {
  var modules = {};

  mods || (mods = []);

  if (typeof mods.pop === 'function') {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = mods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var mod = _step.value;

        if (isMod(mod)) {
          modules[mod.name] = mod;
        } else {
          errMsg(mods);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  } else if (isMod(mods)) {
    modules[mods.name] = mods;
  } else {
    errMsg(mods);
  }

  return {
    patch: function patch$$1(elem, vnode) {
      return patch(modules, elem, vnode);
    },
    createElement: function createElement(vnode) {
      var mountedNodes = [];
      var root = create(modules, vnode, mountedNodes);
      var mounted = void 0,
          i = void 0;

      while (mounted = mountedNodes.shift()) {
        (i = mounted.__mounted__) && typeof i === 'function' && i(mounted);
      }
      return root;
    }
  };
}

function isMod(obj) {
  return obj != null && typeof obj.name === 'string' && obj.name.length;
}

function errMsg(mod) {
  if (mod == null) return 'Given a null or undefined as module.';

  var msg = 'Unrecognized module: \n{\n';
  var fields = [];
  for (var name in mod) {
    fields.push('\t' + name + ': ' + mod[name]);
  }msg += fields.join(',\n\n');
  msg += '\n}\n';
  if (typeof mod === 'function') {
    msg += 'Did you just pass in a module generator function?';
  } else {
    msg += 'A module must contain a a string name.';
  }
  return msg;
}

export { modules, init, h };
