var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

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

export default style;
