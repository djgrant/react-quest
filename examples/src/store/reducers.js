import { combineReducers } from 'redux';
import { reducer as questReducer } from 'react-quest';

const reducer = combineReducers({
  _data_: questReducer
});

export default reducer;
