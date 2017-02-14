export var initialState = { inProgress: false, completed: false, error: null, result: null };

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
