import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

const UPDATE_CELLS_MUTATION = gql`
   mutation UpdateCells($id: ID!, $cells: [CellInput]) {
      updateCells(input: { id: $id, cells: $cells }) {
         cells {
            row
            column
            content {
               text
               subsheetId
            }
            visible
         }
      }
   }
`;

export const updateCellsMutation = async (id, cells) => {
   console.log('updateCellsMutation got cells', cells, 'id', id);
   const result = await apolloClient.mutate({
      mutation: UPDATE_CELLS_MUTATION,
      variables: { id, cells },
   });
   return result;
};
