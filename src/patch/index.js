import VNode from '../vnode/index';
import patchType from '../diff/patch-type';
import { eventHookRe } from '../util';
export default patch;


const { REPLACE, REORDER, PROPS, TEXT } = patchType;

function patch(domRoot, patches) {
  walk(domRoot, patches, { index: 0 });
}

// walker keeps the complexity away.
// `walk` updates the domTree buttom-up.
function walk(domNode, patches, walker) {
  const currPatches = patches[walker.index];
  let   skipChildren = false; // Is it a REPLACE patch?

  // changes should be applied for this node first
  // in case one of childNodes of `domNode` is removed.
  // Thus if patches are applied to childNodes first,
  // and if that patched child node is later on removed,
  // no effect will be taken into account.
  if(currPatches) {
    skipChildren = applyPatches(domNode, currPatches);
  }

  if (domNode.childNodes && !skipChildren) {
    const childArr = [].slice.call(domNode.childNodes);
    childArr.forEach((child, i) => {
      walker.index++;
      walk(child, patches, walker);
    });
  }
}

/**
 * patch a single dom node.
 * @param {NodeList} domNode 
 * @param {Array} patch
 * @returns {Boolean} whether to patch children or not. 
 */
function applyPatches(domNode, patches) {
  let props, newNode, _events;

  patches.forEach(patch => {
    switch(patch.type) {
    case REPLACE:
      newNode = (patch.node instanceof VNode || patch.node.render)
        ? patch.node.render() // an instance of VNode or a custom node.
        : typeof patch.node === 'string'
        ? document.createTextNode(patch.node)
        : new Error('You might be using a custom-defined node, if so, you need to provide a render function.');
      
      if (newNode instanceof Error) {
        throw newNode;
      }
      patch.oldNode.detachEventListeners(); // avoid memory leaking.
      domNode.parentNode.replaceChild(newNode, domNode);
      return true;   // there'll be no more patches.

    case PROPS:
      props = patch.props;
      for (let propName in props) {
        if ((_events = propName.match(eventHookRe))) {
          // detach all event listeners added previously
          patch.node.detachEventListeners();
          if (typeof props[propName] === 'function')
            domNode.addEventListener(_events[1], props[propName], false);
        }

        else if (props[propName] === void 0)
          domNode.removeAttribute(propName !== 'className' ? propName : 'class');
        else
          domNode.setAttribute(propName !== 'className' ? propName : 'class', props[propName]);
      }
      break;

    case TEXT:
      if (domNode.textContent) {
        domNode.textContent = patch.text;
      } else {
        domNode.nodeValue = patch.text;
      }
      break;
    
    case REORDER:
      reorderChildren(domNode, patch.moves);
      break;

    default:
      throw new Error('Some internal error.');
    }
  });
  // do not skip children.
  return false;
}

// TODO: Add batch.
function reorderChildren(domNode, moves) {
  const childNodes = domNode.childNodes;
  let node;

  moves.forEach(move => {
  switch(move.type) {
    case 'INSERT':
      try {
        node = move.node.render();
        domNode.insertBefore(node, childNodes[move.index]);
      } catch (e) {
        console.log('A custom-defined node should have a render method, otherwise it must be defined as a function.');
      }
      break;

    case 'REMOVE':
      domNode.removeChild(childNodes[move.index]);
      move.node.detachEventListeners();
      break;

    case 'MOVE':
      domNode.insertBefore(childNodes[move.from], childNodes[move.to]);
      break;
    }
  });
}