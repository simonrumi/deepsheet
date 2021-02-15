/** 
 * this file is very similar to sortColumn.js but making these functions generalized to handle either columns or rows
 * would make the functions hard to understand, so leaving as is
 **/

import * as R from 'ramda';
import { forLoopReduce, getObjectFromArrayByKeyValue, isSomething } from '../helpers';
import { createNewAxisVisibility, createNewAxisFilters, createNewAxisSizing } from '../helpers/sortHelpers';
import { getAllCells } from '../helpers/cellHelpers';
import {
   stateColumnVisibility,
   stateColumnFilters,
   stateRowSortByIndex,
   stateRowSortDirection,
   cellRow,
   cellColumn,
   stateFrozenColumns,
   stateColumnWidths,
} from '../helpers/dataStructureHelpers';
import { SORT_DECREASING, COLUMN_AXIS } from '../constants';
import { compareCellContent } from './sortAxis';

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

const createUpdatesForStore = R.curry((state, mapOfChangedColumns) => {
   return {
      updatedCells: updateCellsPerColumnMap(state, mapOfChangedColumns),
      updatedVisibility: R.assoc(
         COLUMN_AXIS,
         createNewAxisVisibility(stateColumnVisibility(state), mapOfChangedColumns),
         {}
      ),
      updatedFilters: R.assoc(
         COLUMN_AXIS, 
         createNewAxisFilters(stateColumnFilters(state), mapOfChangedColumns),
         {}
      ),
      updatedSizing: R.assoc(
         COLUMN_AXIS, 
         createNewAxisSizing(stateColumnWidths(state), mapOfChangedColumns),
         {}
      ),
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
   stateRowSortDirection(state) === SORT_DECREASING ? compareCellContent(state, true) : compareCellContent(state, false);

const rowSort = R.curry((state, cellArrays) => {
   const sortedMoveableCells = R.sort(rowSortFunc(state), cellArrays.moveableCells);
   const sortedCells = R.reduce(
      (accumulator, frozenCell) =>
         R.insert(
            frozenCell.column, // index to insert at
            frozenCell, // element to insert
            accumulator // list to insert into
         ),
      sortedMoveableCells, // initial list
      cellArrays.frozenCells
   );
   return sortedCells;
}); 
   
const separateFrozenCells = R.curry((state, cellsInRow) => {
   const frozenColumns = stateFrozenColumns(state);
   return R.reduce(
      (accumulator, cell) => {
         const frozen = getObjectFromArrayByKeyValue('index', cell.column, frozenColumns);
         if (isSomething(frozen) && frozen.isFrozen) {
            accumulator.frozenCells = R.append(cell, accumulator.frozenCells);
            return accumulator
         }
         accumulator.moveableCells = R.append(cell, accumulator.moveableCells);
         return accumulator
      },
      {moveableCells: [], frozenCells: []},
      cellsInRow
   );
})

const compareCellColumn = (cell1, cell2) => {
   if (cell1.column === cell2.column) {
      return 0;
   }
   return cell1.column > cell2.column ? 1 : -1;
};

const getCellsInRow = state =>
   R.reduce(
      (accumulator, cell) => cellRow(cell) === stateRowSortByIndex(state) 
         ? [...accumulator, cell] 
         : accumulator,
      [],
      getAllCells(state)
   );

export default state => 
   R.pipe(
      getCellsInRow,
      R.sort(compareCellColumn),
      separateFrozenCells(state),
      rowSort(state),
      createMapOfChangedColumns,
      createUpdatesForStore(state),
     )(state);
