# redux-quest

Declarative data fetching for universal Redux apps.

[![npm](https://img.shields.io/npm/v/redux-quest.svg?style=flat-square)](http://npm.im/redux-quest)
[![MIT License](https://img.shields.io/npm/l/react-jobs.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/djgrant/redux-quest.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/redux-quest)

```js
import quest from 'redux-quest';

const postsResolver = {
  key: 'posts',
  get() {
    return fetch('http://api.posts.com')
  }
};

const withPosts = quest({
  resolver: postsResolver,
  async: true
});

const Items = ({ posts }) => (
  <div>
    {posts.result
      ? posts.result.map(post => <Item entry={post} />)
      : <Loading />
    }
  </div>
);

export default withPosts(Items);
```

### Introduction

redux-quest is a lightweight library (2kb gzip) that ensures React components receive data from remote sources as and when it is needed.
