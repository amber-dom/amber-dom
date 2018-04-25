import VNode from './vnode';
import modules from './mods';
import { 
  setAttribute,
  insertBefore,
  create,
  remove,
  append,
  emptyChildren } from "./dom-manager";

export default patch;


/**
 * @param {Element|Text} domRoot 
 * @param {VNode} vRoot 
 */
function patch(domRoot, vRoot) {
  if (domRoot instanceof Element || domRoot instanceof Text) {
    domRoot = patchElement(domRoot, vRoot);
  }
  return domRoot;
}


/**
 * Patch a DOM node with a vnode.
 * @param {Element|Text} element 
 * @param {VNode} vnode 
 * @param {Boolean} same If 2 nodes are already checked by `isSameNode`, it should be set true.
 */
function patchElement(element, vnode, same) {
  if (vnode == null || typeof vnode === 'boolean')
    vnode = '';

  let i;

  // 1. both text nodes.
  if ((element.nodeType === 3) && (typeof vnode === 'string')) {
    const oldText = element.textContent || element.nodeValue;
    if (oldText !== vnode)
      element.textContent = vnode;
  }
  
  // 2. are the same node.
  else if (same || isSameNode(element, vnode)) {
    patchAttrs(element, vnode);
    patchChildren(element, vnode);
    for (const name in modules) {
      (i = modules[name]) && (i = i.updating) && (i(element, vnode.modAttrs[name]));
    }
  }

  // 3. not the same node.
  else {
    let node = create(vnode);
    // replace the `element` with `node`.
    element = remove(element.parentNode, element, node);
  }

  return element;
}

/**
 * See if 2 nodes are the same.
 * @param {Element|Text} element 
 * @param {VNode} vnode 
 */
function isSameNode(element, vnode) {
  return element.__key__ === vnode.key && element.tagName === vnode.tagName;
}

/**
 * Patch 2 same nodes.
 * @param {Element} element 
 * @param {VNode} vnode 
 */
function patchAttrs(element, vnode) {
  let attrs = vnode.attrs,
      oldAttrs = element.__attrs__;

  // Just ensure it is right if `element` was created by a vnode.
  if (oldAttrs == null) {
    oldAttrs = element.__attrs__ = oldAttrs == null ? {} : oldAttrs;
    for (let a = element.attributes, i = a.length; i--; ) {
      oldAttrs[a[i].name] = a[i].value;
    }
  }

  // remove attributes not on vnode.
  for(const name in oldAttrs) {
    if (oldAttrs[name] && !(attrs && attrs[name])) {
      setAttribute(element, name, (oldAttrs[name] = void 0));
    }
  }

  // add new & update attributes.
  for (const name in attrs) {
    if (!(name in oldAttrs) || attrs[name] !== (
      name === 'value' || name === 'checked' ? element[name] : oldAttrs[name])
    ) {
      setAttribute(element, name, (oldAttrs[name] = attrs[name]));
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

  // Special case: if vnode contains only 1 child.
  else if (vLen === 1) {
    let ch = vChildren[0],
        elemToMove;

    if (oldLen === 1 && isSameNode(oldChildren[0], ch)) {
      patchElement(oldChildren[0], ch, true);
    }

    else {
      // Try to find a child node that match.
      for (let i = 1; i < oldLen; i++) {
        if (isSameNode(oldChildren[i], ch)) {
          patchElement(oldChildren[i], ch, true);

          elemToMove = oldChildren[i];
          break;
        }
      }

      // If it wasn't found, create one from the vnode.
      if (elemToMove === void 0) {
        elemToMove = create(ch);
      }
      emptyChildren(element);
      element.appendChild(elemToMove);
    }
  }

  // case 1: both have children.
  else if (oldLen !== 0 && vLen > 1) {
    let keyedChildren,
        vStart = 0,
        vEnd = vLen - 1,

        oldStartCh = element.firstChild,
        oldEndCh = element.lastChild,

        vStartCh = vChildren[vStart],
        vEndCh = vChildren[vEnd],

        elemToMove;

    while(vStart <= vEnd && oldStartCh !== oldEndCh) {
      while(vStart <= vEnd && oldStartCh !== oldEndCh && 
        oldStartCh && vStartCh && isSameNode(oldStartCh, vStartCh)
      ) {
        patchElement(oldStartCh, vStartCh, true);

        oldStartCh = oldStartCh.nextSibling;
        vStartCh = vChildren[++vStart];
      }

      while(vStart <= vEnd && oldStartCh !== oldEndCh && 
        oldEndCh && vEndCh && isSameNode(oldEndCh, vEndCh)
      ) {
        patchElement(oldEndCh, vEndCh, true);

        oldEndCh = oldEndCh.previousSibling;
        vEndCh = vChildren[--vEnd];
      }

      // in case there is no reordering, but just some insertions or removals.
      if (oldStartCh === oldEndCh || vStart >= vEnd)  break;

      // Reorder corner case 1.
      if (isSameNode(oldStartCh, vEndCh)) {
        patchElement(oldStartCh, vEndCh, true);
        elemToMove = oldStartCh;
        oldStartCh = oldStartCh.nextSibling;
        // place it right behind oldEndCh.
        insertBefore(element, elemToMove, oldEndCh.nextSibling);

        vEndCh = vChildren[--vEnd];
      }

      // Reorder corner case 2.
      else if (isSameNode(oldEndCh, vStartCh)) {
        patchElement(oldEndCh, vStartCh, true);
        elemToMove = oldEndCh;
        oldEndCh = oldEndCh.previousSibling;
        // place it right in front of oldStartCh.
        insertBefore(element, elemToMove, oldStartCh);

        vStartCh = vChildren[++vStart];
      }

      // insert or reorder.
      else {
        // try to find element in old list.
        if (keyedChildren == null) {
          keyedChildren = createKeyMap(oldChildren, oldStartCh, oldEndCh);
        }
        
        elemToMove = keyedChildren[vStartCh.key];

        // not found. Create a new child.
        if (elemToMove == null) {
          elemToMove = create(vStartCh);
          // place it right in front of oldStartCh
          insertBefore(element, elemToMove, oldStartCh);
        }
        // found. Move it to its place.
        else {
          patchElement(elemToMove, startChild);
          keyedChildren[elemToMove.key] = void 0;
          // place it right in front of oldStartCh
          insertBefore(element, elemToMove, oldStartCh);
        }
        vStartCh = vChildren[++vStart];
      }
    }

    if (oldStartCh) {

      // oldStartCh is ahead of oldEndCh, which means
      // there are children to be removed.
      while(oldStartCh !== oldEndCh) {
        elemToMove = oldStartCh;
        oldStartCh = oldStartCh.nextSibling;
        remove(element, elemToMove);
      }

      if (isSameNode(oldEndCh, vChildren[vEnd])) {
        patchElement(oldEndCh, vChildren[vEnd], true);
        if (vStart === vEnd) {
          return;
        }
        vEnd--;
      }

      else {
        elemToMove = oldEndCh;
        oldEndCh = oldEndCh.nextSibling;
        remove(element, elemToMove);
      }

      // append new children if there's any.
      for (let i = vStart; i <= vEnd; i++) {
        insertBefore(element, create(vChildren[i]), oldEndCh);
      }
    }
  }

  // case 2: remove all DOM children.
  else if (oldLen !== 0) {
    emptyChildren(element);
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