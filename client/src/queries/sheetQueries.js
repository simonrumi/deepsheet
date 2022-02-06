import { gql } from '@apollo/client'; // from 'apollo-boost';
import apolloClient from '../services/apolloClient';
import { log } from '../clientLogger';
import { LOG } from '../constants';

const SHEETS_QUERY = gql`
   query FetchSheets($userId: ID!) {
      sheets(userId: $userId) {
         id
         title
         metadata {
				created
            parentSheetId
         }
      }
   }
`;

export const sheetsQuery = async userId => {
	// note that the call FetchSheets (see SHEETS_QUERY above) seems to send __typename fields (from the apolloClient.cache), in the request body, to the server
	// however the resolver for the sheets Query ignores those and just uses the userId...so doesn't seem to be an issue
	// similar things could be happening with other queries/mutations...but haven't found any bugs in testing all queries & mutations as of 1/30/22
	log({ level: LOG.SILLY }, 'sheetQueries--sheetsQuery got apolloClient.cache', apolloClient.cache);
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
            lastAccessed
            totalRows
            totalColumns
            parentSheetId
            columnFilters {
               index
               filterExpression
               hideBlanks
               caseSensitive
               regex
            }
            rowFilters {
               index
               filterExpression
               hideBlanks
               caseSensitive
               regex
            }
            rowHeights {
               index
               size
            }
            columnWidths {
               index
               size
            }
            frozenRows {
               index
               isFrozen
            }
            frozenColumns {
               index
               isFrozen
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
	log({ level: LOG.SILLY }, 'sheetQueries--sheetQuery got apolloClient.cache', apolloClient.cache);
   const sheetResult = await apolloClient.query({
      query: SHEET_QUERY,
      variables: { sheetId, userId },
      fetchPolicy: 'network-only', // in other words, every time a different sheet is loaded, we're getting it from the network, not the cache. Otherwise cache might show old version of sheet
   });
   return sheetResult.data.sheet;
};
