import VNode from './vnode';
import { eventHookRe, isEmpty } from './util';
import { 
  setAttribute,
  insertBefore,
  replace,
  create,
  remove } from "./domManager";

export default patch;


/**
 * @param {Element|Text} domRoot 
 * @param {VNode} vRoot 
 */
function patch(domRoot, vRoot) {
  if (domRoot instanceof Element || domRoot instanceof Text)
    patchElement(domRoot, vRoot);
}


/**
 * Patch a DOM node with a vnode.
 * @param {Element|Text} element 
 * @param {VNode} vnode 
 */
function patchElement(element, vnode) {
  if (vnode == null || typeof vnode === 'boolean')
    vnode = '';

  // 1. both text nodes.
  if (
    (element.nodeType === 3) &&
    (typeof vnode === 'string' || typeof vnode === 'number')
  ) {
    const oldText = element.textContent || element.nodeValue;
    if (oldText !== vnode)
      element.textContent = vnode;
  }

  // 2. are the same node.
  else if (isSameNode(element, vnode)) {
    patchProps(element, vnode);
    patchChildren(element, vnode);
  }
  
  // 3. not the same node.
  else {
    replace(element.parentNode, create(vnode), element);
  }
}

/**
 * See if 2 nodes are of the same type & have the same key.
 * Text nodes will do find because it will be patched by `patchedElement` eventually.
 * @param {Element|Text} element 
 * @param {VNode} vnode 
 */
function isSameNode(element, vnode) {
  return element.key === vnode.key && element.tagName === vnode.tagName;
}

/**
 * Patch 2 nodes' props/attributes.
 * @param {Element} element 
 * @param {VNode} vnode 
 */
function patchProps(element, vnode) {
  const attrs = vnode.props;
  let old = element.$props;
  const isSvg = !!element.ns;

  // if this dom node wasn't diffed before, or wasn't created
  // by `create`, pull out its attributes and patch them.
  if (old == null || isEmpty(old)) {
    old = element.$props = old == null ? {}: old;
    for (let a = element.attributes, i = a.length; i--; ) {
      old[a[i].name] = a[i].value;
    }
  }

  // remove attributes not on vnode.
  for(const name in old) {
    if (old[name] && !(attrs && attrs[name])) {
      setAttribute(element, name, (old[name] = void 0), isSvg);
    }
  }

  // add new & update attributes.
  // Don't worry about style object,
  // because `setAttribute` will deal with it.
  for (const name in attrs) {
    if (!(name in old) || attrs[name] !== (
      name === 'value' || name === 'checked' ? element[name] : old[name])
    ) {
      setAttribute(element, name, attrs[name], isSvg);
    }
  }
}

/**
 * Patch an element's children
 * @param {Element} element 
 * @param {VNode} vnode 
 */
function patchChildren(element, vnode) {
  const oldChildren = element.childNodes,
        vChildren = vnode.children,
        oldLen = oldChildren.length,
        vLen = vChildren.length;
  
  // nothing to patch.
  if (vLen === 0 && oldLen === 0) {
    return;
  }

  // case 1: both have children.
  else if (oldLen !== 0 && vLen !== 0) {
    let keyedChildren,
        vStart = 0,
        vEnd = vLen - 1,

        oldStartCh = element.firstChild,
        oldEndCh = element.lastChild,

        vStartCh = vChildren[vStart],
        vEndCh = vChildren[vEnd],

        elemToMove;

    while(vStart <= vEnd && oldStartCh !== oldEndCh) {
      while(isSameNode(oldStartCh, vStartCh)) {
        patchElement(oldStartCh, vStartCh);

        oldStartCh = oldStartCh.nextSibling;
        vStartCh = vChildren[++vStart];
      }

      while(isSameNode(oldEndCh, vEndCh)) {
        patchElement(oldEndCh, vEndCh);

        oldEndCh = oldEndCh.previousSibling;
        vEndCh = vChildren[--vEnd];
      }

      // in case there is no reordering, but just some insertions or removals.
      if (oldStartCh === oldEndCh || vStart === vEnd)  break;

      // move corner case 1.
      if (isSameNode(oldStartCh, vEndCh)) {
        patchElement(oldStartCh, vEndCh);
        elemToMove = oldStartCh;
        oldStartCh = oldStartCh.nextSibling;
        // place it right behind oldEndCh.
        insertBefore(element, elemToMove, oldEndCh.nextSibling);

        vEndCh = vChildren[--vEnd];
      }

      // move corner case 2.
      else if (isSameNode(oldEndCh, vStartCh)) {
        patchElement(oldEndCh, vStartCh);
        elemToMove = oldEndCh;
        oldEndCh = oldEndCh.previousSibling;
        // place it right in front of oldStartCh.
        insertBefore(element, elemToMove, oldStartCh.previousSibling);

        vStartCh = vChildren[++vStart];
      }

      // insert or move.
      else {
        // try to find element in old list.
        if (keyedChildren == null) {
          keyedChildren = createKeyMap(oldChildren, oldStartCh, oldEndCh);
        }
        
        elemToMove = keyedChildren[vStartCh.key];

        // create a new element
        if (elemToMove == null) {
          elemToMove = create(vStartCh);
          // place it right in front of oldStartCh
          insertBefore(element, elemToMove, oldStartCh);
        }
        // the element is in the map.
        else {
          elemToMove = oldChildren[idxInOld];
          patchElement(elemToMove, startChild);
          keyedChildren[elemToMove.key] = void 0;
          // place it right in front of oldStartCh
          insertBefore(element, elemToMove, oldStartCh);
        }
        vStartCh = vChildren[++vStart];
      }
    }

    if (vStart <= vEnd || oldStartCh !== oldEndCh) {
      // remove children.
      if (oldStartCh !== oldEndCh) {
        while(oldStartCh !== oldEndCh) {
          remove(element, oldStartCh);
          oldStartCh = oldStartCh.nextSibling;
        }
        remove(element, oldStartCh);
      }

      // insert children.
      else {
        for (let i = vStart; i <= vEnd; i++) {
          insertBefore(element, create(vChildren[i]), oldEndCh);
        }
      }
    }
  }

  // case 2: remove all DOM children.
  else if (oldLen !== 0) {
    // To reduce reflow.
    let oldCh = oldChildren.lastChild;
    let fc = oldChildren.firstChild;

    while(oldCh !== fc) {
      remove(element, oldCh);
      oldCh = oldCh.previousSibling;
    }

    if (oldCh === fc) {
      remove(element, oldCh);
    }
  }

  // case 3: insert new DOM children.
  else if (vLen !== 0) {
    let newCh;

    for (let i = 0, newCh = vChildren[0]; i < vLen; i++) {
      element.appendChild(create(newCh));
    }
  }
}

/**
 * Create a map of keyed children.
 * @param {NodeList} children
 * @param {Node} start the node to start from.
 * @param {Node} end  the node to end with
 * @returns { {key: Node} } a map with key equals key, value equals a node associated with this key.
 */
function createKeyMap(children, start, end) {
  const keyedChildren = {};

  if (start === end && start.key) {
    keyedChildren[String(start.key)] = start;
  }

  while(start !== end) {
    if (start.key != null) {
      keyedChildren[String(start.key)] = start;
    }
    start = start.nextSibling;
  }

  if (start === end && start.key) {
    keyedChildren[String(start.key)] = start;
  }

  return keyedChildren;
}