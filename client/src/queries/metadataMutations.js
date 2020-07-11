import { gql } from 'apollo-boost';
import apolloClient from '../services/apolloClient';

const UPDATE_METATDATA_MUTATION = gql`
   mutation UpdateMetadata(
      $id: ID!
      $totalRows: Int
      $totalColumns: Int
      $parentSheetId: ID
      $summaryCell: SheetSummaryCellInput
      $rowVisibility: [SheetVisibilityInput]
      $columnVisibility: [SheetVisibilityInput]
      $rowFilters: [SheetFilterInput]
      $columnFilters: [SheetFilterInput]
   ) {
      updateMetadata(
         input: {
            id: $id
            totalRows: $totalRows
            totalColumns: $totalColumns
            parentSheetId: $parentSheetId
            summaryCell: $summaryCell
            rowVisibility: $rowVisibility
            columnVisibility: $columnVisibility
            rowFilters: $rowFilters
            columnFilters: $columnFilters
         }
      ) {
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
      }
   }
`;

export const updateMetadataMutation = async ({
   id,
   totalRows,
   totalColumns,
   parentSheetId,
   summaryCell,
   rowVisibility,
   columnVisibility,
   rowFilters,
   columnFilters,
}) => {
   const result = await apolloClient.mutate({
      mutation: UPDATE_METATDATA_MUTATION,
      variables: {
         id,
         totalRows,
         totalColumns,
         parentSheetId,
         summaryCell,
         rowVisibility,
         columnVisibility,
         rowFilters,
         columnFilters,
      },
   });
   return result;
};

/**
 * example of query variables
 {
  "id": "5ef780f6c67bf5c800c6210c",
  "totalRows": 20,
  "totalColumns": 60,
  "summaryCell" : { "row": 0, "column": 1 },
  "rowVisibility": [
    { "index": 0, "isVisible": false },
    { "index": 1, "isVisible": false }
  ],
  "rowFilters": [
    {"index": 0, "filterExpression": "ert", "caseSensitive": false, "regex": false},
    {"index": 2, "filterExpression": "of", "caseSensitive": true, "regex": false}
  ]
 }
 */
