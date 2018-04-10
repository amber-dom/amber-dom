export function isArray (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

export function isEmpty(obj) {
  return Object.keys(obj|| {}).length === 0;
}

export const eventHookRe = /^ev\-([a-z]+)/;