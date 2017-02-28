export function startQuest(key, resolverMethod) {
  return dispatch => {
    dispatch({ type: '@quest/FETCHING_DATA', key });

    return resolverMethod()
      .then(data => {
        dispatch(resolveQuest(key, data));
        return data;
      })
      .catch(error => {
        dispatch(rejectQuest(key, error));
        return data;
      });
  };
}

export function resolveQuest(key, data) {
  return { type: '@quest/FETCHED_DATA', key, data };
}

export function rejectQuest(key, error) {
  return { type: '@quest/FETCHED_DATA', key, error: error.toString() };
}
