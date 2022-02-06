import * as R from 'ramda';
// import ApolloClient, { InMemoryCache /* HttpLink, ApolloLink */ } from 'apollo-boost';

// TIDY  in here using this instead...should be able to clear up all these comments...
import { ApolloClient, InMemoryCache, } from '@apollo/client'; // note that ApolloProvider, useQuery, gql are also available from @apollo-client

// but note that 
// 1. we don't need <ApolloProvider /> or useQuery (the react hook) since we're making the calls by hand
// 2. in here we are not using gql, but seaching for apolloClient will show all the files where we import gql
// 3. main thin we need to understand is the InMemoryCache...apollo-boost is doing something with this
// ...we need to do it manually OR might be fine to accept Apollo's defaults

// ALSO note that apollo-client has a 3.0 version but we're on a 2.x version ...should try updating that
// here is all the packages relating to apollo with comments:
/*
"@apollo/react-hooks": "^4.0.0", // are we even using apoloo react hooks? might not need this
"apollo-boost": "^0.4.9", // trying to get rid of this
"apollo-cache-inmemory": "^1.6.5", // if we update to apollo-client 3.x then should not need to import this separately
"apollo-client": "^2.6.8", // should update to 3.x
"apollo-link-http": "^1.5.17", // don't think we're using this (but might be imported with pollo 3.x)
*/

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