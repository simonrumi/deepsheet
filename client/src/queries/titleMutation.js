import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

const TITLE_MUTATION = gql`
   mutation ChangeTitle($id: ID!, $title: String) {
      changeTitle(id: $id, title: $title) {
         id
         title
      }
   }
`;

const titleMutation = async (id, title) => {
   return await apolloClient.mutate({
      mutation: TITLE_MUTATION,
      variables: { id, title },
   });
};

export default titleMutation;
