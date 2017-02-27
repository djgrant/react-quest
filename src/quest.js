import { compose } from 'redux';
import { connect } from 'react-redux';
import when from 'recompose/branch';
import mapProps from 'recompose/mapProps';
import withProps from 'recompose/withProps';
import lifecycle from 'recompose/lifecycle';
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
    reloadWhen = never
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
    lifecycle({
      componentWillMount() {
        // if the data isn't already being fetched into the store add it
        if (
          !async && !this.props[key].completed && !this.props[key].inProgress
        ) {
          // Allow https://www.npmjs.com/package/react-warmup to async traverse
          // to warm up app store
          return this.props.updateData();
        }
      },
      componentDidMount() {
        // if the data failed on the server, try again on client
        if (async || this.props[key].error) {
          this.props.updateData();
        }
      },
      componentWillReceiveProps(nextProps) {
        if (reloadWhen(this.props, nextProps)) {
          this.props.updateData();
        }
      }
    }),
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

quest.sync = opts => quest({ ...opts, mapDirect: true, waitForData: true });

export default quest;
