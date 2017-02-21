import { compose } from 'redux';
import { connect } from 'react-redux';
import when from 'recompose/branch';
import mapProps from 'recompose/mapProps';
import withProps from 'recompose/withProps';
import lifecycle from 'recompose/lifecycle';
import omitProps from './utils/omitProps';
import { startQuest, resolveQuest } from './actions';
import { initialState } from './reducer';

var never = () => false;

var quest = ({
  query = null,
  resolver,
  async = false,
  mapDirect = false,
  selector,
  mapToProps,
  reloadWhen = never
}) => {
  var key = resolver.key;
  return compose(
    // map data already in store to a data prop
    connect(
      state => ({
        [key]: state._data_[key] || initialState
      }),
      (dispatch, props) => ({
        updateData: next => {
          if (next === undefined) {
            dispatch(startQuest(key, resolver.get.bind(null, ({ query }))));
          } else if (typeof next === 'function') {
            dispatch(startQuest(key, next));
          } else {
            dispatch(resolveQuest(key, next));
          }
        }
      })
    ),
    lifecycle({
      componentWillMount() {
        // if the data isn't already being fetched into the store add it
        if (!async && !this.props[key].completed && !this.props[key].inProgress) {
          this.props.updateData();
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
    withProps(props => Object.keys(resolver).reduce(
      (accProps, method) => ({
        ...accProps,
        // allow method to be called with some options and a dispatcher
        // so the resolver can take responsibility for updating the cached data
        [`${method}${capitalize(key)}`]: query => resolver[method]({
          ...query,
          data: props[key].data,
          updateData: props.updateData
        })
      }), {})
    ),
    // Programatic GET handles update itself
    withProps(props => ({
      [`get${capitalize(key)}`]: () => props.updateData()
    })),
    // Once there's the data is resolved, we can manipulate the resulting data
    when(props => props[key].data, compose(
      when(
        () => selector,
        mapProps(props => ({
          ...props,
          [key]: {
            ...props[key],
            data: selector(props[key].data)
          }
        }))
      ),
      when(
        () => mapToProps,
        mapProps(props => ({
          ...props,
          ...mapToProps(props[key].data, props)
        }))
      ),
      // in certain cases e.g. the resulting data is always resolved
      // the data can be mapped directly to the key prop
      when(
        () => mapDirect,
        mapProps(props => ({
          ...props,
          [key]: props[key].data
        }))
      )
    )),
    omitProps(['update'])
  );
};

export default quest;

function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1);
}
