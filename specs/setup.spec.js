import React from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import quest from '../src';
import { reducer as questReducer } from '../src';

var store = createStore(combineReducers({
  _data_: questReducer
}), applyMiddleware(thunk));

var withStoreContext = Component => (
  <Provider store={store}>
    <Component />
  </Provider>
);

describe('quest', function() {
  it('requires a resolver', function() {
    expect(() => {
      quest();
    }).toThrow();
  });

  it('requires a resolver key', function() {
    const resolverNoKey = { key: 'items' };
    const resolverInvalidKey = { key: () => 'items' };

    expect(() => {
      quest({ resolver: resolverNoKey });
    }).toThrow();

    expect(() => {
      quest({ resolver: resolverInvalidKey });
    }).toThrow();
  });

  it('requires a resolver getter', function() {
    const resolverNoGetter = { key: 'items' };
    const resolverInvalidGetter = { key: 'items', get: 'invalid' };

    expect(() => {
      quest({ resolver: resolverNoGetter });
    }).toThrow();

    expect(() => {
      quest({ resolver: resolverInvalidGetter });
    }).toThrow();
  });

  it('returns a function', function() {
    const testResolver = {
      key: 'items',
      get: () => {}
    };
    const actual = typeof quest({ resolver: testResolver });
    const expected = 'function';
    expect(actual).toEqual(expected);
  });

  it('registers the resolver key as a state field', function() {
    const itemsResolver = {
      key: 'items',
      get: () => [1,2,3]
    };

    const Items = quest({ resolver: itemsResolver })(
      props => <div>{JSON.stringify(props.items)}</div>
    );

    mount(withStoreContext(Items));
    var state = store.getState()._data_;
    expect(state).toHaveProperty('items');
  });
});
