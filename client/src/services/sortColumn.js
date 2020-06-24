/* this file is very similar to sortRow.js but making these functions generalized to handle either columns or rows
 * would make the functions hard to understand, so leaving as is
 */

import * as R from 'ramda';
import { extractRowColFromCellKey, forLoopReduce } from '../helpers';
import { createNewAxisVisibility, createNewAxisFilters } from '../helpers/sortHelpers';
import { stateRowVisibility, stateRowFilters } from '../helpers/dataStructureHelpers';
import { SORT_INCREASING, ROW_AXIS } from '../constants';
import { compareCellContent, compareCellContentDecreasing } from './sortAxis';

const updateCellsPerRowMap = R.curry((state, mapOfChangedRows) =>
   R.reduce(
      (accumulator, cellKey) => {
         const { row } = extractRowColFromCellKey(cellKey);
         // the mapOfChangedRows is an array of arrays. Each sub-array is like, e.g. [2,3]
         // where 2 is the original row index and 3 is the index it is moving to
         const currentRowMapping = R.find(mappingPair => mappingPair[0] === row)(mapOfChangedRows);
         if (currentRowMapping) {
            // take the cell at the old row and give it the new row index
            const newCell = { ...state[cellKey], row: currentRowMapping[1] };
            return [...accumulator, newCell];
         }
         return accumulator;
      },
      [],
      state.cellKeys
   )
);

const createNewCellArrayAndRowVisibilityAndRowFilters = R.curry((state, mapOfChangedRows) => {
   return {
      updatedCells: updateCellsPerRowMap(state, mapOfChangedRows),
      updatedVisibility: R.assoc(ROW_AXIS, createNewAxisVisibility(stateRowVisibility(state), mapOfChangedRows), {}),
      updatedFilters: R.assoc(ROW_AXIS, createNewAxisFilters(stateRowFilters(state), mapOfChangedRows), {}),
   };
});

const createMapOfChangedRows = newCellOrder =>
   forLoopReduce(
      (accumulator, index) => {
         if (index !== newCellOrder[index].row) {
            return [...accumulator, [newCellOrder[index].row, index]];
         }
         return accumulator;
      },
      [],
      newCellOrder.length
   );

const columnSortFunc = state =>
   state.sheet.columnSortDirection === SORT_INCREASING ? compareCellContent : compareCellContentDecreasing;

const compareCellRow = (cell1, cell2) => {
   if (cell1.row === cell2.row) {
      return 0;
   }
   return cell1.row > cell2.row ? 1 : -1;
};

// TODO mabye move to cellHelpers
const getCellsInColumn = state =>
   R.reduce(
      (accumulator, cellKey) => {
         const { column } = extractRowColFromCellKey(cellKey);
         return column === state.sheet.columnSortByIndex ? [...accumulator, state[cellKey]] : accumulator;
      },
      [],
      state.cellKeys
   );

export default state =>
   R.pipe(
      getCellsInColumn,
      R.sort(compareCellRow),
      R.sort(columnSortFunc(state)),
      createMapOfChangedRows,
      createNewCellArrayAndRowVisibilityAndRowFilters(state)
   )(state);
