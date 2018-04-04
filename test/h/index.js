(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.h = factory());
}(this, (function () { 'use strict';

  function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
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

      delete props.key; // no key will be needed anymore.
    }

    /**
     * 
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
              try {
                var handler = typeof props[propName] === 'function' ? props[propName] : new Function('(' + props[propName] + ')(...arguments);');

                element.addEventListener(_events[1], handler);
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

        return element;
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

  return h;

})));
