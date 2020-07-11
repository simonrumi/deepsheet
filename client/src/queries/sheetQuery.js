import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

export const SHEET_QUERY = gql`
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
      fetchPolicy: 'network-only', // in other words, every time a different sheet is loaded, we're getting it from the network, not the cache. Otherwise cache might show old version of sheet
   });
};

export default sheetQuery;
