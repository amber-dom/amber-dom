export default function() {
  return {
    name: 'events',
    creating: updateListeners,
    updating: updateListeners
  }
}


function updateListeners(elem, events) {
  let handler, params, value;

  for (let name in events) {
    value = events[name];

    // a single listener
    if (typeof value === 'function') {
      handler = value;
    }

    // a listener with params.
    else if (value && !!(value.shift) && (handler = value.shift()) && (typeof handler === 'function')) {
      params = value;
    }

    // remove a listener.
    else if ( value === void 0 ) {
      handler = void 0;
      params = void 0;
    }

    else {
      console.warn(`Failed to add ${name} listener.`);
      continue;
    }

    (elem.__listeners__ || (elem.__listeners__ = {}))[name] = { handler, params };
    elem.addEventListener(name, proxyEvents);
  }
}

function proxyEvents(ev) {
  let handler, params,
      elem = ev.currentTarget,
      listeners = elem.__listeners__;

  if (listeners && (handler = listeners[ev.type])) {
    params = handler.params;
    handler = handler.handler;

    if (handler && params != null)
      handler(ev, ...params);
    else if (handler)
      handler(ev);
  }
}