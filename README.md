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

A lightweight (2kb gzip) yet impressively featured library for:
- colocating components and their data requirements
- handling simple functions that return data or a promise
- resolving data server-side or asynchronously in the browser
- rendering loading states in the view
- caching resolved data
- mutating remote data
- performing optimistic updates
- reloading data programmatically or based on prop changes

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
- [Updating the local data store on mutation events](#updating-the-local-data-store-on-mutation-events)
- [Performing optimistic updates](#performing-optimistic-updates)
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
Now that we know how to pass queries into resolvers and how to access resolver methods programmatically, we can add some mutative methods to our `postsResolver`. Let's add a method that creates new entries.

```js
var postsResolver = {
  ...
  create({ post }) {
    fetch(POST_API_URL, {
      method: 'POST',
      body: JSON.stringify(post)
    });
  }
};
```

To use this method, in we would just call it from a handler in the component:

```js
class NewPost extends Component {
  handleSubmit(e) {
    var post = e.data;
    this.props.posts.create({ post });
  }
  render() { ... }
}
```

### Updating the local data store on mutation events

Calling the create method in the previous example creates a new post on the server but we still need to display the post that the user created in the UI.

To update the local data store, return a promise that resolves with updated collection from the resolver's mutation method:

```js
var postsResolver = {
  ...
  create({ post }) {
    return fetch(POST_API_URL, {
      method: 'POST',
      body: JSON.stringify(post)
    })
      .then(response => {
        // once the server has created the new post
        // get the latest collection of posts again
        if (response.status === 201) {
          // send another GET request and return a promise
          // that resolves with the final data
          return postsResolver.get();
        }        
      });
  }
};
```

In the above example we execute a second request to the API to fetch the updated resource. If however the response body of the POST request contains the complete updated collection of posts we could resolve the promise with that data instead, saving an extra round trip to the API:

```js
var postsResolver = {
  ...
  create({ post }) {
    return fetch(POST_API_URL, {
      method: 'POST',
      body: JSON.stringify(post)
    }).then(r => r.json());
  }
};
```

If you need to access to the original data collection (say if you the server only responds with the created resource) you can access it on the second argument passed to mutation methods:

```js
var postsResolver = {
  ...
  create({ post }, currentPosts) {
    return fetch(POST_API_URL, {
      method: 'POST',
      body: JSON.stringify(post)
    })
      .then(r => r.json())
      .then(newPost => {
        return [...currentPosts, newPost];
      });
  }
};
```

### Performing optimistic updates

Suppose we want to immediately update the local data store with new data, even before it has been posted to the server? We can implement optimistic updates by returning an array of promises from mutation methods. The local data store will be updated with result of each promise as they resolve. Whichever promise resolves last will be Let's see it in action:

```js
var postsResolver = {
  ...
  create({ post }, currentPosts) {
    var newPosts = [...currentPosts, post];
    var optimisticUpdate = Promise.resolve(newPosts);
    var serverUpdate = fetch(POST_API_URL, {
      method: 'POST',
      body: JSON.stringify(post)
    })
      .then(r => {
        if (response.status === 201) {
          return response.json();
        }
        // in case the resource is not created on the server
        // reverse the optimistic update by resolving the 2nd promise
        // with the original data
        return currentPosts;
      })
      .catch(err => {
        return data;
      });

    return [optimisticUpdate, serverUpdate];
  }
};
```

### Complete API reference
Todo

## Credits

redux-quest was inspired by a few projects in particular:
- [Relay](https://facebook.github.io/relay/), which first introduced the idea of colocating data queries and components
- [Apollo](http://dev.apollodata.com/), whose React client proved the versatility of redux as a local cache and that data requirements can be resolved server by recursing the react tree
- [react-jobs](https://github.com/ctrlplusb/react-jobs), which influenced the design of the quest HOC API
