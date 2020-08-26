const { gql } = require('apollo-server-lambda');

const SheetType = gql`
   type CellContentType {
      subsheetId: ID
      text: String
   }

   type SheetCellType {
      row: Int!
      column: Int!
      content: CellContentType!
      visible: Boolean!
   }

   type SheetFilterType {
      index: Int!
      filterExpression: String!
      caseSensitive: Boolean
      regex: Boolean
   }

   type SheetSummaryCellType {
      row: Int
      column: Int
   }

   type SheetMetadataType {
      totalRows: Int
      totalColumns: Int
      parentSheetId: ID
      summaryCell: SheetSummaryCellType
      columnFilters: [SheetFilterType]
      rowFilters: [SheetFilterType]
   }

   type SheetType {
      id: ID!
      metadata: SheetMetadataType!
      title: String
      cells: [SheetCellType]
   }

   extend type Query {
      sheet(sheetId: ID!): SheetType
      sheets: [SheetType]

      # subsheetId and text are part of the CellContentType above
      # these queries ask for no params, but they are called when the sheet is being built,
      # so the resolvers' parent arg has the id of the sheet that contains the cell, which is needed to find these values
      # is there a better way to structure this?
      subsheetId: ID
      text: String
   }
`;

module.exports = SheetType;
