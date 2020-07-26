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
   const result = await apolloClient.mutate({
      mutation: UPDATE_CELLS_MUTATION,
      variables: { id, cells },
   });
   return result;
};

const DELETE_SUBSHEET_ID_MUTATION = gql`
   mutation DeleteSubsheetId($sheetId: ID!, $row: Int!, $column: Int!, $text: String) {
      deleteSubsheetId(input: { sheetId: $sheetId, row: $row, column: $column, text: $text }) {
         cell {
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

export const deleteSubsheetIdMutation = async (sheetId, row, column, text) => {
   const result = await apolloClient.mutate({
      mutation: DELETE_SUBSHEET_ID_MUTATION,
      variables: { sheetId, row, column, text },
   });
   console.log('deleteSubsheetIdMutation got result', result);
   return result;
};
