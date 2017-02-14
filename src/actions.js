export function updateData(key, task) {
  return dispatch => {
    dispatch({ type: 'FETCHING_DATA', key });

    return task()
      .then(result => {
        dispatch({ type: 'FETCHED_DATA', key, result });
      })
      .catch(error => {
        dispatch({ type: 'FETCHED_DATA', key, error: error.toString() });
      });
  };
}
