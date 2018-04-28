'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function dataset () {
  return {
    name: 'dataset',
    creating: updateDataset,
    updating: updateDataset
  };
}

function updateDataset(elem, dataset) {
  var oldset = elem.dataset;

  if (dataset == null) {
    for (var key in oldset) {
      delete oldset[key];
    }
    return;
  }

  // remove something dosen't exist.
  for (var _key in oldset) {
    if (!(_key in dataset) || dataset[_key] == null) {
      delete oldset[_key];
    }
  }

  // update or add.
  for (var _key2 in dataset) {
    if (dataset && dataset[_key2] !== oldset[_key2]) {
      oldset[_key2] = dataset[_key2];
    }
  }
}

exports.default = dataset;
