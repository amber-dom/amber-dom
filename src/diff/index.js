import listDiff from './list-diff';
import { isEmpty } from '../util';
import patchType from './patch-type';


const { REPLACE, REORDER, TEXT, PROPS } = patchType;

export default function diff (oldTree, newTree) {
  const patches = {};
  walk(oldTree, newTree, patches, 0);
  return patches;
}

function walk(oldNode, newNode, patches, index) {
  var currPatches = [];
  var propPatches, childrenPatches;

  // TODO: let custom-defined component take control of diffing.

  if (newNode === void 0) {
    // oldNode will be removed.
    return patches;
  }

  // both Text node.
  else if (typeof oldNode === 'string' && typeof newNode === 'string') {

    if (oldNode === newNode) {
      // nothing to patch.
    } else {
      patches[index] = [{ type: TEXT, text: newNode }];
    }
    // there would be no props nor children.
    return patches;
  }

  propPatches = diffProps(oldNode.props || {}, newNode.props || {});

  // the whole node should be replaced, if tag names are not the same
  // or keys diffed.splice(oldListLength, 0, ...inserted); are not the same.
  if (oldNode.tagName !== newNode.tagName ||
      oldNode.key !== newNode.key) {
    
      currPatches.push({
        type: REPLACE,
        node: newNode
      });
      patches[index] = currPatches;
      // do not diff their children anymore.
      return patches;
  }
  // only patch some props.
  else if (!isEmpty(propPatches)) {
    currPatches.push({
      type: PROPS,
      props: propPatches
    });
  }

  diffChildren(
    oldNode.children || [],
    newNode.children || [],
    patches,
    currPatches,
    index
  );
  if (currPatches.length) {
    patches[index] = currPatches;
  }
  return patches;
}

function diffProps(oldProps, newProps) {
  var propPatches = {}, value;

  // update props.
  for (const propName in newProps) {
    if (newProps.hasOwnProperty(propName)) {
      value = newProps[propName];
      if (oldProps[propName] !== value) {
        propPatches[propName] = value;
      }
    }
  }
  // remove old props.
  for (const propName in oldProps) {
    if (!(propName in newProps))
      propPatches[propName] = void 0;
  }
  return propPatches;
}


function diffChildren(oldChildren, 
  newChildren, patches, currPatches, index) {
  const diffs = listDiff(oldChildren, newChildren, 'key');

  oldChildren = diffs.diffed; // Must reorder them first before steppin deeper.
  if (diffs.moves.length) {
    currPatches.push({
      type: REORDER,
      moves: diffs.moves
    });
  }

  var prevSibling = null;
  var currIndex = index;
  oldChildren.forEach((child, i) => {
    const newChild = newChildren[i];
    currIndex = (prevSibling && prevSibling.count)
      ? prevSibling.count + currIndex + 1
      : currIndex + 1;  // the first child.
    walk(child, newChildren[i], patches, currIndex);
    prevSibling = child;
  });
}