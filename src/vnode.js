import { modules } from './module-manager';
export default VNode;


const svgRe = /(svg|SVG)/;
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Add namespace for `vnode` and recursively add it to its children.
 * @param {VNode} vnode A vnode.
 * @param {String} ns A namespace.
 */
function addNS(vnode, ns) {
  const children = vnode.children;

  vnode.ns = ns;
  for (let i = 0, len = children.length; i < len; i++) {
    let child = children[i];

    if (child instanceof VNode && child.tagName !== 'foreignObject') {
      addNS(child, ns);
    }
  }
}

class VNode {
  /**
   * @param {String} tagName a tag name. Must be specified.
   * @param {Object|null} attrs attributes to set on DOM.
   * @param {Array|null} children can be an empty array.
   */
  constructor(tagName, attrs, children) {
    (attrs || (attrs = {}));
    (children || (children = []));

    let ns = (attrs.namespace) || (svgRe.test(tagName) ? SVG_NS : void 0);

    this.tagName = !!ns ? tagName : tagName.toUpperCase();
    this.attrs = {};
    this.modAttrs = {};
    this.key = attrs.key;
    this.children = children;

    // separate module-managed attrs and self-managed attrs.
    for (let name in attrs) {
      if (!(name in modules)) {
        this.attrs[name] = attrs[name];
      } else {
        this.modAttrs[name] = attrs[name];
      }
    }

    // set up namespace.
    ns && addNS(this, ns);
  }
}