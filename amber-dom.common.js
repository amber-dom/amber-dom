'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var moduleManager = {
  addModules: addModules,
  rmModules: rmModules,
  initModules: initModules
};

var modules = {};

/**
 * Add an array of modules.
 * @param {Array|Object} mods an array of modules to add.
 */
function addModules(mods) {
  if (mods && !!mods.pop) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = mods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var mod = _step.value;

        if (isMod(mod)) {
          modules[mod.name] = mod;
        } else {
          var msg = errMsg(mod);
          console.warn(msg);
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
    var _msg = errMsg(mods);
    console.warn(_msg);
  }
}

/**
 * Initialize modules.
 * @param {Array} mods an array of modules.
 */
function initModules(mods) {
  for (var name in modules) {
    modules[name] = void 0;
  }

  if (mods != null) {
    addModules(mods);
  }
}

/**
 * Remove module(s).
 * @param {Array} mods an array of module names.
 */
function rmModules(mods) {
  if (mods && !!mods.pop) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = mods[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var name = _step2.value;

        modules[name] = void 0;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  } else if (mods) {
    modules[mods] = void 0;
  }
}

function isMod(obj) {
  return obj != null && obj.name && obj.creating && typeof obj.creating === 'function' && obj.updating && typeof obj.updating === 'function';
}

function errMsg(mod) {
  if (mod == null) return 'Given a null or undefined object as module.';

  var msg = 'Unrecognized module: \n{\n';
  for (var name in mod) {
    msg += '  ' + name + ': ' + mod[name] + '\n';
  }msg += '}';
  return msg;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var svgRe = /(svg|SVG)/;
var SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Add namespace for `vnode` and recursively add it to its children.
 * @param {VNode} vnode A vnode.
 * @param {String} ns A namespace.
 */
function addNS(vnode, ns) {
  var children = vnode.children;

  vnode.ns = ns;
  for (var i = 0, len = children.length; i < len; i++) {
    var child = children[i];

    if (child instanceof VNode && child.tagName !== 'foreignObject') {
      addNS(child, ns);
    }
  }
}

var VNode =
/**
 * @param {String} tagName a tag name. Must be specified.
 * @param {Object|null} attrs attributes to set on DOM.
 * @param {Array|null} children can be an empty array.
 */
function VNode(tagName, attrs, children) {
  classCallCheck(this, VNode);

  attrs || (attrs = {});
  children || (children = []);

  var ns = attrs.namespace || (svgRe.test(tagName) ? SVG_NS : void 0);

  this.tagName = !!ns ? tagName : tagName.toUpperCase();
  this.attrs = {};
  this.modAttrs = {};
  this.key = attrs.key;
  this.children = children;

  // separate module-managed attrs and self-managed attrs.
  for (var name in attrs) {
    if (!(name in modules)) {
      this.attrs[name] = attrs[name];
    } else {
      this.modAttrs[name] = attrs[name];
    }
  }

  // set up namespace.
  ns && addNS(this, ns);
};

var xlinkRe = /^xlink:(.*)$/;
var XLINK_NS = 'http://www.w3.org/1999/xlink';

/**
 * @param {Element} parentNode
 * @param {Element} node 
 * @param {Element} domNode the reference node.
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
function remove(parentNode, domNode, node) {
  var res = void 0;

  if (parentNode && domNode.parentNode === parentNode) {
    node && parentNode.replaceChild(node, domNode) && (res = node);
    parentNode.removeChild(domNode) && (res = domNode);
  } else if (domNode && node) {
    res = node;
  }

  return res;
}

/**
 * Create a DOM node represented by `vnode`
 * @param {String|Number|VNode} vnode 
 */
function create(vnode) {
  if (vnode == null) return null;

  if (typeof vnode === 'string' || typeof vnode === 'number') return document.createTextNode(vnode);

  var i = void 0;
  var ns = vnode.ns,
      attrs = vnode.attrs,
      modAttrs = vnode.modAttrs,
      tagName = vnode.tagName,
      children = vnode.children,
      elem = ns ? document.createElementNS(ns, tagName) : document.createElement(tagName);

  elem.__attrs__ = attrs;
  for (var name in attrs) {
    setAttribute(elem, name, attrs[name]);
  }

  children.forEach(function (child, i) {
    var childElement = void 0;

    if (child instanceof VNode || typeof child === 'string') {
      childElement = create(child);
    }

    // TODO: add thunk.

    else {
        console.warn('Unrecognizable node: ' + child);
      }

    elem.appendChild(childElement);
  });

  for (var _name in modules) {
    (i = modules[_name]) && (i = i.creating) && i(elem, modAttrs[_name]);
  }

  return elem;
}

function setAttribute(elem, name, value) {
  var msg = void 0,
      isNS = !!(elem.tagName === 'svg');

  switch (name) {
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
      if (value && !isNS && name in elem && name !== 'type') {
        try {
          elem[name] = value ? value : void 0;
        } catch (e) {
          msg = failMsg(elem, name);
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
function emptyChildren(elem) {
  if (elem && elem.childNodes && elem.childNodes.length) {
    var fc = elem.firstChild,
        lc = elem.lastChild;

    while (fc !== lc) {
      remove(elem, lc);
      lc = elem.lastChild;
    }
    remove(elem, fc);
  }
}

function failMsg(elem, attr) {
  var selector = elem.tagName;

  selector = elem.id ? selector + '#' + elem.id : selector;
  selector = elem.className ? selector + '.' + elem.className.join('.') : selector;

  return 'Failed to set "' + attr + '" on element "' + selector + '".';
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
  if (attrs instanceof VNode || typeof attrs === 'string' || typeof attrs === 'number' || typeof attrs === 'boolean' || attrs.pop != null) {
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
        if (child instanceof VNode && child.attrs.key == null) {
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
      if (attrs.className && attrs.className.pop != null) {
        attrs.className = attrs.className.join(' ');
      }

      tagInfo = parseSelector(selector);
      if (tagInfo.className) {
        attrs.className = attrs.className ? attrs.className + ' ' + tagInfo.className : tagInfo.className;
      }

      if (tagInfo.id) {
        attrs.id = attrs.id ? attrs.id : tagInfo.id;
      }

      return new VNode(tagInfo.tagName, attrs, children);
    } else {
      throw new Error('Unrecognized selector: ' + selector + '.');
    }
}

/**
 * @param {Element|Text} domRoot 
 * @param {VNode} vRoot 
 */
function patch(domRoot, vRoot) {
  if (domRoot instanceof Element || domRoot instanceof Text) {
    domRoot = patchElement(domRoot, vRoot);
  }
  return domRoot;
}

/**
 * Patch a DOM node with a vnode.
 * @param {Element|Text} element 
 * @param {VNode} vnode 
 * @param {Boolean} same If 2 nodes are already checked by `isSameNode`, it should be set true.
 */
function patchElement(element, vnode, same) {
  if (vnode == null || typeof vnode === 'boolean') vnode = '';

  var i = void 0;

  // 1. both text nodes.
  if (element.nodeType === 3 && typeof vnode === 'string') {
    var oldText = element.textContent || element.nodeValue;
    if (oldText !== vnode) element.textContent = vnode;
  }

  // 2. are the same node.
  else if (same || isSameNode(element, vnode)) {
      patchAttrs(element, vnode);
      patchChildren(element, vnode);
      for (var name in modules) {
        (i = modules[name]) && (i = i.updating) && i(element, vnode.modAttrs[name]);
      }
    }

    // 3. not the same node.
    else {
        var node = create(vnode);
        // replace the `element` with `node`.
        element = remove(element.parentNode, element, node);
      }

  return element;
}

/**
 * See if 2 nodes are the same.
 * @param {Element|Text} element 
 * @param {VNode} vnode 
 */
function isSameNode(element, vnode) {
  return element.__key__ === vnode.key && element.tagName === vnode.tagName;
}

/**
 * Patch 2 same nodes.
 * @param {Element} element 
 * @param {VNode} vnode 
 */
function patchAttrs(element, vnode) {
  var attrs = vnode.attrs,
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
  for (var _name in attrs) {
    if (!(_name in oldAttrs) || attrs[_name] !== (_name === 'value' || _name === 'checked' ? element[_name] : oldAttrs[_name])) {
      setAttribute(element, _name, oldAttrs[_name] = attrs[_name]);
    }
  }
}

/**
 * Patch an element's children
 * @param {Element} element 
 * @param {VNode} vnode 
 */
function patchChildren(element, vnode) {
  var oldChildren = element.childNodes,
      vChildren = vnode.children,
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
        patchElement(oldChildren[0], ch, true);
      } else {
        // Try to find a child node that match.
        for (var i = 1; i < oldLen; i++) {
          if (isSameNode(oldChildren[i], ch)) {
            patchElement(oldChildren[i], ch, true);

            elemToMove = oldChildren[i];
            break;
          }
        }

        // If it wasn't found, create one from the vnode.
        if (elemToMove === void 0) {
          elemToMove = create(ch);
        }
        emptyChildren(element);
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
            patchElement(oldStartCh, vStartCh, true);

            oldStartCh = oldStartCh.nextSibling;
            vStartCh = vChildren[++vStart];
          }

          while (vStart <= vEnd && oldStartCh !== oldEndCh && oldEndCh && vEndCh && isSameNode(oldEndCh, vEndCh)) {
            patchElement(oldEndCh, vEndCh, true);

            oldEndCh = oldEndCh.previousSibling;
            vEndCh = vChildren[--vEnd];
          }

          // in case there is no reordering, but just some insertions or removals.
          if (oldStartCh === oldEndCh || vStart >= vEnd) break;

          // Reorder corner case 1.
          if (isSameNode(oldStartCh, vEndCh)) {
            patchElement(oldStartCh, vEndCh, true);
            _elemToMove = oldStartCh;
            oldStartCh = oldStartCh.nextSibling;
            // place it right behind oldEndCh.
            insertBefore(element, _elemToMove, oldEndCh.nextSibling);

            vEndCh = vChildren[--vEnd];
          }

          // Reorder corner case 2.
          else if (isSameNode(oldEndCh, vStartCh)) {
              patchElement(oldEndCh, vStartCh, true);
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
                  _elemToMove = create(vStartCh);
                  // place it right in front of oldStartCh
                  insertBefore(element, _elemToMove, oldStartCh);
                }
                // found. Move it to its place.
                else {
                    patchElement(_elemToMove, startChild);
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
            remove(element, _elemToMove);
          }

          if (isSameNode(oldEndCh, vChildren[vEnd])) {
            patchElement(oldEndCh, vChildren[vEnd], true);
            if (vStart === vEnd) {
              return;
            }
            vEnd--;
          } else {
            _elemToMove = oldEndCh;
            oldEndCh = oldEndCh.nextSibling;
            remove(element, _elemToMove);
          }

          // append new children if there's any.
          for (var _i = vStart; _i <= vEnd; _i++) {
            insertBefore(element, create(vChildren[_i]), oldEndCh);
          }
        }
      }

      // case 2: remove all DOM children.
      else if (oldLen !== 0) {
          emptyChildren(element);
        }

        // case 3: insert new DOM children.
        else if (vLen !== 0) {

            for (var _i2 = 0, _newCh = vChildren[0]; _i2 < vLen; _i2++) {
              element.appendChild(create(_newCh));
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

exports.createElement = create;
exports.h = h;
exports.patch = patch;
exports.moduleManger = moduleManager;
