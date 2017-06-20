import React from 'react';
import quest from 'react-quest';
import { compose } from 'redux';

const enhance = compose(
  quest({
    resolver: {
      key: 'a',
      get: () =>
        Promise.resolve({
          id: 1,
          description: 'some resource',
          related: [1, 2, 3]
        })
    }
  }),
  quest({
    resolver: {
      key: 'b',
      get: query =>
        Promise.resolve(
          query.ids.map(id => ({
            id,
            title: `Post ${id}`
          }))
        )
    },
    fetchOnce: props => props.a.data && props.a.data.related,
    query: props => ({
      ids: props.a.data.related
    })
  })
);

const Combined = ({ a, b }) => (
  <div>
    {b.data && b.data.map(post => <h3 key={post.id}>{post.title}</h3>)}
  </div>
);

export default enhance(Combined);
