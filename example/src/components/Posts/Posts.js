import React from 'react';
import quest from 'react-quest';

const enhance = quest({
  resolver: {
    key: 'posts',
    get: () => {
      console.log(arguments);
      return Promise.resolve([
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' },
        { id: 3, title: 'Post 3' }
      ]);
    }
  }
});

const Posts = ({ posts }) => (
  <div>
    {posts.ready
      ? posts.data.map(post => <h3>{post.title}</h3>)
      : <p>Loading posts...</p>}
  </div>
);

export default enhance(Posts);
