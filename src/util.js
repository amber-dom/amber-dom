// Some helper functions.
export function isArray (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

// Some constants or Regex.
export const svgRe = /(svg|SVG)/;
export const xlinkRe = /^xlink:(.*)$/;
export const SVG_NS = 'http://www.w3.org/2000/svg';
export const XLINK_NS = 'http://www.w3.org/1999/xlink';
