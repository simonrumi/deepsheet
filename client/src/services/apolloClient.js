import ApolloClient, { InMemoryCache /* HttpLink, ApolloLink */ } from 'apollo-boost';
import { GRAPHQL_URL } from '../constants';

// following funtion taken from https://github.com/apollographql/apollo-client/issues/5229
export default new ApolloClient({
   uri: GRAPHQL_URL,
   credentials: 'same-origin',
   cache: new InMemoryCache({ addTypename: false }),
   request: operation => {
      const token = localStorage.getItem('token');
      operation.setContext({
         headers: token
            ? {
                 authorization: `Bearer ${token}`,
              }
            : {},
      });
   },
   onError: ({ networkError, graphQLErrors }) => {
      if (graphQLErrors) {
         console.error('graphQLErrors', graphQLErrors);
      }
      if (networkError) {
         console.error('networkError', networkError);
      }
   },
});
