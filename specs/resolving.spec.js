import React from 'react';
import { compose } from 'redux';
import withProps from 'recompose/withProps';
import withHandlers from 'recompose/withHandlers';
import quest from '../src';
import { mount, getHocProps, withStore, delay } from './specUtils';
const { objectContaining, anything } = expect;

describe('quest: resolving data', function() {
  const itemsResolver = {
    key: 'items',
    get: () => Promise.resolve([1, 2, 3]),
    create: (num, current) => Promise.resolve([...current, num]),
    update: (num, current) => [
      Promise.resolve([...current, num]),
      new Promise(resolve =>
        setTimeout(() => resolve([...current, num, num + 1]), 100))
    ]
  };

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

  it('should resolve optimistic updates', async function() {
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
    await delay(100);
    expect(hocProps.items.data).toEqual([1, 2, 3, 4, 5]);
  });
});
