import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

const CREATE_SHEET_MUTATION = gql`
   mutation CreateSheet(
      $userId: ID!
      $rows: Int
      $columns: Int
      $title: String
      $parentSheetId: ID
      $summaryCell: SheetSummaryCellInput
      $summaryCellText: String
   ) {
      createSheet(
         input: {
            userId: $userId
            rows: $rows
            columns: $columns
            title: $title
            parentSheetId: $parentSheetId
            summaryCell: $summaryCell
            summaryCellText: $summaryCellText
         }
      ) {
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

export const createSheetMutation = async ({
   userId,
   rows,
   columns,
   title,
   parentSheetId,
   summaryCell,
   summaryCellText,
}) => {
   const response = await apolloClient.mutate({
      mutation: CREATE_SHEET_MUTATION,
      variables: { userId, rows, columns, title, parentSheetId, summaryCell, summaryCellText },
   });
   return response.data.createSheet; // "createSheet" comes from mutation above
};

/* single sheet deletion */
const DELETE_SHEET_MUTATION = gql`
   mutation DeleteSheets($sheetId: ID!, $userId: ID!) {
      deleteSheets(sheetId: $sheetId, userId: $userId) {
         id
         title
         metadata {
            parentSheetId
         }
      }
   }
`;

export const deleteSheetMutation = async (sheetId, userId) => {
   const result = await apolloClient.mutate({
      mutation: DELETE_SHEET_MUTATION,
      variables: { sheetId, userId },
   });
   return result.data.deleteSheet;
};

/* multiple sheets deletion */
const DELETE_SHEETS_MUTATION = gql`
   mutation DeleteSheets($ids: [ID], $userId: ID!) {
      deleteSheets(ids: $ids, userId: $userId) {
         id
         title
         metadata {
            parentSheetId
         }
      }
   }
`;

export const deleteSheetsMutation = async (ids, userId) => {
   const result = await apolloClient.mutate({
      mutation: DELETE_SHEETS_MUTATION,
      variables: { ids, userId },
   });
   return result.data.deleteSheets;
};

const SHEET_BY_USER_ID_MUTATION = gql`
   mutation SheetByUserIdMutation($userId: ID!) {
      sheetByUserId(userId: $userId) {
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
            frozenColumns {
               index
               isFrozen
            }
            frozenRows {
               index
               isFrozen
            }
            columnWidths {
               index
               size
            }
            rowHeights {
               index
               size
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

export const sheetByUserIdMutation = async userId => {
   const result = await apolloClient.mutate({
      mutation: SHEET_BY_USER_ID_MUTATION,
      variables: { userId },
   });
   return result.data.sheetByUserId;
};