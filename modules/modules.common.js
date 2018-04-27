'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

var events = {
  name: 'events',
  creating: updateListeners,
  updating: updateListeners
};

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

var style = {
  name: 'style',
  creating: updateInlineStyle,
  updating: updateInlineStyle
};

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

exports.events = events;
exports.style = style;
