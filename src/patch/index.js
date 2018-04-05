import VNode from '../vnode/index';
import patchType from '../diff/patch-type.js';
export default patch;


const { REPLACE, REORDER, PROPS, TEXT } = patchType;

function patch(domRoot, patches) {
  walk(domRoot, patches, 0);
}

function walk(domNode, patches, index) {
  const currPatches = patches[index];

  // nothing to patch.
  if (!currPatches) {
    return;
  }

  applyPatch(domNode, currPatches);

}

/**
 * patch a single dom node.
 * @param {NodeList} domNode 
 * @param {Array} patch 
 */
function applyPatches(domNode, patches) {
  let props;

  patches.forEach(patch => {
    switch(patch.type) {
    case REPLACE:
      newNode = (patch.node instanceof VNode || patch.node.render)
        ? patch.node.render() // an instance of VNode or a custom node.
        : typeof patch.node === 'string'
        ? document.createTextNode(patch.node)
        : new Error('You might be using a custom node, if so, you need to provide a render function.');
      if (newNode instanceof Error) {
        throw newNode;
      }
      break;

    case PROPS:
      props = patch.props;
      for (const propName in props) {
        if (props[propName] === void 0)
          domNode.removeAttribute(propName);
        else
          domNode.setAttribute(propName, props[propName]);
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
      reorderChildren(domNode.childNodes, patch.moves);
      break;

    default:
      throw new Error('Some internal error.');
    }
  });
}

// TODO: 
function reorderChildren(childNodes, moves) {

}