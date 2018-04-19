import { eventHookRe, svgRe, SVG_NS } from './util';
export default VNode;

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

    if (child instanceof VNode) {
      addNS(child, ns);
    }
  }
}

class VNode {
  /**
   * @param {String} tagName a tag name. Must be specified.
   * @param {Object|null} props can be an empty object.
   * @param {Array|null} children can be an empty array.
   */
  constructor(tagName, props, children) {
    this.tagName = tagName.toUpperCase();
    this.props = props || {};
    this.children = children || [];
    this.key = props && props.key;
    
    let ns = (props && props.namespace) ||
      (svgRe.test(tagName) ? SVG_NS : void 0);

    if (ns) {
      addNS(this, ns);
    }
  }
}