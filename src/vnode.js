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
    
    let ns = (props && props.namespace) ||
      (svgRe.test(tagName) ? SVG_NS : void 0);

    if (ns) {
      addNS(this, ns);
    }

    addChildKeys(this.children);

    // deal with hooks.
    if (props.hooks) {
      for (const name in props.hooks) {
        this[name] = props.hooks[name];
      }
      delete props.hooks;
    }
  }
}