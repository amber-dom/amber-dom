const svgRe = /(svg|SVG)/;
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Add namespace for `vnode` and recursively add it to its children.
 * @param {Object} vnode A vnode.
 * @param {String} ns A namespace.
 */
function addNS(vnode, ns) {
  const children = vnode.children;

  vnode.ns = ns;
  for (let i = 0, len = children.length; i < len; i++) {
    let child = children[i];

    if (isVnode(child) && child.tagName !== 'foreignObject') {
      addNS(child, ns);
    }
  }
}

/**
 * @param {String} tagName a tag name. Must be specified.
 * @param {Object|null} attrs attributes to set on DOM.
 * @param {Array|null} children can be an empty array.
 */
export function vnode(tagName, attrs, children) {
  (attrs || (attrs = {}));
  (children || (children = []));

  let ns = (attrs.namespace) || (svgRe.test(tagName) ? SVG_NS : void 0);
  let vnode = {
    tagName: !!ns ? tagName : tagName.toUpperCase(),
    attrs: attrs,
    key: attrs.key,
    children: children,
    isVnode: true
  };

  // set up namespace.
  ns && addNS(vnode, ns);
  return vnode;
}

export function isVnode(vnode) {
  return vnode && vnode.tagName && vnode.isVnode === true;
}