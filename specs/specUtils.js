import React from 'react';
import {
  compose,
  createStore as _createStore,
  combineReducers,
  applyMiddleware
} from 'redux';
import { mount as _mount } from 'enzyme';
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
  <Provider store={store || createStore()}>
    <App />
  </Provider>
);

export const mount = node => new Promise(resolve => {
  const mounted = _mount(node);
  setTimeout(() => resolve(mounted), 0);
});

export const delay = (interval = 0) => new Promise(resolve => {
  setTimeout(() => resolve(), interval);
});

export const mountHoc = async (hoc, props, store) => {
  const Hoc = hoc(() => null);
  await mount(
    <Provider store={store || createStore()}>
      <Hoc {...props} />
    </Provider>
  );
};

export const getHocProps = async (hoc, props, store) => {
  let result;
  const HocWithPropsCatcher = hoc(props => {
    result = props;
    return null;
  });
  await mount(
    <Provider store={store || createStore()}>
      <HocWithPropsCatcher {...props} />
    </Provider>
  );
  return result;
};

export const Items = props => {
  if (props.items.loading) return <div>Loading</div>;
  if (props.items.error) return <div>Error</div>;
  return <div>{JSON.stringify(props.items.data)}</div>;
};
