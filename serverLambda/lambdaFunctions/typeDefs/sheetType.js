const { gql } = require('apollo-server-lambda');

const SheetType = gql`
	type InlineStyleRangeType {
		offset: Int
		length: Int
		style: String
	}

	type BlockType {
		inlineStyleRanges: [InlineStyleRangeType]
		key: String
		text: String
	}

	type FormattedTextType {
		blocks: [BlockType]
	}

   type CellContentType {
      subsheetId: ID
		text: String
		formattedText: FormattedTextType
   }

	type FloatingCellPositionType {
		top: Int!
		left: Int!
		width: Int
		height: Int
		right: Int
		bottom: Int
	}

   type SheetCellType {
      row: Int!
      column: Int!
      content: CellContentType!
      visible: Boolean!
   }

	type SheetFloatingCellType {
		number: Int!
		position: FloatingCellPositionType!
		content: CellContentType!
	}

   type SheetFilterType {
      index: Int!
      filterExpression: String
      hideBlanks: Boolean
      caseSensitive: Boolean
      regex: Boolean
   }

   type SheetFreezeType {
      index: Int!
      isFrozen: Boolean
   }

   type SheetSizingType {
      index: Int!
      size: String!
   }

   type SheetMetadataType {
      created: String
      lastUpdated: String
      lastAccessed: String
      totalRows: Int
      totalColumns: Int
      parentSheetId: ID
      columnFilters: [SheetFilterType]
      rowFilters: [SheetFilterType]
      frozenColumns: [SheetFreezeType]
      frozenRows: [SheetFreezeType]
      rowHeights: [SheetSizingType]
      columnWidths: [SheetSizingType]
   }

   type SheetCollaboratorType {
      collaborator: ID
      permissions: Int
   }

   type SheetUsersType {
      owner: ID!
      collaborators: [SheetCollaboratorType]
   }

   type SheetType {
      id: ID!
      users: SheetUsersType
      metadata: SheetMetadataType!
      title: String
      cells: [SheetCellType]
		floatingCells: [SheetFloatingCellType]
   }

	type ActionType {
		undoableType: String!
		message: String!
		timestamp: String!
	}

	type ActionHistoryType {
		pastActions: [ActionType]
		presentAction: ActionType
		futureActions: [ActionType]
	}

	type HistoryType {
		past: [SheetType]
		present: SheetType
		future: [SheetType]
		actionHistory: [ActionHistoryType]
	}

   extend type Query {
      sheet(sheetId: ID!, userId: ID!): SheetType
      sheetByUserId(userId: ID!): SheetType
      sheets(userId: ID!): [SheetType]
		sheetHistory(sheetId: ID!, userId: ID!): HistoryType
		sheetHistoryByUserId(userId: ID!): HistoryType

      # subsheetId and text are part of the CellContentType above
      # these queries ask for no params, but they are called when the sheet is being built,
      # so the resolvers' parent arg has the id of the sheet that contains the cell, which is needed to find these values
      # is there a better way to structure this?
      subsheetId: ID
      text: String
   }
`;

module.exports = SheetType;