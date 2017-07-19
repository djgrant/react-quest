import React from 'react';
import { shallow } from 'enzyme';
import { reducer } from '../src';
import {
  types,
  startQuest,
  resolveQuest,
  rejectQuest,
  revertQuest
} from '../src/actions';

describe('actions', function() {
  it('should create an action to resolve a quest', function() {
    const actual = resolveQuest('items', [1, 2, 3]);
    const expected = {
      type: types.fetched,
      key: 'items',
      data: [1, 2, 3]
    };
    expect(actual).toEqual(expected);
  });
});

describe('async actions', function() {
  const mockDispatch = jest.fn();
  const mockGetState = () => ({
    _data_: {
      items: {
        data: [1, 2, 3]
      }
    }
  });

  afterEach(function() {
    mockDispatch.mockReset();
  });

  it('should create an action to start a quest', async function() {
    const getter = () => Promise.resolve([1, 2, 3, 4]);
    const thunk = startQuest('items', getter);
    const result = await thunk(mockDispatch, mockGetState);

    expect(mockDispatch).toBeCalledWith({
      type: types.fetching,
      key: 'items'
    });

    expect(mockDispatch).toBeCalledWith({
      type: types.fetched,
      key: 'items',
      data: [1, 2, 3, 4]
    });

    expect(result).toEqual([1, 2, 3, 4]);
  });

  it('should handle an array of promises', async function() {
    const getter = () => [
      Promise.resolve([1, 2, 3, 4]),
      Promise.resolve([1, 2, 3, 4, 5])
    ];
    const thunk = startQuest('items', getter);
    const result = await thunk(mockDispatch, mockGetState);

    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should revert the data if a promise rejects', async function() {
    const getter = () => [Promise.resolve([1, 2, 3, 4]), Promise.reject()];
    const thunk = startQuest('items', getter);
    const result = await thunk(mockDispatch, mockGetState).catch(err => {});

    expect(mockDispatch).toBeCalledWith({
      type: types.fetched,
      key: 'items',
      data: [1, 2, 3],
      reverted: true
    });

    expect(result).toEqual(undefined);
  });
});

describe('reducer', function() {
  it('should add a key to the state', function() {
    const state = reducer({}, { key: 'items', type: types.fetching });
    expect(state).toHaveProperty('items');
  });
});
