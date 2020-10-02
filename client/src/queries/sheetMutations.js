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
            lastModified
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
   const result = await apolloClient.mutate({
      mutation: CREATE_SHEET_MUTATION,
      variables: { userId, rows, columns, title, parentSheetId, summaryCell, summaryCellText },
   });
   return result;
};

const DELETE_SHEETS_MUTATION = gql`
   mutation DeleteSheets($ids: [ID]) {
      deleteSheets(ids: $ids) {
         id
         title
         metadata {
            parentSheetId
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

export const sheetByUserIdMutation = async userId => {
   const result = await apolloClient.mutate({
      mutation: SHEET_BY_USER_ID_MUTATION,
      variables: { userId },
   });
   return result.data.sheetByUserId;
};
