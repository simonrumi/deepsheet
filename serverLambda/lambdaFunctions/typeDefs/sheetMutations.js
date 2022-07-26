const { gql } = require('apollo-server-lambda');

const SheetMutations = gql`
   input UpdateSubsheetIdInput {
      sheetId: ID!
      row: Int!
      column: Int!
      text: String
      subsheetId: ID!
   }

	input PlaceholderObjectInput {
		placeholderString: String
	}

	input InlineStyleRangeInput {
		offset: Int
		length: Int
		style: String
	}

	input BlockInput {
		data: PlaceholderObjectInput
		depth: Int
		entityRanges: [PlaceholderObjectInput]
		inlineStyleRanges: [InlineStyleRangeInput]
		key: String
		text: String
		type: String
	}

	input FormattedTextInput {
		blocks: [BlockInput]
		entityMap: PlaceholderObjectInput
	}

   input CellContentInput {
      text: String
      subsheetId: ID
		formattedText: FormattedTextInput
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
      filterExpression: String
      hideBlanks: Boolean
      caseSensitive: Boolean
      regex: Boolean
   }

   input SheetFreezeInput {
      index: Int!
      isFrozen: Boolean!
   }

   input SheetSizingInput {
      index: Int!
      size: String!
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
      rowHeights: [SheetSizingInput]
      columnWidths: [SheetSizingInput]
   }

   input NewSheetInput {
      userId: ID!
      rows: Int
      columns: Int
      title: String
      parentSheetId: ID
      summaryCell: SheetSummaryCellInput
      rowHeights: [SheetSizingInput]
      columnWidths: [SheetSizingInput]
      cellRange: [CellInput]
   }

   extend type Mutation {
      createSheet(input: NewSheetInput): SheetType
      changeTitle(id: ID!, title: String!): SheetType
      updateMetadata(input: UpdateMetadataInput): SheetMetadataType
      updateSheetLastAccessed(id: ID!, lastAccessed: String!): SheetType
      updateCells(input: UpdateCellsInput): SheetType
      deleteSubsheetId(input: UpdateSubsheetIdInput): SheetCellType
      deleteSheet(sheetId: ID!, userId: ID!): [SheetType]
      deleteSheets(ids: [ID], userId: ID!): [SheetType]
      sheetByUserId(userId: ID!): SheetType
   }
`;

module.exports = SheetMutations;
