import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import when from 'recompose/branch';
import mapProps from 'recompose/mapProps';
import withProps from 'recompose/withProps';
import renderNothing from 'recompose/renderNothing';
import omitProps from './utils/omitProps';
import { startQuest, resolveQuest } from './actions';
import { initialState } from './reducer';

var never = () => false;

var quest = (
  {
    query = null,
    resolver,
    async = false,
    waitForData = false,
    mapDirect = false,
    selector,
    mapToProps,
    mapData,
    defaultData,
    fetchOnce,
    refetchWhen = never
  },
  branch
) => {
  var key = resolver.key;

  return compose(
    // map data already in store to a data prop
    connect(
      state => ({
        [key]: state._data_[key] || initialState
      }),
      (dispatch, props) => ({
        updateData: next => {
          var options = {
            query: typeof query === 'function' ? query(props) : query
          };
          if (next === undefined) {
            return dispatch(startQuest(key, resolver.get.bind(null, options)));
          } else if (typeof next === 'function') {
            return dispatch(startQuest(key, next));
          }
          return dispatch(resolveQuest(key, next));
        }
      })
    ),
    Base => React.createClass({
      componentWillMount() {
        // if the data isn't already being fetched into the store add it
        if (
          !async &&
          shouldFetch(fetchOnce, this.props) &&
          !this.props[key].completed &&
          !this.props[key].inProgress
        ) {
          return this.props.updateData();
        }
      },
      componentDidMount() {
        // if the data failed on the server, try again on client
        if (
          async && shouldFetch(fetchOnce, this.props) || this.props[key].error
        ) {
          this.props.updateData();
        }
      },
      componentWillReceiveProps(nextProps) {
        if (
          shouldFetch(fetchOnce, this.props) ||
          refetchWhen(this.props, nextProps)
        ) {
          this.props.updateData();
        }
      },
      render() {
        return <Base {...this.props} />;
      }
    }),
    // connect to the store again in case the dispatch(updateData) call
    // in componentDidMount resolved sychronously
    // Necesary for server rendering so sync quests can be run in single pass
    connect(state => ({
      [key]: state._data_[key] || initialState
    })),
    // add programatic methods
    withProps(props =>
      Object.keys(resolver).filter(key => typeof key === 'function').reduce((
        accProps,
        method
      ) => ({
        ...accProps,
        // allow method to be called with some options and a dispatcher
        // so the resolver can take responsibility for updating the cached data
        [`${method}${capitalize(key)}`]: query => props.updateData(
          resolver[method]({
            ...query,
            data: props[key].data
          })
        )
      }), {})),
    // Programatic GET handles update itself
    withProps(props => ({
      [`get${capitalize(key)}`]: () => props.updateData()
    })),
    // Once there's the data is resolved, we can manipulate the resulting data
    when(
      props => selector && hasData(props[key]),
      mapProps(props => ({
        ...props,
        [key]: {
          ...props[key],
          data: selector(props[key].data)
        }
      }))
    ),
    when(
      props => mapToProps && hasData(props[key]),
      mapProps(props => ({
        ...props,
        ...mapToProps(props[key].data, props)
      }))
    ),
    when(
      props => mapData && hasData(props[key]),
      mapProps(props => ({
        ...props,
        [key]: {
          ...props[key],
          data: mapData(props[key].data)
        }
      }))
    ),
    // in certain cases e.g. the resulting data is always resolved
    // the data can be mapped directly to the key prop
    when(
      props => mapDirect && hasData(props[key]),
      mapProps(props => ({
        ...props,
        [key]: props[key].data
      }))
    ),
    when(
      props => waitForData && (!hasData(props[key]) || hasError(props[key])),
      branch ? branch : renderNothing
    ),
    when(
      props => !hasData(props[key]) && defaultData,
      mapProps(props => ({
        ...props,
        [key]: {
          ...props[key],
          data: typeof defaultData === 'function'
            ? defaultData(props)
            : defaultData
        }
      }))
    ),
    omitProps(['updateData'])
  );
};

function hasData(state) {
  return state.data !== null;
}

function hasError(state) {
  return !!state.error;
}

function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1);
}

function shouldFetch(fetchOnce, props) {
  if (typeof fetchOnce !== 'function') {
    return true;
  }
  return fetchOnce(props);
}

quest.sync = opts => quest({ ...opts, mapDirect: true, waitForData: true });

export default quest;
