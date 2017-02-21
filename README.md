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

## Introduction

redux-quest is a lightweight library (2kb gzip) that ensures React components receive data from remote sources as and when it is needed.


## Documentation

- [Setup](#setup)
- [Server side resolution](#server-side-resolution)
- [Creating resolvers](#creating-resolvers)
- [Asynchronous quests](#asynchronous-quests)
- [Querying resolved data](#querying-resolved-data)
- [Mapping data to props](#mapping-data-to-props)
- [Reloading data on prop changes](#reoloading-data-on-prop-changes)
- [Programmatically running resolver methods](#programmatically-running-resolver-methods)
- [Adding mutative methods to resolvers](#adding-mutative-methods-to-resolvers)
- [Complete API reference](#complete-api-reference)

### Setup

```bash
npm install redux-quest --save
```

Then add the redux-quest reducer to your root reducer:

```js
import { reducer as questReducer } from 'redux-quest';

var reducer = combineReducers({
  _data_: questReducer
});
```

### Server side resolution

For server rendered apps you must wait for quests to be resolved before sending the rendered app down the wire.

The recommended (and very simple) way of doing this is using [redux-ready](https://github.com/djgrant/redux-ready), following the instructions in its repo.

### Creating resolvers

Every quest must have a resolver. The resolver's job is to return some data or a promise that resolves with some data. A typical resolver might fetch some data from an API.

Every resolver must include a `key` and a `get()` method.

```js
var postsResolver = {
  key: 'posts',
  get() {
    return fetch(POST_API_URL).then(r => r.json())
  }
};
```

In this example the resolved data will be keyed against a `posts` field in the redux store:

```js
{
  _data_: {
    posts: {
      loading: false,
      complete: true,
      error: null,
      data: { ... }
    }
  }
}
```

A resolver can be re-used in multiple quests without causing additional fetching or duplication in the store.

### Asynchronous quests
Todo

### Querying resolved data
Todo

### Mapping data to props
Todo

### Reloading data on prop changes
Todo

### Programmatically running resolver methods
Todo

### Adding mutative methods to resolvers
Todo

### Complete API reference
Todo

## Credits

redux-quest was inspired by a few projects in particular:
- [Relay](https://facebook.github.io/relay/), which first introduced the idea of colocating data queries and components
- [Apollo](http://dev.apollodata.com/), whose React client proved the versatility of redux as a local cache and also inspired the idea of using resolvers (albeit in a different fashion) to abstract the data fetching mechanics
- [react-jobs](https://github.com/ctrlplusb/react-jobs), which influenced the design of the quest HOC API.
