import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

const UPDATE_METATDATA_MUTATION = gql`
   mutation UpdateMetadata(
      $id: ID!
      $totalRows: Int
      $totalColumns: Int
      $parentSheetId: ID
      $rowFilters: [SheetFilterInput]
      $columnFilters: [SheetFilterInput]
      $frozenRows: [SheetFreezeInput]
      $frozenColumns: [SheetFreezeInput]
      $rowHeights: [SheetSizingInput]
      $columnWidths: [SheetSizingInput]
   ) {
      updateMetadata(
         input: {
            id: $id
            totalRows: $totalRows
            totalColumns: $totalColumns
            parentSheetId: $parentSheetId
            rowFilters: $rowFilters
            columnFilters: $columnFilters
            frozenRows: $frozenRows
            frozenColumns: $frozenColumns
            rowHeights: $rowHeights
            columnWidths: $columnWidths
         }
      ) {
         created
         lastUpdated
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
         columnWidths {
            index
            size
         }
         rowHeights {
            index
            size
         }
      }
   }
`;

export const updateMetadataMutation = async ({
   id,
   totalRows,
   totalColumns,
   parentSheetId,
   rowFilters,
   columnFilters,
   frozenRows,
   frozenColumns,
   rowHeights,
   columnWidths,
}) => {
   const response = await apolloClient.mutate({
      mutation: UPDATE_METATDATA_MUTATION,
      variables: {
         id,
         totalRows,
         totalColumns,
         parentSheetId,
         rowFilters,
         columnFilters,
         frozenRows,
         frozenColumns,
         rowHeights,
         columnWidths,
      },
   });
   return response.data.updateMetadata; // "updateMetadata" is from the mutation above
};

/**
 * example of query variables
 {
  "id": "5ef780f6c67bf5c800c6210c",
  "totalRows": 20,
  "totalColumns": 60,
  "rowFilters": [
    {"index": 0, "filterExpression": "ert", "caseSensitive": false, "regex": false},
    {"index": 2, "filterExpression": "of", "caseSensitive": true, "regex": false}
  ],
  "frozenColumns": [{"index": 0, "isFrozen": false}, {"index": 3, "isFrozen": true}]
 }
 */
