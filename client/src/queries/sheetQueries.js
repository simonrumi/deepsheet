import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

const SHEETS_QUERY = gql`
   query FetchSheets($userId: ID!) {
      sheets(userId: $userId) {
         id
         title
         metadata {
            parentSheetId
         }
      }
   }
`;

export const sheetsQuery = async userId => {
   return await apolloClient.query({
      query: SHEETS_QUERY,
      variables: { userId },
      fetchPolicy: 'network-only', // every time sheets are loaded, we're getting it from the network, not the cache.
   });
};

const SHEET_QUERY = gql`
   query SheetQuery($sheetId: ID!, $userId: ID!) {
      sheet(sheetId: $sheetId, userId: $userId) {
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
            lastUpdated
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

export const sheetQuery = async (sheetId, userId) => {
   const sheetResult = await apolloClient.query({
      query: SHEET_QUERY,
      variables: { sheetId, userId },
      fetchPolicy: 'network-only', // in other words, every time a different sheet is loaded, we're getting it from the network, not the cache. Otherwise cache might show old version of sheet
   });
   console.log('sheetQueries got sheet', sheetResult);
   return sheetResult;
};
