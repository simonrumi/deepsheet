import { gql } from '@apollo/client';
import apolloClient from '../services/apolloClient';
import { prepCellsForDb } from '../helpers/cellHelpers';

const UPDATE_CELLS_MUTATION = gql`
   mutation UpdateCells($sheetId: ID!, $cells: [CellInput], $floatingCells: [FloatingCellInput] $userId: ID!) {
      updateCells(input: { sheetId: $sheetId, cells: $cells, floatingCells: $floatingCells, userId: $userId }) {
         cells {
            row
            column
            content {
               text
               subsheetId
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
					left
					top
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

export const updateCellsMutation = async ({ sheetId, cells, floatingCells, userId }) => {
   const preppedCells = prepCellsForDb(cells);
	const preppedFloatingCells = prepCellsForDb(floatingCells);
	console.log('cellMutations--updateCellsMutation got sheetId', sheetId, 'userId', userId, 'cells', cells, 'preppedCells', preppedCells, 'floatingCells', floatingCells, 'preppedFloatingCells', preppedFloatingCells);
	const result = await apolloClient.mutate({
      mutation: UPDATE_CELLS_MUTATION,
      variables: { sheetId, cells: preppedCells, floatingCells: preppedFloatingCells, userId },
   });
   return result.data?.updateCells || null; // .updateCells comes from the name in the mutation above
};

const DELETE_CELLS_MUTATION = gql`
   mutation DeleteCells($sheetId: ID!, $cells: [CellInput], $floatingCells: [FloatingCellInput] $userId: ID!) {
      deleteCells(input: { sheetId: $sheetId, cells: $cells, floatingCells: $floatingCells, userId: $userId }) {
         cells {
            row
            column
            content {
               text
               subsheetId
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
					left
					top
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

export const deleteCellsMutation = async ({ sheetId, cells, floatingCells, userId }) => {
	console.log('cellMutations--deleteCellsMutation got sheetId', sheetId, 'userId', userId, 'cells', cells, 'floatingCells', floatingCells);
	const result = await apolloClient.mutate({
      mutation: DELETE_CELLS_MUTATION,
      variables: { sheetId, cells, floatingCells, userId },
   });
   return result.data?.deleteCells || null; // .deleteCells comes from the name in the mutation above
}

const DELETE_SUBSHEET_ID_MUTATION = gql`
   mutation DeleteSubsheetId(
      $sheetId: ID!
      $row: Int!
      $column: Int!
      $formattedText: FormattedTextInput
      $subsheetId: ID!
   ) {
      deleteSubsheetId(
         input: {
            sheetId: $sheetId
            row: $row
            column: $column
            content: {
					formattedText: $formattedText
           		subsheetId: $subsheetId
				}
         }
      ) {
         row
         column
         content {
            text
            subsheetId
            formattedText {
               blocks {
                  inlineStyleRanges {
                     offset
                     length
                     style
                  }
                  text
                  key
               }
            }
         }
         visible
      }
   }
`;

/* data looks like this:
{
   row, 
   column, 
   content: {
		text,
      formattedText, 
      subsheetId
   },
   sheetId, 
} */
export const deleteSubsheetIdMutation = async data => {
   const { sheetId, row, column, content } = data;
   const { text, formattedText, subsheetId } = content;
	const result = await apolloClient.mutate({
      mutation: DELETE_SUBSHEET_ID_MUTATION,
      variables: { sheetId, row, column, text, formattedText, subsheetId },
   });
   return result.data.deleteSubsheetId; //note that "deleteSubsheetId" is the name of the mutation above
};
