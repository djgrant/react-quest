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

export default function reducer(state = {}, action) {
  if (action.type === 'FETCHING_DATA') {
    return {
      ...state,
      [action.key]: {
        inProgress: true,
        completed: false,
        error: null,
        result: state[action.key] && state[action.key].result || null
      }
    };
  }

  if (action.type === 'FETCHED_DATA') {
    return {
      ...state,
      [action.key]: {
        inProgress: false,
        completed: true,
        error: action.error || null,
        result: action.result || null
      }
    };
  }

  return state;
}
