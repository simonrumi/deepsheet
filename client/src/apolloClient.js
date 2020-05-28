import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

console.log('TODO probably dont need ApolloClient');

// see https://www.apollographql.com/docs/tutorial/client/#apollo-client-setup
const cache = new InMemoryCache();
const link = new HttpLink({
   uri: 'http://localhost:5000/graphql',
});

const client = new ApolloClient({
   dataIdFromObject: (object) => object.id, // allows Apollo to be aware of dependencies between objects and thus to trigger refreshes appropriately
   // networkInterface // when doing user authentication, need this to set up sessions. see SG's auth-graphql-starter
   cache,
   link,
});

export default client;

// in case of problems, this article *might* be useful, but it is from 2016
// https://medium.com/react-weekly/implementing-graphql-in-your-redux-app-dad7acf39e1b
