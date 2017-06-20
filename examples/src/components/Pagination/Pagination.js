import React from 'react';
import quest from 'react-quest';
import compose from 'recompose/compose';
import withHandlers from 'recompose/withHandlers';
import range from 'lodash/range';

const enhance = compose(
  quest({
    resolver: {
      key: 'posts',
      get: (query, currentPosts) => {
        if (query.first) {
          return Promise.resolve(
            range(query.first).map(page => ({
              id: page,
              title: `Post ${page}`
            }))
          );
        }
        if (query.next) {
          const lastPostIndex = currentPosts.length;
          return Promise.resolve([
            ...currentPosts,
            ...range(lastPostIndex, lastPostIndex + query.next).map(page => ({
              id: page,
              title: `Post ${page}`
            }))
          ]);
        }
      }
    },
    query: {
      first: 5
    }
  }),
  withHandlers({
    loadMore: props => event =>
      props.posts.get({
        next: 5
      })
  })
);

const Posts = ({ posts, loadMore }) => (
  <div>
    {posts.data
      ? posts.data.map(post => <h3 key={post.id}>{post.title}</h3>)
      : <p>Loading posts...</p>}
    <button onClick={loadMore}>Load more posts</button>
  </div>
);

export default enhance(Posts);
