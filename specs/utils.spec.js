import React from 'react';
import { shallow } from 'enzyme';
import { omit, omitProps } from '../src/utils';

describe('HOC: omitProps', function() {
  it('omit: should omit object properties', function() {
    expect(omit(['a'])({ a: 1, b: 2 })).toEqual({ b: 2 });
  });

  it('omitProps: should omit component props', function() {
    var testProps = {
      'data-a': 1,
      'data-b': () => 2,
      'data-c': '3'
    };

    var Enhanced = omitProps(['data-a', 'data-b'])('div');
    var wrapper = shallow(<Enhanced {...testProps} />);

    expect(wrapper.props()).toEqual({ 'data-c': '3' });
  });
});
