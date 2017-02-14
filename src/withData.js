import { compose } from 'redux';
import { connect } from 'react-redux';
import lifecycle from 'recompose/lifecycle';
import omitProps from './omitProps';
import { updateData } from '../ducks/_data_/actions';
import { initialState } from '../ducks/_data_/reducer';

var withData = ({
  resolver,
  async = false
}) => {
  var key = resolver.key;
  return compose(
    // map data already in store to a data prop
    connect(
      state => ({
        [key]: state._data_[key] || initialState
      }),
      (dispatch, props) => ({
        update: next => {
          if (next === undefined) {
            dispatch(updateData(key, resolver.get.bind(null, props)));
          } else if (typeof next === 'function') {
            dispatch(updateData(key, next));
          } else {
            dispatch(updateData(key, () => Promise.resolve({ result: next })));
          }
        }
      })
    ),
    lifecycle({
      componentWillMount() {
        // Call resolver with props - resolver = props => fn(props)
        this.getData = resolver.get.bind(null, this.props);
        // if the data isn't already being fetched into the store add it
        if (!async && !this.props[key].completed && !this.props[key].inProgress) {
          this.props.update();
        }
      },
      componentDidMount() {
        // if the data failed on the server, try again on client
        if (async || this.props[key].error) {
          this.props.update();
        }
      }
    }),
    omitProps(['update'])
  );
};

export default withData;
