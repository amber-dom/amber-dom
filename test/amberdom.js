(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.amberdom = factory());
}(this, (function () { 'use strict';

  function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  function isEmpty(obj) {
    return Object.keys(obj || {}).length === 0;
  }

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var eventHookRe = /^ev\-([a-z]+)/;

  var VNode = function () {
    /**
     * @param {String} tagName a tag name. Must be specified.
     * @param {Object} props can be an empty object.
     * @param {Array} children can be an empty array.
     */
    function VNode(tagName, props, children) {
      _classCallCheck(this, VNode);

      this.tagName = tagName;
      this.props = props;
      this.children = children;
      this.key = props.key || void 0;
      this.count = children.reduce(function (acc, child) {
        if (child instanceof VNode) return child.count + acc + 1;else return acc + 1;
      }, 0);
      this.cleanups = []; // for cleaning up event listeners.

      delete props.key; // no key will be needed anymore.
    }

    /**
     * render a real DOM tree for this VTree rooted at this VNode.
     */


    _createClass(VNode, [{
      key: 'render',
      value: function render() {
        var element = !/(SVG|svg)/.test(this.tagName) ? document.createElement(this.tagName) : document.createElementNS("http://www.w3.org/2000/svg", "svg");

        var props = this.props;

        for (var propName in props) {
          if (props.hasOwnProperty(propName)) {
            var _events = propName.match(eventHookRe);
            if (_events) {
              // FIXME: might be a better way of handling this.
              try {
                var handler = typeof props[propName] === 'function' ? props[propName] : new Function('(' + props[propName] + ')(...arguments);');

                // store it for later detachment, to avoid memory
                // leaking.
                this.cleanups.push({
                  evName: _events[1],
                  handler: handler
                });
                // avoid bubbling.
                element.addEventListener(_events[1], handler, false);
              } catch (e) {
                console.log('Warning: listener for event \'' + _event[1] + '\' isn\'t working.\n              If you\'re specifying this handler in string, please specify a function.');
              }
            } else if (propName === 'className') {
              element.setAttribute('class', props[propName]);
            } else {
              element.setAttribute(propName, props[propName]);
            }
          }
        }

        this.children.forEach(function (child) {
          var childElement;

          if (typeof child === 'string') {

            childElement = document.createTextNode(child);
          }
          // It is a VNode.
          else if (child instanceof VNode) {
              childElement = child.render();
            }
            // FIXME: might be buggy.
            // It is a custom-defined node.
            else {
                var _render = child.render || void 0;

                // It is defined as a class.
                if (typeof _render === 'function') {
                  _render.bind(child);
                  childElement = _render();
                }
                // defined as a function.
                else {
                    childElement = child.render();
                  }
              }
          element.appendChild(childElement);
        });

        this.$el = element;
        return element;
      }
    }, {
      key: 'detachEventListeners',
      value: function detachEventListeners() {
        var _this = this;

        this.cleanups.forEach(function (event) {
          _this.$el.removeEventListener(event.evName, event.handler);
        });
      }
    }]);

    return VNode;
  }();

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  var classIdSpliter = /([\.#]?[^\s#.]+)/;

  function parseTagName(tagName) {
    var parts = tagName.split(classIdSpliter);
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

    result.className && result.className.join(' ');
    return result;
  }

  /**
   * 
   * @param {String|Function} tagName a built-in tag name or custom function that returns an object created by h.
   * @param {Object} props optional. any style, event listeners, and className should be put here.
   * @param {*} children optional children. Any string, instance of VNode will be children.
   */
  function h(tagName, props) {
    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    var tagInfo;

    props || (props = {});
    children || (children = []);

    // handle children re-maps.
    if (props instanceof VNode || typeof props === 'string') {
      children.unshift(props);
      props = {};
    }

    // handle children re-maps.
    if (isArray(props)) {
      children = [].concat(_toConsumableArray(props), [children]);
      props = {};
    }

    // handle object-literal `style`.
    if (props.style && _typeof(props.style) === 'object') {
      var style = '';

      for (var key in props.style) {
        style += key + ': ' + props.style[key] + '; ';
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
        props.className || (props.className = '');
        props.className += ' ' + tagInfo.className;
      }
      // any children will be handled by VNode, remember there's no
      // VText.
      return new VNode(tagInfo.tagName, props, children);
    } else if (typeof tagName === 'function') {
      // use `new` in case it is a class.
      return new tagName(props, children);
    }
  }

  var REPLACE = 'REPLACE';
  var REORDER = 'REORDER';
  var PROPS = 'PROPS';
  var TEXT = 'TEXT';

  var patchType = {
    REPLACE: REPLACE,
    REORDER: REORDER,
    PROPS: PROPS,
    TEXT: TEXT
  };

  function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function diff(oldList, newList, key) {
    var oldListKeys = getKeys(oldList, key);
    var newListKeys = getKeys(newList, key);
    var oldListLength = oldList.length;
    var newListLength = newList.length;
    var diffed = oldList.slice();
    var moves = [];

    // Not a key was provied, don't diff.
    if (noKeys(oldListKeys) && noKeys(newListKeys)) {
      var op = void 0,
          start = void 0,
          end = void 0,
          inserted = void 0;

      if (oldListLength === newListLength) {
        return {
          diffed: diffed,
          moves: moves
        };
      }

      // Remove accessary nodes.
      if (oldListLength > newListLength) {
        op = 'REMOVE';
        start = newListLength;
        end = oldListLength;
        diffed.splice(newListLength, oldListLength - newListLength);
      }

      // Insert neccessary nodes.
      else if (newListLength > oldListLength) {
          op = 'INSERT';
          start = oldListLength;
          end = newListLength;
          inserted = newList.slice(oldListLength);
          diffed = [].concat(_toConsumableArray$1(diffed), _toConsumableArray$1(inserted));
        }

      for (var i = start; i < end; i++) {
        moves.push({
          type: op,
          index: i,
          item: newList[i] || null // It doesn't matter what.
        });
      }

      return {
        diffed: diffed,
        moves: moves
      };
    }
    // record the move of the last element.
    var indexDeltas = new Array(oldListLength).fill(0);

    newListKeys.forEach(function (key, newIndex) {
      var _physicalIndex = oldListKeys.indexOf(key);

      if (_physicalIndex === -1) {
        // Element doesn't exist in `newList` yet. Tell it to
        // insert it.
        moves.push({
          type: 'INSERT',
          index: newIndex,
          item: newList[newIndex]
        });
        diffed.splice(newIndex, 0, newList[newIndex]);

        // positions of all unprocessed elements should take this delta.
        indexDeltas[oldListLength - 1]++;
      } else {
        var oldIndex = _physicalIndex;

        for (var _i = oldListLength - 1; _i >= _physicalIndex; _i--) {
          oldIndex += indexDeltas[_i];
        }

        // If it is already in place, don't do anything.
        if (newIndex === oldIndex) return;

        moves.push({
          type: 'MOVE',
          from: oldIndex,
          to: newIndex
        });
        var _elem = diffed.splice(oldIndex, 1)[0];
        diffed.splice(newIndex, 0, _elem);

        // It is impossible to move element from front to back.
        indexDeltas[_physicalIndex]++;
      }
    });

    // remove extra.
    oldListKeys.forEach(function (key, i) {

      if (newListKeys.indexOf(key) === -1) {
        moves.push({
          type: 'REMOVE',
          index: newListLength // all extra items must've been moved to end.
        });
        diffed.splice(newListLength, 1);
      }
    });

    return {
      diffed: diffed,
      moves: moves
    };
  }

  // Elements with no `key` field is to be removed.
  function getKeys(list, key) {
    return list.map(function (item, i) {
      if (key && item) {
        return typeof key === 'function' ? key(item) : item[key];
      } else return void 0;
    });
  }

  function noKeys(list) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;

        if (item !== void 0) return false;
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

    return true;
  }

  var REPLACE$2 = patchType.REPLACE,
      REORDER$2 = patchType.REORDER,
      TEXT$2 = patchType.TEXT,
      PROPS$2 = patchType.PROPS;


  function diff$1(oldTree, newTree) {
    var patches = {};
    walk(oldTree, newTree, patches, 0);
    return patches;
  }

  function walk(oldNode, newNode, patches, index) {
    var currPatches = [];
    var propPatches;

    // TODO: let custom-defined component take control of diffing.

    if (newNode === void 0) {
      // oldNode will be removed.
      return patches;
    }

    // both Text node.
    else if (typeof oldNode === 'string' && typeof newNode === 'string') {

        if (oldNode === newNode) {
          // nothing to patch.
        } else {
          patches[index] = [{ type: TEXT$2, text: newNode }];
        }
        // there would be no props nor children.
        return patches;
      }

    propPatches = diffProps(oldNode.props || {}, newNode.props || {});

    // the whole node should be replaced, if tag names are not the same
    // or keys diffed.splice(oldListLength, 0, ...inserted); are not the same.
    if (oldNode.tagName !== newNode.tagName || oldNode.key !== newNode.key) {

      currPatches.push({
        type: REPLACE$2,
        node: newNode
      });
      patches[index] = currPatches;
      // do not diff their children anymore.
      return patches;
    }
    // only patch some props.
    else if (!isEmpty(propPatches)) {
        currPatches.push({
          type: PROPS$2,
          props: propPatches
        });
      }

    diffChildren(oldNode.children || [], newNode.children || [], patches, currPatches, index);
    if (currPatches.length) {
      patches[index] = currPatches;
    }
    return patches;
  }

  function diffProps(oldProps, newProps) {
    var propPatches = {},
        value;

    // update props.
    for (var propName in newProps) {
      if (newProps.hasOwnProperty(propName)) {
        value = newProps[propName];
        if (oldProps[propName] !== value) {
          propPatches[propName] = value;
        }
      }
    }
    // remove old props.
    for (var _propName in oldProps) {
      if (!(_propName in newProps)) propPatches[_propName] = void 0;
    }
    return propPatches;
  }

  function diffChildren(oldChildren, newChildren, patches, currPatches, index) {
    var diffs = diff(oldChildren, newChildren, 'key');

    oldChildren = diffs.diffed; // Must reorder them first before steppin deeper.
    if (diffs.moves.length) {
      currPatches.push({
        type: REORDER$2,
        moves: diffs.moves
      });
    }

    var prevSibling = null;
    var currIndex = index;
    oldChildren.forEach(function (child, i) {
      var newChild = newChildren[i];
      currIndex = prevSibling && prevSibling.count ? prevSibling.count + currIndex + 1 : currIndex + 1; // the first child.
      walk(child, newChildren[i], patches, currIndex);
      prevSibling = child;
    });
  }

  var REPLACE$3 = patchType.REPLACE,
      REORDER$3 = patchType.REORDER,
      PROPS$3 = patchType.PROPS,
      TEXT$3 = patchType.TEXT;


  function patch(domRoot, patches) {
    walk$1(domRoot, patches, { index: 0 });
  }

  // walker keeps the complexity away.
  // `walk` updates the domTree buttom-up.
  function walk$1(domNode, patches, walker) {
    var currPatches = patches[walker.index];

    if (domNode.childNodes) {
      var childArr = [].slice.call(domNode.childNodes);
      childArr.forEach(function (child, i) {
        walker.index++;
        walk$1(child, patches, walker);
      });
    }

    if (currPatches) {
      applyPatches(domNode, currPatches);
    }
  }

  /**
   * patch a single dom node.
   * @param {NodeList} domNode 
   * @param {Array} patch 
   */
  function applyPatches(domNode, patches) {
    var props = void 0,
        newNode = void 0;

    patches.forEach(function (patch) {
      switch (patch.type) {
        case REPLACE$3:
          newNode = patch.node instanceof VNode || patch.node.render ? patch.node.render() // an instance of VNode or a custom node.
          : typeof patch.node === 'string' ? document.createTextNode(patch.node) : new Error('You might be using a custom node, if so, you need to provide a render function.');
          if (newNode instanceof Error) {
            throw newNode;
          }
          domNode.parentNode.replaceChild(domNode, newNode);
          break;

        case PROPS$3:
          props = patch.props;
          for (var propName in props) {
            if (props[propName] === void 0) domNode.removeAttribute(propName !== 'className' ? propName : 'class');else domNode.setAttribute(propName !== 'className' ? propName : 'class', props[propName]);
          }
          break;

        case TEXT$3:
          if (domNode.textContent) {
            domNode.textContent = patch.text;
          } else {
            domNode.nodeValue = patch.text;
          }
          break;

        case REORDER$3:
          reorderChildren(domNode, patch.moves);
          break;

        default:
          throw new Error('Some internal error.');
      }
    });
  }

  // TODO: Add batch.
  function reorderChildren(domNode, moves) {
    var childNodes = Array.prototype.slice.call(domNode.childNodes);
    var node = void 0;

    moves.forEach(function (move) {
      switch (move.type) {
        case 'INSERT':
          try {
            node = move.item.render();
            childNodes.splice(move.index, 0, node);
          } catch (e) {
            console.log('A custom-defined node should have a render method, otherwise it must be defined as a function.');
          }
          break;

        case 'REMOVE':
          childNodes.splice(move.index, 1);
          break;

        case 'MOVE':
          node = childNodes.splice(move.from, 1)[0];
          childNodes.splice(move.to, 0, node);
          break;
      }
    });
  }

  var index = {
    h: h,
    diff: diff$1,
    patch: patch,
    VNode: VNode
  };

  return index;

})));
//# sourceMappingURL=amberdom.js.map
