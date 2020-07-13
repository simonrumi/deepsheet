import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

const ADD_CELL_MUTATION = gql`
   mutation AddCell($id: ID!, $row: Int!, $column: Int!, $visible: Boolean!, $subsheetId: ID, $text: String) {
      addCell(input: { id: $id, row: $row, column: $column, visible: $visible, subsheetId: $subsheetId, text: $text }) {
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

export const addCellMutation = async (id, row, column, visible, subsheetId, text) => {
   const result = await apolloClient.mutate({
      mutation: ADD_CELL_MUTATION,
      variables: { id, row, column, visible, subsheetId, text },
   });
   console.log('addCellMutation result', result);
   return result;
};

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
