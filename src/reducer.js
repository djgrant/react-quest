export var initialState = { loading: false, ready: false, error: null, data: null };

export default function reducer(state = {}, action) {
  if (action.type === '@quest/FETCHING_DATA') {
    return {
      ...state,
      [action.key]: {
        loading: true,
        ready: false,
        error: null,
        data: state[action.key] && state[action.key].data || null
      }
    };
  }

  if (action.type === '@quest/FETCHED_DATA') {
    return {
      ...state,
      [action.key]: {
        loading: false,
        ready: true,
        error: action.error || null,
        data: action.data || null
      }
    };
  }

  return state;
}
