const { gql } = require('apollo-server-lambda');

const SheetMutations = gql`
   input UpdateSubsheetIdInput {
      sheetId: ID!
      row: Int!
      column: Int!
      text: String
      subsheetId: ID!
   }

   input CellContentInput {
      text: String
      subsheetId: ID
   }

   input CellInput {
      row: Int!
      column: Int!
      visible: Boolean!
      content: CellContentInput
   }

   input UpdateCellsInput {
      sheetId: ID!
      cells: [CellInput]
      userId: ID!
   }

   input SheetFilterInput {
      index: Int!
      filterExpression: String!
      caseSensitive: Boolean
      regex: Boolean
   }

   input SheetFreezeInput {
      index: Int!
      isFrozen: Boolean!
   }

   input SheetSummaryCellInput {
      row: Int
      column: Int
   }

   input UpdateMetadataInput {
      id: ID!
      totalRows: Int
      totalColumns: Int
      parentSheetId: ID
      summaryCell: SheetSummaryCellInput
      rowFilters: [SheetFilterInput]
      columnFilters: [SheetFilterInput]
      frozenRows: [SheetFreezeInput]
      frozenColumns: [SheetFreezeInput]
   }

   input NewSheetInput {
      userId: ID!
      rows: Int
      columns: Int
      title: String
      parentSheetId: ID
      summaryCell: SheetSummaryCellInput
      summaryCellText: String
   }

   extend type Mutation {
      createSheet(input: NewSheetInput): SheetType
      changeTitle(id: ID!, title: String!): SheetType
      updateMetadata(input: UpdateMetadataInput): SheetMetadataType
      updateCells(input: UpdateCellsInput): SheetType
      deleteSubsheetId(input: UpdateSubsheetIdInput): SheetCellType
      deleteSheet(sheetId: ID!, userId: ID!): [SheetType]
      deleteSheets(ids: [ID], userId: ID!): [SheetType]
      sheetByUserId(userId: ID!): SheetType
   }
`;

module.exports = SheetMutations;
