// Some helper functions.
export function isArray (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

export function isEmpty(obj) {
  return Object.keys(obj|| {}).length === 0;
}

// Some constants or Regex.
export const eventHookRe = /^ev\-([a-z]+)/;
export const svgRe = /(svg|SVG)/;
export const xlinkRe = /^xlink:(.*)$/;
export const SVG_NS = 'http://www.w3.org/2000/svg';
export const XLINK_NS = 'http://www.w3.org/1999/xlink';
