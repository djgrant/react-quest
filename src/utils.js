import { compose } from 'redux';
import mapProps from 'recompose/mapProps';

export const omit = (toRemove = []) => obj =>
  Object.keys(obj).filter(key => !toRemove.includes(key)).reduce(
    (result, key) => ({
      ...result,
      [key]: obj[key]
    }),
    {}
  );

export const omitProps = compose(mapProps, omit);
