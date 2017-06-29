import React from 'react';
import { compose } from 'redux';
import { mount } from 'enzyme';
import quest from '../src';
import { reducer as questReducer } from '../src';
import { createTestStore, withStore, Items } from './specUtils';

describe('quest: setup', function() {
  const store = createTestStore();

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
      get: () => [1, 2, 3]
    };

    const ItemsWithData = compose(
      withStore(store),
      quest({ resolver: itemsResolver })
    )(Items);

    mount(<ItemsWithData />);
    var state = store.getState()._data_;
    expect(state).toHaveProperty('items');
  });
});
