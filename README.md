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
- [Adding mutation methods to resolvers](#adding-mutation-methods-to-resolvers)
- [Updating remote data](#updating-remote-data)
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

### Updating remote data

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

There are times when in order to form a complete update you'll need access to the data in the local store (say, for example, if your server responds with just the created resource and you need to add it to the existing collection).

The current local data collection is passed as the second argument to all mutation methods:

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

Suppose we want to immediately update the local data store, even before it has been created on the server? We can perform an optimistic update by, instead of returning a single promise from our mutation handler, returning _an array_ of promises. Each promise represents an update task and the local data store is updated with the result of each promise as it resolves. As a fail safe mechanism, if any of the promises reject then all updates are reverted.

As a fail safe mechanism, if a promise rejects, any updates from promises that were resolved prior in the cycle will get reverted.

Let's start with a simple example for this technique:

```js
var numberResolver = {
  ...
  create({ number }, currentNumber) {
    // the first promise will resolve with the data we hope to add
    var optimisticUpdate = Promise.resolve(number);

    // the second promise will resolve with the actual result
    var serverUpdate = new Promise(resolve => {
      // mock an IO operation
      setTimeout(() => {
        resolve(2);
      }, 100);
    });

    // return both promises in an array
    return [optimisticUpdate, serverUpdate]
  }
}

```

In this example the local store is first updated with `number` and then 100ms later it is updated with `2`.

Returning to our posts example, we can update the local store first with the user input using a promise that immediately resolves (the optimistic update), and then with the real result from the server. To add just a little extra complexity to the example, let's also handle cases where the server update fails. In such an event, we'd need to revert the effect of the optimistic update and resolve the server update with the original posts collection.

```js
var postsResolver = {
  ...
  create({ post }, currentPosts) {
    var newPosts = [...currentPosts, newPost];
    var optimisticUpdate = Promise.resolve(newPosts);

    var serverUpdate = fetch(POST_API_URL, {
      method: 'POST',
      body: JSON.stringify(post)
    })
      .then(response => {
        if (response.status !== 201) {
          // our optimism didn't pay off this time as
          // the resource wasn't created on the server
          // resolve this promise with the original data to revert the first update
          return currentPosts;
        }
        return response.json();
      })
      .then(newPost => [...currentPosts, newPost])
      .catch(err => {
        console.log('Create post failed with error ', err)
        // If the promise rejects the fail safe mechanism
        // will revert all previous updates in this cycle
      });

    return [optimisticUpdate, serverUpdate];
  }
};
```

### Complete API reference
Todo

## Credits

redux-quest was inspired by a few projects in particular:
- [Relay](https://facebook.github.io/relay/), which introduced the idea of colocating data queries and components
- [Apollo](http://dev.apollodata.com/), whose React client proved the versatility of redux as a local cache
- [react-jobs](https://github.com/ctrlplusb/react-jobs), which influenced the design of the quest higher order components
