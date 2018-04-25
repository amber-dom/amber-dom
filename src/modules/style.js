export default {
  name: 'style',
  creating: initInlineStyle,
  updating: updateInlineStyle
}

function initInlineStyle(elem, style) {
  elem.__style__ = style;
  if (typeof style === 'string') {
    elem.style.cssText = style;
  }

  else {
    for (let i in style) {
      elem.style[i] && (elem.style[i] = style[i])
    }
  }
}

function updateInlineStyle(elem, style) {
  let oldStyle = elem.__style__;

  if (oldStyle == null && style == null)
    return;

  if (!style || typeof style === 'string' || typeof oldStyle === 'string') {
    elem.style.cssText = style || '';
  }
  
  if (style && typeof style === 'object') {
    // set every old style field to empty.
    if (typeof oldStyle !== 'string') {
      for (let i in oldStyle) {
        if (!(i in style))
          elem.style[i] = '';
      }
    }
    
    for (let i in style) {
      elem.style[i] && (elem.style[i] = style[i]);
    }
  }

  elem.__style__ = style;
}