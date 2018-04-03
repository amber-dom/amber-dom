export default listDiff;

function listDiff (oldList, newList, key) {
  const oldListKeys = getKeys(oldList, key);
  const newListKeys = getKeys(newList, key);
  const oldListLength = oldList.length;
  const newListLength = newList.length;
  const moves = [];

  // record the move of the last element.
  let indexDeltas = new Array(oldListLength).fill(0);
  let _physicalIndex;

  newListKeys.forEach((key, newIndex) => {
    let oldIndex = oldListKeys.indexOf(key);

    if (oldIndex === -1) {
      // Element doesn't exist in `newList` yet. Tell it to
      // insert it.
      moves.push({
        type: 'insert',
        index: newIndex,
        item: newList[newIndex]
      });

      // the last element got affected.
      indexDeltas[oldListLength - 1]++;
    } else {
      _physicalIndex = oldIndex;
      oldIndex += indexDeltas.reduce((prev, delta, i) => {
        if (i >= oldIndex) {
          return prev + delta;
        } else {
          return prev;
        }
      });

      // If it is already in place, don't do anything.
      if (newIndex === oldIndex)  return;

      moves.push({
        type: 'move',
        from: oldIndex, 
        to: newIndex
      });

      // It is impossible to move element from front to back.
      indexDeltas[_physicalIndex]++;
    }
  });

  // Items to be removed is affected by every delta.
  let indexDelta = indexDeltas.reduce((prev, delta) => prev + delta);
  oldListKeys.forEach((key, i) => {
    
    if (newListKeys.indexOf(key) === -1)
      moves.push({
        type: 'remove',
        index: i + indexDelta
      });
  });

  return moves;
}

function getKeys(list, key) {
  return list.map((item, i) => {
    if (key && item) {
      return typeof key === 'function'
        ? key(item)
        : item[key];
    } else  return void 0;
  });
}