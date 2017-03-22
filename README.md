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
  resolver: postsResolver
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

A lightweight (2kb gzip) yet impressively featured library for colocating components and their data requirements, handling simple data resolving functions, mutating remote data, performing optimistic updates, reloading data on prop changes or programmatically, and much more!

## Documentation

- [Setup](#setup)
- [Server side resolution](#server-side-resolution)
- [Creating resolvers](#creating-resolvers)
- [Calling resolver methods programmatically](#calling-resolver-methods-programmatically)
- [Deferring fetching to browser](#deferring-fetching-to-browser)
- [Fetching data on prop changes](#fetching-data-on-prop-changes)
- [Transforming resolved data](#transforming-resolved-data)
- [Mapping data to props](#mapping-data-to-props)
- [Passing a query to the resolver](#passing-a-query-to-the-resolver)
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

There is a lot of work within the community on SSR solutions that render render component trees asynchronously and until the release of react fiber a standard approach is unlikely to emerge. Until such a time SSR is not formally supported.

In the meantime you can try [redux-ready](https://github.com/djgrant/redux-ready) which is a simple solution that works well with tree that don't have nested quests, or [react-warmup](https://github.com/djgrant/react-warmup) which enables redux-quest to perform a cache warmup.

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

To use the resolver, provide it as an option in a quest:

```js
const withPosts = quest({
  resolver: postsResolver
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

This creates a quest object that is set on the components props under the resolver's key name:

```js
Items.propTypes = {
  posts: PropType.shape({
    data: PropType.any,
    error: PropType.string,
    loading: PropType.boolean,
    complete: PropType.boolean,
    get: PropType.function
  })
};
```

> A resolver can be re-used in multiple quests without causing additional fetching or duplication in the store.

### Calling resolver methods programmatically

You can add as many methods to a resolver as you would like. The default `get()` method is called as part of the quest's lifecyle. Additional methods can be called directly via props.

Every method in a resolver is added to the quest object for direct access. Take the following example:

```js
var postsResolver = {
  key: 'posts',
  get() {
    return fetch(POST_API_URL).then(r => r.json())
  },
  create() {
    // perform a mutation
  }
};

quest({
  resolver: postsResolver
})(Posts)
```

Both the get and create methods are added to the quest object's properties:

```js
Posts.propTypes = {
  posts: PropType.shape({
    get: PropType.function,  // <--
    create: PropType.function, // <--
    data: PropType.any,
    error: PropType.string,
    loading: PropType.boolean,
    complete: PropType.boolean
  })
};
```

It's unlikely that you'll need direct access to the `get()` method, however, it is useful be able to call mutation methods programmatically. The `create()` method, for example, could be called on a user event (see [Passing a query to the resolver](#passing-a-query-to-the-resolver)).

### Deferring fetching to the browser
By default quests will attempt to resolve their data requirements whenever they are instantiated, including on server render passes. To defer loading until the component is mounted set `fetchOnServer: false` in the options block:

```js
quest({
  resolver: postsResolver,
  fetchOnServer: false
});
```

### Fetching data on prop changes

To defer loading until a condition in the component's props is satisfied provide a predicate function to the `fetchOnce` option:

```js
quest({
  resolver: postsResolver,
  fetchOnce: props => props.ready
})
```

To refetch a resource when a new condition is satisfied while a component is receiving new props, pass a predicate function to the `fetchWhen` option:

```js
quest({
  resolver: postsResolver,
  refetchWhen: (props, nextProps) => props.a !== props.b
})
```

### Transforming resolved data

A common requirement when working with remote data sources is to be able to transform the dataset set once it has been resolved. Developers are encouraged to write functions (known as selectors in Redux land) that transform the resolved data into a new dataset. You can pass a selector function to the `mapData` option and redux-quest will take care of mapping the data once it arrives.

```js
const withPostTitles = quest({
  resolver: postsResolver,
  fetchOnServer: false,
  mapData: posts => posts.map(post => {
    id: post.slug,
    title: sentenceCase(posts.title)
  })
});

const PostList = ({ posts }) => (
  <div>
    {posts.result
      ? (
        <ul>
          {posts.result.map(post =>
            <li id={post.id} key={post.id}>{post.title}</li>
          )}
        </ul>
      ) : (
        <Loading />
      )
    }
  </div>
);

export default withPostTitles(PostList);
```

### Mapping data to props

You can map data directly to a component's props. This is handy if you find yourself wanting to apply multiple selectors to the same dataset.

`mapToProps` takes a prop mapping function that maps the resolved dataset to a props object. The created props object is then spread into the components own props.

```js
var withNewPosts = quest({
  resolver: postsResolver,
  mapToProps: posts => ({
    newPosts: posts.filter(post => post.isNew),
    otherPosts: getOtherPostsSelector
  })
});

const Items = ({ posts, newPosts }) => (
  {posts.completed &&
    <div>{newPosts.result.map(post => <Item entry={post} />)}</div>}
);

export default withNewPosts(Items);
```

<!-- Not sure about including this as a documented feature yet
**Map data directly to props**
You can also pass a boolean `true` to mapToProps, which maps all the data directly to `props[resolverKey]`.

```js
const withPosts = quest({
  resolver: postsResolver,
  mapToProps: true
});

const Items = ({ posts }) => (
  <div>{posts.result.map(post => <Item entry={post} />)}</div>
);

export default withNewPosts(Items);
```

> ⚠️️ Only ever use `mapToProps: true` if you are certain the data will be resolved synchronously and you don't need to mutate it
-->

### Passing a query to the resolver

Resolver methods can be configured by creating a `query` object in a quest. The `query` option takes either a prop mapping function or a plain object:

```js
var postsResolver = {
  key: 'posts',
  get(query) {
    return fetch(`${POST_API_URL}?filter=${query.filter}`).then(r => r.json())
  }
};

quest({
  resolver: postsResolver,
  query: {
    filter: myStaticFilter
  }
});
```

Queries can be paired nicely with react-redux's `connect` HOC:

```js
compose(
  connect(state => ({
    filter: getPostsFilter(state)
  })),
  quest({
    resolver: postsResolver,
    query: props => ({
      filter: props.filter
    })
  })
);
```

Queries can also be passed to resolver methods when they are called programmatically.

```js
class extends Component {
  handleClick(event) {
    var query = { title: event.target.value };
    this.props.posts.create(query);
  }
}
```


### Adding mutation methods to resolvers
Now that we know how to pass queries into resolvers and how to access resolver methods programmatically, we can add some mutative methods to our `postsResolver`. Let's add a method that creates new entries.

```js
var postsResolver = {
  ...
  create(post, currentPosts) {
    fetch(POST_API_URL, {
      method: 'POST',
      body: JSON.stringify(post)
    });
  }
};
```

To use this method, in we would call it from a handler in the component:

```js
class NewPost extends Component {
  handleSubmit(e) {
    var post = e.data;
    this.props.posts.create(post);
  }
  render() {
    return <button onClick={this.handleSubmit}>New Post</button>
  }
}

export default quest({ resolver: postsResolver })(NewPost);
```

### Updating remote data

Calling the create method in the previous example creates a new post on the server but we still need to display the post that the user created in the UI.

To update the local data store, return a promise that resolves with updated collection from the resolver's mutation method:

```js
var postsResolver = {
  ...
  create(post, currentPosts) {
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

class NewPost extends Component {
  handleSubmit(e) {
    var post = e.data;
    this.props.posts.create(post);
  }
  render() {
    return <button onClick={this.handleSubmit}>New Post</button>
  }
}

export default quest({ resolver: postsResolver })(NewPost);
```

In the above example we execute a second request to the API to fetch the updated resource. If however the response body of the POST request contains the complete updated collection of posts we could resolve the promise with that data instead, saving an extra round trip to the API:

```js
var postsResolver = {
  ...
  create(post) {
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
  create(post, currentPosts) {
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
  create(number, currentNumber) {
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
  create(post, currentPosts) {
    var newPosts = [...currentPosts, post];
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
