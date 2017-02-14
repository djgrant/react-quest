import { compose } from 'redux';
import mapProps from 'recompose/mapProps';

export var omit = (toRemove = []) => obj =>
  Object.keys(obj)
    .filter(key => !toRemove.includes(key))
    .reduce((result, key) => ({
      ...result,
      [key]: obj[key]
    }), {});

var omitProps = compose(mapProps, omit);

export default omitProps;
