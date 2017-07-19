export const types = {
  fetching: '@quest/FETCHING_DATA',
  fetched: '@quest/FETCHED_DATA'
};

export function startQuest(key, resolverMethod) {
  return (dispatch, getState) => {
    dispatch({ type: types.fetching, key });

    const dispatcher = {
      update: (...args) => dispatch(resolveQuest(key, ...args))
    };

    const getCurrentData = () => getState()._data_[key].data;

    const onResolution = data => {
      dispatch(resolveQuest(key, data));
      return data;
    };

    const onRejection = () => {
      var currentData = getCurrentData();
      dispatch(resolveQuest(key, currentData, { reverted: true }));
      return currentData;
    };

    let updater = resolverMethod();
    let updates = [];

    if (typeof updater === 'function') {
      updates = updates.concat(updater(dispatcher, getCurrentData));
      updates.forEach(update => {
        Promise.resolve(update).catch(onRejection);
      });
    } else {
      updates = updates.concat(updater);
      updates.forEach(update => {
        Promise.resolve(update).then(onResolution).catch(onRejection);
      });
    }

    return Promise.all(updates).then(results => results[results.length - 1]);
  };
}

export function resolveQuest(key, data, options = {}) {
  return { type: types.fetched, key, data, ...options };
}
