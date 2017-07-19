import React from 'react';
import quest from 'react-quest';
import compose from 'recompose/compose';
import withHandlers from 'recompose/withHandlers';
import range from 'lodash/range';

const postsResolver = {
  key: 'posts',
  get: query => {
    if (query.first) {
      return Promise.resolve(
        range(1, query.first).map(page => ({
          id: page,
          title: `Post ${page}`
        }))
      );
    }
    if (query.next) {
      return (dispatch, getCurrentPosts) => {
        const currentPosts = getCurrentPosts();
        const startIndex = currentPosts.length + 1;
        return Promise.resolve(
          range(startIndex, startIndex + query.next).map(page => ({
            id: page,
            title: `Post ${page}`
          }))
        ).then(newPosts => {
          return dispatch.update([...currentPosts, ...newPosts]);
        });
      };
    }
  }
};

const enhance = compose(
  quest({
    resolver: postsResolver,
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

const Posts = ({ posts, loadMore }) =>
  <div>
    {posts.data
      ? posts.data.map(post =>
          <h3 key={post.id}>
            {post.title}
          </h3>
        )
      : <p>Loading posts...</p>}
    <button onClick={loadMore}>Load more posts</button>
  </div>;

export default enhance(Posts);
