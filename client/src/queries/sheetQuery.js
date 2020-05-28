console.log('TODO not using graphql-tag so remove it');

const sheetQuery = `query SheetQuery($id: ID!) {
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

export default sheetQuery;
