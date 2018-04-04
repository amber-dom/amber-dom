import listDiff from './listDiff';
import { isEmpty } from './util';

const REPLACE = 'REPLACE';
const REORDER = 'REORDER';
const PROPS = 'FIXPROPS';
const TEXT = 'TEXT';

export function diff (oldTree, newTree) {
  const patches = {};
  walk(oldTree, newTree, patches, 0);
  return patches;
}

function walk(oldNode, newNode, patches, index) {
  var currPatches = [];
  var propPatches, childrenPatches;

  // both Text node.
  if (typeof oldNode === 'string' && typeof newNode === 'string') {

    if (oldNode === newNode) {
      // nothing to patch.
    } else {
      patches[index] = { type: TEXT, text: newNode };
    }
    // there would be no props nor children.
    return;
  }

  propPatches = diffProps(oldNode, newNode);
  // the whole node should be replaced.
  if (oldNode.tagName !== newNode.tagName ||
      oldNode.key !== newNode.key) {  // actually, their keys must be equal.
    
      currPatches.push({
      type: REPLACE,
      node: newNode
    });
  }
  // only patch some props.
  else if (!isEmpty(propPatches)) {
    currPatches.push({
      type: PROPS,
      content: propPatches
    });
  }

  diffChildren(
    oldNode,
    newNode,
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

  // className might be changed partially.
  propPatches.classPatches = 
    diffClassNames(oldProps.className, newProps.className);

  for (const propName in newProps) {
    if (newProps.hasOwnProperty(propName)) {
      if (propName === 'className') continue; // already done.
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
}

function diffClassNames(oldClass, newClass) {
  var classPatches = [];

  newClass.forEach((name) => {
    if (oldClass.indexOf(name) === -1) {
      classPatches.push({
        type: 'ADD',
        name: name
      });
    }
  });

  oldClass.forEach((name) => {
    if (newClass.indexOf(name) === -1) {
      classPatches.push({
        type: 'REMOVE',
        name: name
      });
    }
  });
  return classPatches.length !== 0
    ? classPatches
    : void 0;   // this is important.
}

function diffChildren(oldChildren, 
  newChildren, patches, currPatches, index) {
  const moves = listDiff(oldChildren, newChildren, 'key');

  if (moves.length) {
    currPatches.push({
      type: REORDER,
      moves: moves
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