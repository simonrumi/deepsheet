import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

const CREATE_SHEET_MUTATION = gql`
   mutation CreateSheet($rows: Int, $columns: Int, $title: String) {
      createSheet(rows: $rows, columns: $columns, title: $title) {
         id
         title
         metadata {
            totalRows
            totalColumns
            parentSheetId
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

export const createSheetMutation = async (rows, columns, title) => {
   const result = await apolloClient.mutate({
      mutation: CREATE_SHEET_MUTATION,
      variables: { rows, columns, title },
   });
   console.log('createSheetMutation result', result);
   return result;
};
