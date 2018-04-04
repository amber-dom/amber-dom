(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.diffModule = {})));
}(this, (function (exports) { 'use strict';

  var REPLACE = 'REPLACE';
  var REORDER = 'REORDER';
  var PROPS = 'FIXPROPS';
  var TEXT = 'TEXT';

  var patchType = {
    REPLACE: REPLACE,
    REORDER: REORDER,
    PROPS: PROPS,
    TEXT: TEXT
  };

  function diff(oldList, newList, key) {
    var oldListKeys = getKeys(oldList, key);
    var newListKeys = getKeys(newList, key);
    var oldListLength = oldList.length;
    var newListLength = newList.length;
    var diffed = oldList.slice();
    var moves = [];

    // Not a key was provied, don't diff.
    if (noKeys(oldListKeys) && noKeys(newListKeys)) return {
      diffed: diffed,
      moves: moves
    };
    // record the move of the last element.
    var indexDeltas = new Array(oldListLength).fill(0);

    newListKeys.forEach(function (key, newIndex) {
      var _physicalIndex = oldListKeys.indexOf(key);

      if (_physicalIndex === -1) {
        // Element doesn't exist in `newList` yet. Tell it to
        // insert it.
        moves.push({
          type: 'INSERT',
          index: newIndex,
          item: newList[newIndex]
        });
        diffed.splice(newIndex, 0, newList[newIndex]);

        // positions of all unprocessed elements should take this delta.
        indexDeltas[oldListLength - 1]++;
      } else {
        var oldIndex = _physicalIndex;

        for (var i = oldListLength - 1; i >= _physicalIndex; i--) {
          oldIndex += indexDeltas[i];
        }

        // If it is already in place, don't do anything.
        if (newIndex === oldIndex) return;

        moves.push({
          type: 'MOVE',
          from: oldIndex,
          to: newIndex
        });
        var _elem = diffed.splice(oldIndex, 1)[0];
        diffed.splice(newIndex, 0, _elem);

        // It is impossible to move element from front to back.
        indexDeltas[_physicalIndex]++;
      }
    });

    // remove extra.
    oldListKeys.forEach(function (key, i) {

      if (newListKeys.indexOf(key) === -1) {
        moves.push({
          type: 'REMOVE',
          index: newListLength // all extra items must've been moved to end.
        });
        diffed.splice(newListLength, 1);
      }
    });

    return {
      diffed: diffed,
      moves: moves
    };
  }

  // Elements with no `key` field is to be removed.
  function getKeys(list, key) {
    return list.map(function (item, i) {
      if (key && item) {
        return typeof key === 'function' ? key(item) : item[key];
      } else return void 0;
    });
  }

  function noKeys(list) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;

        if (item !== void 0) return false;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return true;
  }

  function isEmpty(obj) {
    return Object.keys(obj || {}).length === 0;
  }

  var REPLACE$2 = patchType.REPLACE,
      REORDER$2 = patchType.REORDER,
      TEXT$2 = patchType.TEXT,
      PROPS$2 = patchType.PROPS;


  function diff$1(oldTree, newTree) {
    var patches = {};
    walk(oldTree, newTree, patches, 0);
    return patches;
  }

  function walk(oldNode, newNode, patches, index) {
    var currPatches = [];
    var propPatches;

    // both Text node.
    if (typeof oldNode === 'string' && typeof newNode === 'string') {

      if (oldNode === newNode) {
        // nothing to patch.
      } else {
        patches[index] = { type: TEXT$2, text: newNode };
      }
      // there would be no props nor children.
      return;
    }

    propPatches = diffProps(oldNode, newNode);
    // the whole node should be replaced.
    if (oldNode.tagName !== newNode.tagName || oldNode.key !== newNode.key) {
      // actually, their keys must be equal.

      currPatches.push({
        type: REPLACE$2,
        node: newNode
      });
    }
    // only patch some props.
    else if (!isEmpty(propPatches)) {
        currPatches.push({
          type: PROPS$2,
          content: propPatches
        });
      }

    diffChildren(oldNode, newNode, patches, currPatches, index);
    if (currPatches.length) {
      patches[index] = currPatches;
    }
    return patches;
  }

  function diffProps(oldProps, newProps) {
    var propPatches = {},
        value;

    // className might be changed partially.
    propPatches.classPatches = diffClassNames(oldProps.className, newProps.className);

    for (var propName in newProps) {
      if (newProps.hasOwnProperty(propName)) {
        if (propName === 'className') continue; // already done.
        value = newProps[propName];
        if (oldProps[propName] !== value) {
          propPatches[propName] = value;
        }
      }
    }
    // remove old props.
    for (var _propName in oldProps) {
      if (!(_propName in newProps)) propPatches[_propName] = void 0;
    }
  }

  function diffClassNames(oldClass, newClass) {
    var classPatches = [];

    newClass.forEach(function (name) {
      if (oldClass.indexOf(name) === -1) {
        classPatches.push({
          type: 'ADD',
          name: name
        });
      }
    });

    oldClass.forEach(function (name) {
      if (newClass.indexOf(name) === -1) {
        classPatches.push({
          type: 'REMOVE',
          name: name
        });
      }
    });
    return classPatches.length !== 0 ? classPatches : void 0; // this is important.
  }

  function diffChildren(oldChildren, newChildren, patches, currPatches, index) {
    var diffs = diff(oldChildren, newChildren, 'key');

    oldChildren = diffs.diffed; // Must reorder them first before steppin deeper.
    if (diffs.moves.length) {
      currPatches.push({
        type: REORDER$2,
        moves: moves
      });
    }

    var prevSibling = null;
    var currIndex = index;
    oldChildren.forEach(function (child, i) {
      var newChild = newChildren[i];
      currIndex = prevSibling && prevSibling.count ? prevSibling.count + currIndex + 1 : currIndex + 1; // the first child.
      walk(child, newChildren[i], patches, currIndex);
      prevSibling = child;
    });
  }

  exports.diff = diff$1;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
