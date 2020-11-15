/* this file is very similar to sortColumn.js but making these functions generalized to handle either columns or rows
 * would make the functions hard to understand, so leaving as is
 */
import * as R from 'ramda';
import { forLoopReduce } from '../helpers';
import { createNewAxisVisibility, createNewAxisFilters } from '../helpers/sortHelpers';
import { getAllCells } from '../helpers/cellHelpers';
import {
   stateColumnVisibility,
   stateColumnFilters,
   stateRowSortByIndex,
   stateRowSortDirection,
   cellRow,
   cellColumn
} from '../helpers/dataStructureHelpers';
import { SORT_INCREASING, COLUMN_AXIS } from '../constants';
import { compareCellContent, compareCellContentDecreasing } from './sortAxis';

const updateCellsPerColumnMap = R.curry((state, mapOfChangedColumns) =>
   R.reduce(
      (accumulator, cell) => {
         const column = cellColumn(cell);
         // the mapOfChangedColumns is an array of arrays. Each sub-array is like, e.g. [2,3]
         // where 2 is the original column index and 3 is the index it is moving to
         const currentColumnMapping = R.find(mappingPair => mappingPair[0] === column)(mapOfChangedColumns);
         if (currentColumnMapping) {
            // take the cell at the old column and give it the new column index
            const newCell = {
               ...cell,
               column: currentColumnMapping[1],
            };
            return [...accumulator, newCell];
         }
         return accumulator;
      },
      [],
      getAllCells(state)
   )
);

const createNewCellArrayAndColumnVisibilityAndColumnFilters = R.curry((state, mapOfChangedColumns) => {
   return {
      updatedCells: updateCellsPerColumnMap(state, mapOfChangedColumns),
      updatedVisibility: R.assoc(
         COLUMN_AXIS,
         createNewAxisVisibility(stateColumnVisibility(state), mapOfChangedColumns),
         {}
      ),
      updatedFilters: R.assoc(COLUMN_AXIS, createNewAxisFilters(stateColumnFilters(state), mapOfChangedColumns), {}),
   };
});

const createMapOfChangedColumns = newCellOrder =>
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

const rowSortFunc = state =>
   stateRowSortDirection(state) === SORT_INCREASING ? compareCellContent : compareCellContentDecreasing;

const compareCellColumn = (cell1, cell2) => {
   if (cell1.column === cell2.column) {
      return 0;
   }
   return cell1.column > cell2.column ? 1 : -1;
};

const getCellsInRow = state =>
   R.reduce(
      (accumulator, cell) => {
         return cellRow(cell) === stateRowSortByIndex(state) ? [...accumulator, cell] : accumulator;
      },
      [],
      getAllCells(state)
   );

export default state =>
   R.pipe(
      getCellsInRow,
      R.sort(compareCellColumn),
      R.sort(rowSortFunc(state)),
      createMapOfChangedColumns,
      createNewCellArrayAndColumnVisibilityAndColumnFilters(state)
   )(state);
