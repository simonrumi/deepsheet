import { gql } from '@apollo/client';
import apolloClient from '../services/apolloClient';
import { prepCellsForDb } from '../helpers/cellHelpers';

const CREATE_SHEET_MUTATION = gql`
   mutation CreateSheet(
      $userId: ID!
      $rows: Int
      $columns: Int
      $title: String
      $parentSheetId: ID
      $rowHeights: [SheetSizingInput]
      $columnWidths: [SheetSizingInput]
      $cellRange: [CellInput]
   ) {
      createSheet(
         input: {
            userId: $userId
            rows: $rows
            columns: $columns
            title: $title
            parentSheetId: $parentSheetId
            rowHeights: $rowHeights, 
            columnWidths: $columnWidths,
            cellRange: $cellRange,
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
            lastAccessed
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
            rowHeights {
               index
               size
            }
            columnWidths {
               index
               size
            }
         }
         cells {
            row
            column
            content {
               subsheetId
					formattedText {
						blocks {
							text
							key
							inlineStyleRanges {
								offset
								length
								style
							}
						}
					}
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
   rowHeights, 
   columnWidths,
   cellRange,
}) => {
   const response = await apolloClient.mutate({
      mutation: CREATE_SHEET_MUTATION,
      variables: {
         userId,
         rows,
         columns,
         title,
         parentSheetId,
         rowHeights,
         columnWidths,
         cellRange: prepCellsForDb(cellRange),
      },
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
            parentSheetId,
				created
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
            parentSheetId,
				created
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
            lastAccessed
            totalRows
            totalColumns
            parentSheetId
            columnFilters {
               index
               filterExpression
               caseSensitive
					hideBlanks
               regex
            }
            rowFilters {
               index
               filterExpression
               caseSensitive
					hideBlanks
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
               subsheetId
					text
					formattedText {
						blocks {
							inlineStyleRanges {
								offset
								length
								style
							}
							key
							text
						}
					}
            }
            visible
         }
			floatingCells {
				number
				position {
					top
					left
					width
					height
					right
					bottom
				}
				content {
					formattedText {
						blocks {
							inlineStyleRanges {
								offset
								length
								style
							}
							key
							text
						}
					}
				}
			}
      }
   }
`;
// note that we need to return cells.content.text as well as cells.content.formattedText
// for backward compatibility

export const sheetByUserIdMutation = async userId => {
	const result = await apolloClient.mutate({
      mutation: SHEET_BY_USER_ID_MUTATION,
      variables: { userId },
   });
   return result.data.sheetByUserId;
};

const SHEET_HISTORY_MUTATION = gql`
	mutation SheetHistoryMutation($userId: ID!, $sheetId: ID!) {
		sheetHistory(userId: $userId, sheetId: $sheetId) {
			actionHistory {
				futureActions {
					message
					timestamp
					undoableType
				}
				pastActions {
					message
					timestamp
					undoableType
				}
				presentAction {
					message
					timestamp
					undoableType
				}
			}
			future {
				cells {
					column
					content {
						formattedText {
							blocks {
								inlineStyleRanges {
									length
									offset
									style
								}
								key
								text
							}
						}
						subsheetId
						text
					}
					row
					visible
				}
				floatingCells {
					content {
						formattedText {
							blocks {
								inlineStyleRanges {
									length
									offset
									style
								}
								key
								text
							}
						}
						subsheetId
						text
					}
					number
					position {
						bottom
						height
						left
						right
						top
						width
					}
				}
				id
				metadata {
					columnFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					columnWidths {
						index
						size
					}
					created
					frozenColumns {
						index
						isFrozen
					}
					frozenRows {
						index
						isFrozen
					}
					lastAccessed
					lastUpdated
					parentSheetId
					rowFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					rowHeights {
						index
						size
					}
					totalColumns
					totalRows
				}
				title
				users {
					collaborators {
						collaborator
						permissions
					}
					owner
				}
			}
			past {
				cells {
					column
					content {
						formattedText {
							blocks {
							inlineStyleRanges {
								length
								offset
								style
							}
							key
							text
							}
						}
						subsheetId
						text
					}
					row
					visible
				}
				floatingCells {
					content {
						formattedText {
							blocks {
							inlineStyleRanges {
								length
								offset
								style
							}
							key
							text
							}
						}
						subsheetId
						text
					}
					number
					position {
						bottom
						height
						left
						right
						top
						width
					}
				}
				id
				metadata {
					columnFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					columnWidths {
						index
						size
					}
					created
					frozenColumns {
						index
						isFrozen
					}
					frozenRows {
						index
						isFrozen
					}
					lastAccessed
					lastUpdated
					parentSheetId
					rowFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					rowHeights {
						index
						size
					}
					totalColumns
					totalRows
				}
				title
				users {
					collaborators {
						collaborator
						permissions
					}
					owner
				}
			}
			present {
				cells {
					column
					content {
						text
						subsheetId
						formattedText {
							blocks {
							inlineStyleRanges {
								length
								offset
								style
							}
							key
							text
							}
						}
					}
					row
					visible
				}
				floatingCells {
					content {
						formattedText {
							blocks {
							inlineStyleRanges {
								length
								offset
								style
							}
							key
							text
							}
						}
						subsheetId
						text
					}
					number
					position {
						bottom
						height
						left
						right
						top
						width
					}
				}
				id
				metadata {
					columnFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					columnWidths {
						index
						size
					}
					created
					frozenColumns {
						index
						isFrozen
					}
					frozenRows {
						index
						isFrozen
					}
					lastAccessed
					lastUpdated
					parentSheetId
					rowFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					rowHeights {
						index
						size
					}
					totalColumns
					totalRows
				}
				title
				users {
					collaborators {
						collaborator
						permissions
					}
					owner
				}
			}
		}
	}
`;

export const sheetHistoryMutation = async (sheetId, userId) => {
	console.log('sheetMutations--sheetHistoryMutation got sheetId', sheetId, 'userId', userId);
	const result = await apolloClient.mutate({
      mutation: SHEET_HISTORY_MUTATION,
      variables: { sheetId, userId },
   });
   return result.data.sheetHistory;
}

const UPDATE_HISTORY_MUTATION = gql`
	mutation UpdateHistoryMutation(
		$sheetId: ID! 
		$past: [SheetInput]
		$present: SheetInput
		$future: [SheetInput]
		$actionHistory: [ActionHistoryInput]
	) {
		updateHistory(
			input: {
				sheetId: $sheetId
				past: $past
				present: $present
				future: $future
				actionHistory: $actionHistory
			}
		) {
			actionHistory {
				futureActions {
					message
					timestamp
					undoableType
				}
				pastActions {
					message
					timestamp
					undoableType
				}
				presentAction {
					message
					timestamp
					undoableType
				}
			}
			future {
				cells {
					column
					content {
						formattedText {
							blocks {
								inlineStyleRanges {
									length
									offset
									style
								}
								key
								text
							}
						}
						subsheetId
						text
					}
					row
					visible
				}
				floatingCells {
					content {
						formattedText {
							blocks {
								inlineStyleRanges {
									length
									offset
									style
								}
								key
								text
							}
						}
						subsheetId
						text
					}
					number
					position {
						bottom
						height
						left
						right
						top
						width
					}
				}
				id
				metadata {
					columnFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					columnWidths {
						index
						size
					}
					created
					frozenColumns {
						index
						isFrozen
					}
					frozenRows {
						index
						isFrozen
					}
					lastAccessed
					lastUpdated
					parentSheetId
					rowFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					rowHeights {
						index
						size
					}
					totalColumns
					totalRows
				}
				title
				users {
					collaborators {
						collaborator
						permissions
					}
					owner
				}
			}
			past {
				cells {
					column
					content {
						formattedText {
							blocks {
							inlineStyleRanges {
								length
								offset
								style
							}
							key
							text
							}
						}
						subsheetId
						text
					}
					row
					visible
				}
				floatingCells {
					content {
						formattedText {
							blocks {
							inlineStyleRanges {
								length
								offset
								style
							}
							key
							text
							}
						}
						subsheetId
						text
					}
					number
					position {
						bottom
						height
						left
						right
						top
						width
					}
				}
				id
				metadata {
					columnFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					columnWidths {
						index
						size
					}
					created
					frozenColumns {
						index
						isFrozen
					}
					frozenRows {
						index
						isFrozen
					}
					lastAccessed
					lastUpdated
					parentSheetId
					rowFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					rowHeights {
						index
						size
					}
					totalColumns
					totalRows
				}
				title
				users {
					collaborators {
						collaborator
						permissions
					}
					owner
				}
			}
			present {
				cells {
					column
					content {
						text
						subsheetId
						formattedText {
							blocks {
							inlineStyleRanges {
								length
								offset
								style
							}
							key
							text
							}
						}
					}
					row
					visible
				}
				floatingCells {
					content {
						formattedText {
							blocks {
							inlineStyleRanges {
								length
								offset
								style
							}
							key
							text
							}
						}
						subsheetId
						text
					}
					number
					position {
						bottom
						height
						left
						right
						top
						width
					}
				}
				id
				metadata {
					columnFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					columnWidths {
						index
						size
					}
					created
					frozenColumns {
						index
						isFrozen
					}
					frozenRows {
						index
						isFrozen
					}
					lastAccessed
					lastUpdated
					parentSheetId
					rowFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					rowHeights {
						index
						size
					}
					totalColumns
					totalRows
				}
				title
				users {
					collaborators {
						collaborator
						permissions
					}
					owner
				}
			}
		}
	}
`;

export const updateHistoryMutation = async ({ sheetId, newHistory }) => {
	const { past, present, future, actionHistory } = newHistory;
	const result = await apolloClient.mutate({
      mutation: UPDATE_HISTORY_MUTATION,
      variables: { sheetId, past, present, future, actionHistory, },
   });
   return result.data.sheetHistory;
}

export const SHEET_HISTORY_BY_USER_ID_MUTATION = gql`
   mutation SheetByUserIdMutation($userId: ID!) {
		sheetHistoryByUserId(userId: $userId) {
			actionHistory {
				futureActions {
					message
					timestamp
					undoableType
				}
				pastActions {
					message
					timestamp
					undoableType
				}
				presentAction {
					message
					timestamp
					undoableType
				}
			}
			future {
				cells {
					column
					content {
						formattedText {
							blocks {
								inlineStyleRanges {
									length
									offset
									style
								}
								key
								text
							}
						}
						subsheetId
						text
					}
					row
					visible
				}
				floatingCells {
					content {
						formattedText {
							blocks {
								inlineStyleRanges {
									length
									offset
									style
								}
								key
								text
							}
						}
						subsheetId
						text
					}
					number
					position {
						bottom
						height
						left
						right
						top
						width
					}
				}
				id
				metadata {
					columnFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					columnWidths {
						index
						size
					}
					created
					frozenColumns {
						index
						isFrozen
					}
					frozenRows {
						index
						isFrozen
					}
					lastAccessed
					lastUpdated
					parentSheetId
					rowFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					rowHeights {
						index
						size
					}
					totalColumns
					totalRows
				}
				title
				users {
					collaborators {
						collaborator
						permissions
					}
					owner
				}
			}
			past {
				cells {
					column
					content {
						formattedText {
							blocks {
							inlineStyleRanges {
								length
								offset
								style
							}
							key
							text
							}
						}
						subsheetId
						text
					}
					row
					visible
				}
				floatingCells {
					content {
						formattedText {
							blocks {
							inlineStyleRanges {
								length
								offset
								style
							}
							key
							text
							}
						}
						subsheetId
						text
					}
					number
					position {
						bottom
						height
						left
						right
						top
						width
					}
				}
				id
				metadata {
					columnFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					columnWidths {
						index
						size
					}
					created
					frozenColumns {
						index
						isFrozen
					}
					frozenRows {
						index
						isFrozen
					}
					lastAccessed
					lastUpdated
					parentSheetId
					rowFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					rowHeights {
						index
						size
					}
					totalColumns
					totalRows
				}
				title
				users {
					collaborators {
						collaborator
						permissions
					}
					owner
				}
			}
			present {
				cells {
					column
					content {
						text
						subsheetId
						formattedText {
							blocks {
							inlineStyleRanges {
								length
								offset
								style
							}
							key
							text
							}
						}
					}
					row
					visible
				}
				floatingCells {
					content {
						formattedText {
							blocks {
							inlineStyleRanges {
								length
								offset
								style
							}
							key
							text
							}
						}
						subsheetId
						text
					}
					number
					position {
						bottom
						height
						left
						right
						top
						width
					}
				}
				id
				metadata {
					columnFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					columnWidths {
						index
						size
					}
					created
					frozenColumns {
						index
						isFrozen
					}
					frozenRows {
						index
						isFrozen
					}
					lastAccessed
					lastUpdated
					parentSheetId
					rowFilters {
						caseSensitive
						filterExpression
						hideBlanks
						index
						regex
					}
					rowHeights {
						index
						size
					}
					totalColumns
					totalRows
				}
				title
				users {
					collaborators {
						collaborator
						permissions
					}
					owner
				}
			}
		}
	}
`;
// note that we need to return cells.content.text as well as cells.content.formattedText
// for backward compatibility

export const sheetHistoryByUserIdMutation = async userId => {
	const result = await apolloClient.mutate({
      mutation: SHEET_HISTORY_BY_USER_ID_MUTATION,
      variables: { userId },
   });
   return result.data.sheetHistoryByUserId;
};

const UPDATE_SHEET_LAST_ACCESSED = gql`
   mutation UpdateSheetLastAccessed($id: ID!, $lastAccessed: String!) {
      updateSheetLastAccessed(id: $id, lastAccessed: $lastAccessed) {
         id
         title
         metadata {
            created
            lastUpdated
            lastAccessed
         }
      }
   }
`;

export const updateSheetLastAccessed = async sheetId => {
   const sheetResult = await apolloClient.mutate({
      mutation: UPDATE_SHEET_LAST_ACCESSED,
      variables: { id: sheetId, lastAccessed: Date.now().toString() }
   });
   return sheetResult;
} 
