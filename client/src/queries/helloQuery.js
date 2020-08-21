import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

const HELLO_QUERY = gql`
   query HelloQuery {
      hello
   }
`;

export const helloQuery = async () => {
   return await apolloClient.query({
      query: HELLO_QUERY,
   });
};
