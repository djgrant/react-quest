import { types } from './actions';

export var defaultState = {
  loading: false,
  ready: false,
  reverted: false,
  error: null,
  data: null
};

export default function reducer(state = {}, action) {
  if (action.type === types.fetching) {
    return {
      ...state,
      [action.key]: {
        ...defaultState,
        ...state[action.key],
        loading: true,
        ready: false
      }
    };
  }

  if (action.type === types.fetched) {
    return {
      ...state,
      [action.key]: {
        loading: false,
        ready: true,
        reverted: action.reverted || false,
        error: action.error || null,
        data: action.data || null
      }
    };
  }

  return state;
}
// 
// function quest(state = defaultState, action) {
//
// }
