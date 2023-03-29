import { gql } from '@apollo/client';
import apolloClient from '../services/apolloClient';
import { prepCellsForDb } from '../helpers/cellHelpers';

const ADD_FLOATING_CELLS_MUTATION = gql`
   mutation AddFloatingCells($sheetId: ID!, $floatingCells: [FloatingCellInput], $userId: ID!) {
      addFloatingCells(input: { sheetId: $sheetId, floatingCells: $floatingCells, userId: $userId }) {
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
         }
      }
   }
`;

export const addFloatingCellsMutation = async ({ sheetId, floatingCells, userId }) => {
	console.log('cellMutations--addFloatingCellsMutation got sheetId', sheetId, 'userId', userId, 'floatingCells', floatingCells);
   const preppedCells = prepCellsForDb(floatingCells);
	const result = await apolloClient.mutate({
      mutation: ADD_FLOATING_CELLS_MUTATION,
      variables: { sheetId, floatingCells: preppedCells, userId },
   });
   return result.data?.addFloatingCells || null; // .addFloatingCells comes from the name in the mutation above
};

const UPDATE_FLOATING_CELLS_MUTATION = gql`
   mutation UpdateFloatingCells($sheetId: ID!, $floatingCells: [FloatingCellInput], $userId: ID!) {
      updateFloatingCells(input: { sheetId: $sheetId, floatingCells: $floatingCells, userId: $userId }) {
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

export const updateFloatingCellsMutation = async ({ sheetId, floatingCells, userId }) => {
	console.log('cellMutations--updateFloatingCellsMutation got sheetId', sheetId, 'userId', userId, 'floatingCells', floatingCells);
   const preppedCells = prepCellsForDb(floatingCells);
	console.log('cellMutations--updateFloatingCellsMutation got preppedCells', preppedCells);
   
	const result = await apolloClient.mutate({
      mutation: UPDATE_FLOATING_CELLS_MUTATION,
      variables: { sheetId, floatingCells: preppedCells, userId },
   });
	console.log('cellMutations--updateFloatingCellsMutation got result.data', result.data);
   return result.data?.updateFloatingCells || null; // .updateFloatingCells comes from the name in the mutation above
};

const UPDATE_CELLS_MUTATION = gql`
   mutation UpdateCells($sheetId: ID!, $cells: [CellInput], $userId: ID!) {
      updateCells(input: { sheetId: $sheetId, cells: $cells, userId: $userId }) {
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
      }
   }
`;

export const updateCellsMutation = async ({ sheetId, cells, userId }) => {
   const preppedCells = prepCellsForDb(cells);
	console.log('cellMutations--updateCellsMutation got sheetId', sheetId, 'userId', userId, 'cells', cells, 'preppedCells', preppedCells);
	const result = await apolloClient.mutate({
      mutation: UPDATE_CELLS_MUTATION,
      variables: { sheetId, cells: preppedCells, userId },
   });
   return result.data?.updateCells || null; // .updateCells comes from the name in the mutation above
};

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
