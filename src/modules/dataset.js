export default function () {
  return {
    name: 'dataset',
    creating: updateDataset,
    updating: updateDataset
  };
}

function updateDataset(elem, dataset) {
  const oldset = elem.dataset;

  if (dataset == null) {
    for (const key in oldset) {
      delete oldset[key];
    }
    return;
  }

  // remove something dosen't exist.
  for (const key in oldset) {
    if (!(key in dataset) || dataset[key] == null) {
      delete oldset[key];
    }
  }

  // update or add.
  for (const key in dataset) {
    if (dataset && dataset[key] !== oldset[key]) {
      oldset[key] = dataset[key];
    }
  }
}