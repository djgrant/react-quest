import React from 'react';
import { compose } from 'redux';
import withProps from 'recompose/withProps';
import withHandlers from 'recompose/withHandlers';
import quest from '../src';
import {
  mount,
  getHocProps,
  mountHoc,
  withStore,
  delay,
  createTestStore
} from './specUtils';
const { objectContaining, anything } = expect;

describe('quest: resolving data', function() {
  const resolveGet = jest.fn();
  const resolveUpdate = jest.fn();
  const testResolver = {
    key: 'test',
    get: resolveGet,
    update: resolveUpdate
  };
  const itemsResolver = {
    key: 'items',
    get: () => Promise.resolve([1, 2, 3]),
    create: num => (dispatch, getCurrent) =>
      Promise.resolve().then(() => dispatch.update([...getCurrent(), num])),
    update: num => (dispatch, getCurrent) => [
      dispatch.update([...getCurrent(), num]),
      new Promise(resolve =>
        setTimeout(() => resolve(num, num + 1), 100)
      ).then(newNum => dispatch.update([...getCurrent(), newNum]))
    ]
  };

  afterEach(function() {
    resolveGet.mockClear();
    resolveUpdate.mockClear();
  });

  it('passes a query to the resolver', async function() {
    const hoc = quest({
      resolver: testResolver,
      query: 'test query'
    });

    await mountHoc(hoc);
    const args = resolveGet.mock.calls[0];
    expect(args[0]).toEqual('test query');
  });

  it('resolves thunks', async function() {
    const resolver = {
      key: 'asyncTest',
      get(query) {
        return (dispatch, getCurrentData) =>
          new Promise(resolve =>
            setTimeout(() => resolve(query.data))
          ).then(data =>
            dispatch.update({
              ...getCurrentData(),
              ...data
            })
          );
      }
    };

    const hoc = compose(
      quest({
        resolver: resolver,
        query: { data: { a: 1 } }
      }),
      quest({
        resolver: resolver,
        query: { data: { b: 2 } }
      })
    );

    const store = createTestStore({ _data_: { asyncTest: { data: {} } } });
    await mountHoc(hoc, {}, store);
    await delay(10);

    const data = store.getState()._data_.asyncTest.data;
    expect(data).toEqual({ a: 1, b: 2 });
  });

  it('maps the default query before passing it to the get method', async function() {
    const hoc = compose(
      withProps({
        testHeader: 'test header'
      }),
      quest({
        resolver: testResolver,
        query: 'test query',
        mapQuery: (query, props) => ({
          headers: {
            testHeader: props.testHeader
          },
          data: query
        })
      })
    );

    await mountHoc(hoc);
    const expected = {
      headers: {
        testHeader: 'test header'
      },
      data: 'test query'
    };
    const args = resolveGet.mock.calls[0];
    expect(args[0]).toEqual(expected);
  });

  it('maps queries before passing them to mutation methods', async function() {
    const Button = compose(
      withStore(),
      withProps({
        testHeader: 'test header'
      }),
      quest({
        resolver: testResolver,
        mapQuery: (query, props) => ({
          headers: {
            testHeader: props.testHeader
          },
          data: query
        })
      }),
      withHandlers({
        update: props => e => props.test.update('test query')
      })
    )(props => {
      return <button onClick={props.update} />;
    });

    const mounted = await mount(<Button />);
    mounted.find('button').simulate('click');
    await delay(0);

    const expected = {
      headers: {
        testHeader: 'test header'
      },
      data: 'test query'
    };
    const args = resolveUpdate.mock.calls[0];
    expect(args[0]).toEqual(expected);
  });

  it('should resolve promises to quests', async function() {
    const hoc = quest({
      resolver: itemsResolver
    });

    const props = await getHocProps(hoc);
    const actual = props.items.data;
    const expected = [1, 2, 3];

    expect(actual).toEqual(expected);
  });

  it('should resolve mutation methods', async function() {
    let hocProps;
    const Button = compose(
      withStore(),
      quest({
        resolver: itemsResolver
      }),
      withHandlers({
        create: props => e => props.items.create(4)
      })
    )(props => {
      hocProps = props;
      return <button onClick={props.create} />;
    });

    const mounted = await mount(<Button />);
    mounted.find('button').simulate('click');
    await delay(0);
    expect(hocProps.items.data).toEqual([1, 2, 3, 4]);
  });

  it('resolves optimistic updates', async function() {
    let hocProps;
    const Button = compose(
      withStore(),
      quest({
        resolver: itemsResolver
      }),
      withHandlers({
        update: props => e => props.items.update(4)
      })
    )(props => {
      hocProps = props;
      return <button onClick={props.update} />;
    });

    const mounted = await mount(<Button />);
    mounted.find('button').simulate('click');
    await delay(0);
    expect(hocProps.items.data).toEqual([1, 2, 3, 4]);
  });
});
