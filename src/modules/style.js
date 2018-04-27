export default function() {
  return {
    name: 'style',
    creating: updateInlineStyle,
    updating: updateInlineStyle
  }
}

function updateInlineStyle(elem, style) {
  let oldStyle = elem.__style__;

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
      elem.style[i] = style[i];
    }
  }

  elem.__style__ = style;
}