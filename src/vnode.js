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
  // tag name needs to be converted back to lowercase.
  vnode.tagName = vnode.tagName
    ? vnode.tagName.toLocaleLowerCase() : void 0;

  for (let i = 0, len = children.length; i < len; i++) {
    let child = children[i];

    if (child instanceof VNode) {
      addNS(child, ns);
    }
  }
}

/**
 * Ensure all children have keys. If no key is provided,
 * use index instead.
 * @param {Array} children 
 */
function addChildKeys(children) {
  let ch;

  for (let i = 0, len = children.length; i < len; i++) {
    ch = children[i];

    if (ch instanceof VNode) {
      ch.key = ch.props.key = ch.props.key != null
        ? ch.props.key : i;
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

    let i,
        ns = (props && props.namespace) || (svgRe.test(tagName) ? SVG_NS : void 0);

    // set up namespace.
    if (ns) {
      addNS(this, ns);
    }

    // set up children's key.
    addChildKeys(this.children);

    // set up hooks.
    if (props.hooks) {
      this.hooks = i = props.hooks;
      delete props.hooks;
      // if `vnode hook` is defined, invoke it with this vnode.
      if ((i = i.vnode) || typeof i === 'function')
        i(vnode);
    }
  }
}