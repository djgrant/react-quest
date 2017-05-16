export const types = {
  fetching: '@quest/FETCHING_DATA',
  fetched: '@quest/FETCHED_DATA'
};

export function startQuest(key, resolverMethod) {
  return (dispatch, getState) => {
    dispatch({ type: types.fetching, key });

    var originalData = getState()._data_[key].data;
    var promises = [].concat(resolverMethod()).map(r => Promise.resolve(r));

    promises.forEach(p => p
      .then(data => {
        dispatch(resolveQuest(key, data));
        return data;
      })
      .catch(() => {
        dispatch(revertQuest(key, originalData));
        return originalData;
      }));

    return Promise.all(promises)
      .then(results => results[results.length - 1])
  };
}

export function resolveQuest(key, data) {
  return { type: types.fetched, key, data };
}

export function rejectQuest(key, error) {
  return { type: types.fetched, key, error: error.toString() };
}

export function revertQuest(key, data) {
  return { type: types.fetched, key, data, reverted: true };
}
