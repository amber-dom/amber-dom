var events = (function (exports) {
  'use strict';

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

  exports.default = events;

  return exports;

}({}));
