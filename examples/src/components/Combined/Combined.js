import React from 'react';
import quest from 'react-quest';
import { compose } from 'redux';

const relatedResolver = {
  key: 'related',
  get: () =>
    Promise.resolve({
      id: 1,
      description: 'Some other resource',
      relatedArticles: [3, 9, 18]
    })
};

const articlesResolver = {
  key: 'articles',
  get: query =>
    Promise.resolve(
      query.ids.map(id => ({
        id,
        title: `Article ${id}`
      }))
    )
};

const enhance = compose(
  quest({
    resolver: relatedResolver
  }),
  quest({
    resolver: articlesResolver,
    fetchOnce: props =>
      props.related.data && props.related.data.relatedArticles,
    query: props => ({
      ids: props.related.data.relatedArticles
    })
  })
);

const Combined = ({ related, articles }) =>
  <div>
    {articles.data &&
      articles.data.map(post =>
        <h3 key={post.id}>
          {post.title}
        </h3>
      )}
  </div>;

export default enhance(Combined);
