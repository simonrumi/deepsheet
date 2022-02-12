import * as R from 'ramda';
import { ApolloClient, InMemoryCache, } from '@apollo/client'; // note that ApolloProvider, useQuery, gql are also available from @apollo-client

import { GRAPHQL_URL } from '../constants';
import { handleNetworkError } from '../helpers/userHelpers';
import { isNothing, getObjectFromArrayByKeyValue } from '../helpers';

/* see
https://medium.com/@dexiouz/fix-cache-data-may-be-lost-when-replacing-the-getallposts-field-of-a-query-object-in-apollo-client-7973a87a1b43
*/
const cache = new InMemoryCache({
	typePolicies: {
		SheetMetadataType: {
			keyFields: ['created'],
		},
		Query: {
			fields:{
				sheets: {
					merge(existing = [], incoming = []) {
						// note that each item in the array looks like this:
						// {__ref: 'SheetType:61f5acfa8f9291274c31525c'}
						const removedMatches = R.filter(
							existingItem => R.pipe(
								R.prop('__ref'),
								getObjectFromArrayByKeyValue('__ref', R.__, incoming),
								isNothing // only keep the existingItem if there is no match in the incoming array
							)(existingItem), 
						)(existing);
						return [ ...removedMatches, ...incoming ];
					}
				}
			}
		}
	}
});

// following funtion taken from https://github.com/apollographql/apollo-client/issues/5229
const apolloClient = new ApolloClient({
   uri: GRAPHQL_URL,
   credentials: 'same-origin',
   cache,
   request: operation => {
      const token = localStorage.getItem('token');
      operation.setContext({
         headers: token ? { authorization: `Bearer ${token}`, } : {},
      });
   },
   onError: ({ networkError, graphQLErrors }) => {
      if (graphQLErrors) {
         console.error('graphQLErrors', graphQLErrors);
      }
      if (networkError) {
         handleNetworkError(networkError);
      }
   },
});

export default apolloClient;