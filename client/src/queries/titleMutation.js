import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

const TITLE_MUTATION = gql`
   mutation ChangeTitle($id: ID!, $title: String!) {
      changeTitle(id: $id, title: $title) {
         id
         title
      }
   }
`;

const titleMutation = async (id, title) => {
   const result = await apolloClient.mutate({
      mutation: TITLE_MUTATION,
      variables: { id, title },
   });
   console.log('titleMutation result', result);
   // previously did return await apolloClient.mutate() ...but this might have been the cause of the title update not working the first time around, so leave like this
   return result;
};

export default titleMutation;
