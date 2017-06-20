import React from 'react';
import quest from 'react-quest';

const enhance = quest({
  resolver: {
    key: 'posts',
    get: () =>
      Promise.resolve([
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' },
        { id: 3, title: 'Post 3' }
      ])
  }
});

const Posts = ({ posts, loadMore }) => (
  <div>
    {posts.data
      ? posts.data.map(post => <h3 key={post.id}>{post.title}</h3>)
      : <p>Loading posts...</p>}
  </div>
);

export default enhance(Posts);
