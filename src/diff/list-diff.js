import patchType from './patch-type';
export default diff;


const { REPLACE, REORDER, TEXT, PROPS } = patchType;
function diff(oldList, newList, key) {
  const oldListKeys = getKeys(oldList, key);
  const newListKeys = getKeys(newList, key);
  const oldListLength = oldList.length;
  const newListLength = newList.length;
  let diffed = oldList.slice();
  let moves = [];

  // Not a key was provied, don't diff.
  if (noKeys(oldListKeys) && noKeys(newListKeys)) {
    let op, start, end, index, inserted;

    if (oldListLength === newListLength) {
      return {
        diffed,
        moves
      };
    }

    // Remove accessary nodes.
    if (oldListLength > newListLength) {
      op = 'REMOVE';
      start = newListLength;
      end = oldListLength;
      diffed.splice(newListLength, oldListLength - newListLength);
    }
    
    // Insert neccessary nodes.
    else if (newListLength > oldListLength) {
      op = 'INSERT';
      start = oldListLength;
      end = newListLength;
      inserted = newList.slice(oldListLength);
      diffed = [...diffed, ...inserted];
    }

    for (let i = start; i < end; i++) {
      moves.push({
        type: op,
        index: i,
        item: newList[i] || null  // It doesn't matter what.
      });
    }

    return {
      diffed,
      moves
    };

  }
  // record the move of the last element.
  let indexDeltas = new Array(oldListLength).fill(0);
  let _physicalIndex;

  newListKeys.forEach((key, newIndex) => {
    let _physicalIndex = oldListKeys.indexOf(key);

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
      let oldIndex = _physicalIndex;

      for (let i = oldListLength - 1; i >= _physicalIndex; i--) {
        oldIndex += indexDeltas[i];
      }

      // If it is already in place, don't do anything.
      if (newIndex === oldIndex)  return;

      moves.push({
        type: 'MOVE',
        from: oldIndex, 
        to: newIndex
      });
      let _elem = diffed.splice(oldIndex, 1)[0];
      diffed.splice(newIndex, 0, _elem)

      // It is impossible to move element from front to back.
      indexDeltas[_physicalIndex]++;
    }
  });

  // remove extra.
  oldListKeys.forEach((key, i) => {
    
    if (newListKeys.indexOf(key) === -1) {
      moves.push({
        type: 'REMOVE',
        index: newListLength  // all extra items must've been moved to end.
      });
      diffed.splice(newListLength, 1);
    }
  });

  return {
    diffed,
    moves
  };
}

// Elements with no `key` field is to be removed.
function getKeys(list, key) {
  return list.map((item, i) => {
    if (key && item) {
      return typeof key === 'function'
        ? key(item)
        : item[key];
    } else  return void 0;
  });
}


function noKeys(list) {
  for (const item of list)
    if (item !== void 0)
      return false;

  return true;
}