import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';
// import { SHEETS_QUERY } from './sheetQueries';

const CREATE_SHEET_MUTATION = gql`
   mutation CreateSheet(
      $rows: Int
      $columns: Int
      $title: String
      $parentSheetId: ID
      $summaryCell: SheetSummaryCellInput
      $summaryCellText: String
   ) {
      createSheet(
         input: {
            rows: $rows
            columns: $columns
            title: $title
            parentSheetId: $parentSheetId
            summaryCell: $summaryCell
            summaryCellText: $summaryCellText
         }
      ) {
         id
         title
         metadata {
            totalRows
            totalColumns
            parentSheetId
            summaryCell {
               row
               column
            }
            columnFilters {
               index
               filterExpression
               caseSensitive
               regex
            }
            rowFilters {
               index
               filterExpression
               caseSensitive
               regex
            }
         }
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

export const createSheetMutation = async ({ rows, columns, title, parentSheetId, summaryCell, summaryCellText }) => {
   const result = await apolloClient.mutate({
      mutation: CREATE_SHEET_MUTATION,
      variables: { rows, columns, title, parentSheetId, summaryCell, summaryCellText },
   });
   console.log('createSheetMutation result', result);
   return result;
};

const DELETE_SHEETS_MUTATION = gql`
   mutation DeleteSheets($ids: [ID]) {
      deleteSheets(ids: $ids) {
         sheets {
            id
            title
            metadata {
               parentSheetId
            }
         }
      }
   }
`;

export const deleteSheetsMutation = async ids => {
   const result = await apolloClient.mutate({
      mutation: DELETE_SHEETS_MUTATION,
      variables: { ids },
   });
   return result.data.deleteSheets;
};
