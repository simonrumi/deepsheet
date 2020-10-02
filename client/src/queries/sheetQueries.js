import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

const SHEETS_QUERY = gql`
   query FetchSheets {
      sheets {
         id
         title
         metadata {
            parentSheetId
         }
      }
   }
`;

export const sheetsQuery = async () => {
   return await apolloClient.query({
      query: SHEETS_QUERY,
   });
};

const SHEET_QUERY = gql`
   query SheetQuery($sheetId: ID!) {
      sheet(sheetId: $sheetId) {
         id
         users {
            owner
            collaborators {
               collaborator
               permissions
            }
         }
         title
         metadata {
            created
            lastModified
            totalRows
            totalColumns
            parentSheetId
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

export const sheetQuery = async sheetId => {
   return await apolloClient.query({
      query: SHEET_QUERY,
      variables: { sheetId },
      fetchPolicy: 'network-only', // in other words, every time a different sheet is loaded, we're getting it from the network, not the cache. Otherwise cache might show old version of sheet
   });
};
