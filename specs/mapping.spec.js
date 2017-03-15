import React from 'react';
import { compose } from 'redux';
import withProps from 'recompose/withProps';
import quest from '../src';
import { getHocProps } from './specUtils';
const { objectContaining, anything } = expect;

describe('quest: mapping data', function() {
  const itemsResolver = {
    key: 'items',
    get: () => Promise.resolve([1, 2, 3])
  };

  it('mapData transform the resolved data', async function() {
    const hoc = quest({
      resolver: itemsResolver,
      mapData: items => ({
        firstItem: items[0]
      })
    });

    const props = await getHocProps(hoc);
    const actual = props.items.data;
    const expected = objectContaining({ firstItem: 1 })

    expect(actual).toEqual(expected);
  });

  it('mapToProps maps data to props', async function() {
    const hoc = compose(
      withProps({
        test: 1
      }),
      quest({
        resolver: itemsResolver,
        mapToProps: (items, ownProps) => ({
          firstItem: items[0],
          test: ownProps.test
        })
      })
    );

    const actual = await getHocProps(hoc);
    const expected = objectContaining({ firstItem: 1, test: 1 })

    expect(actual).toEqual(expected);
  });

  it.skip('mapToProps maps resolver methods to props', function() {
  });
});
