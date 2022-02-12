import { gql } from '@apollo/client';
import apolloClient from '../services/apolloClient';
import { prepCellsForDb } from '../helpers/cellHelpers';


const UPDATE_CELLS_MUTATION = gql`
   mutation UpdateCells($sheetId: ID!, $cells: [CellInput], $userId: ID!) {
      updateCells(input: { sheetId: $sheetId, cells: $cells, userId: $userId }) {
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

export const updateCellsMutation = async ({ sheetId, cells, userId }) => {
   const preppedCells = prepCellsForDb(cells);
   const result = await apolloClient.mutate({
      mutation: UPDATE_CELLS_MUTATION,
      variables: { sheetId, cells: preppedCells, userId },
   });
   return result.data?.updateCells || null; // .updateCells comes from the name in the mutation above
};

const DELETE_SUBSHEET_ID_MUTATION = gql`
   mutation DeleteSubsheetId($sheetId: ID!, $row: Int!, $column: Int!, $text: String, $subsheetId: ID!) {
      deleteSubsheetId(input: { sheetId: $sheetId, row: $row, column: $column, text: $text, subsheetId: $subsheetId }) {
         row
         column
         content {
            text
            subsheetId
         }
         visible
      }
   }
`;

/* data looks like this:
{
   row, 
   column, 
   content: {
      text, 
      subsheetId
   },
   sheetId, 
} */
export const deleteSubsheetIdMutation = async data => {
   const { sheetId, row, column, content } = data;
   const { text, subsheetId } = content;
   const result = await apolloClient.mutate({
      mutation: DELETE_SUBSHEET_ID_MUTATION,
      variables: { sheetId, row, column, text, subsheetId },
   });
   return result.data.deleteSubsheetId; //note that "deleteSubsheetId" is the name of the mutation above
};
