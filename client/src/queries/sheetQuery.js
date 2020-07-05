import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

const SHEET_QUERY = gql`
   query SheetQuery($id: ID!) {
      sheet(id: $id) {
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

const sheetQuery = async sheetId => {
   return await apolloClient.query({
      query: SHEET_QUERY,
      variables: { id: sheetId },
   });
};

export default sheetQuery;

/* old version backup
const SHEET_QUERY = gql`
   query SheetQuery($id: ID!) {
      sheet(id: $id) {
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
         rows {
            row
            columns {
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
   }
`;
*/
