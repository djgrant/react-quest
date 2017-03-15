import React from 'react';
import {
  compose,
  createStore as _createStore,
  combineReducers,
  applyMiddleware
} from 'redux';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { reducer as questReducer } from '../src';

export const createStore = () => _createStore(
  combineReducers({
    _data_: questReducer
  }),
  applyMiddleware(thunk)
);

export const withStore = store => App => () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export const getHocProps = (hoc, store) => {
  let result;
  const HocWithPropsCatcher = compose(
    withStore(store || createStore()),
    hoc
  )(props => {
    result = props;
    return null;
  });
  mount(<HocWithPropsCatcher />);
  return new Promise(resolve => setTimeout(() => resolve(result), 0));
};

export const Items = props => {
  if (props.items.loading) return <div>Loading</div>;
  if (props.items.error) return <div>Error</div>;
  return <div>{JSON.stringify(props.items.data)}</div>;
};
