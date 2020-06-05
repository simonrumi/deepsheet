/* this file is very similar to sortColumn.js but making these functions generalized to handle either columns or rows
 * would make the functions hard to understand, so leaving as is
 */

// TODO // BUG:
// filter col C by 't' -> hides row '2', shows C as filtered ('sheet' is in col C)
// sort row '3' A-Z -> in row '3', 'sheet' moves from col C to col B BUT filter indicator stays on col C

// the issue is something to do with ColumnHeaderDetail not rerendering, even though columnVisibility has been updated
// by the action REPLACED_COLUMN_VISIBILITY

import * as R from 'ramda';
import { extractRowColFromCellKey, forLoopReduce } from '../helpers';
import {
   createNewAxisVisibility,
   createNewAxisFilters,
} from '../helpers/sortHelpers';
import { SORT_INCREASING, COLUMN_AXIS } from '../constants';
import { compareCellContent, compareCellContentDecreasing } from './sortAxis';

const updateCellsPerColumnMap = R.curry((state, mapOfChangedColumns) =>
   R.reduce(
      (accumulator, cellKey) => {
         const { column } = extractRowColFromCellKey(cellKey);
         // the mapOfChangedColumns is an array of arrays. Each sub-array is like, e.g. [2,3]
         // where 2 is the original column index and 3 is the index it is moving to
         const currentColumnMapping = R.find(
            (mappingPair) => mappingPair[0] === column
         )(mapOfChangedColumns);
         if (currentColumnMapping) {
            // take the cell at the old column and give it the new column index
            const newCell = {
               ...state[cellKey],
               column: currentColumnMapping[1],
            };
            return [...accumulator, newCell];
         }
         return accumulator;
      },
      [],
      state.cellKeys
   )
);

const createNewCellArrayAndColumnVisibilityAndColumnFilters = R.curry(
   (state, mapOfChangedColumns) => {
      return {
         updatedCells: updateCellsPerColumnMap(state, mapOfChangedColumns),
         updatedVisibility: R.assoc(
            COLUMN_AXIS,
            createNewAxisVisibility(
               state.sheet.columnVisibility,
               mapOfChangedColumns
            ),
            {}
         ),
         updatedFilters: R.assoc(
            COLUMN_AXIS,
            createNewAxisFilters(
               state.sheet.columnFilters,
               mapOfChangedColumns
            ),
            {}
         ),
      };
   }
);

const createMapOfChangedColumns = (newCellOrder) =>
   forLoopReduce(
      (accumulator, index) => {
         if (index !== newCellOrder[index].column) {
            return [...accumulator, [newCellOrder[index].column, index]];
         }
         return accumulator;
      },
      [],
      newCellOrder.length
   );

const rowSortFunc = (state) =>
   state.sheet.rowSortDirection === SORT_INCREASING
      ? compareCellContent
      : compareCellContentDecreasing;

const compareCellColumn = (cell1, cell2) => {
   if (cell1.column === cell2.column) {
      return 0;
   }
   return cell1.column > cell2.column ? 1 : -1;
};

// TODO mabye move to cellHelpers
const getCellsInRow = (state) =>
   R.reduce(
      (accumulator, cellKey) => {
         const { row } = extractRowColFromCellKey(cellKey);
         return row === state.sheet.rowSortByIndex
            ? [...accumulator, state[cellKey]]
            : accumulator;
      },
      [],
      state.cellKeys
   );

export default (state) =>
   R.pipe(
      getCellsInRow,
      R.sort(compareCellColumn),
      R.sort(rowSortFunc(state)),
      createMapOfChangedColumns,
      createNewCellArrayAndColumnVisibilityAndColumnFilters(state)
   )(state);
