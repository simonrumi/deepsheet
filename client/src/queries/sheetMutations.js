import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

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
            columnVisibility {
               index
               isVisible
            }
            rowVisibility {
               index
               isVisible
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
