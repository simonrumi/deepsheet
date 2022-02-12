/**
 * this file is very similar to sortRow.js but making these functions generalized to handle either columns or rows
 * would make the functions hard to understand, so leaving as is
 **/

import * as R from 'ramda';
import { forLoopReduce, getObjectFromArrayByKeyValue, isSomething } from '../helpers';
import { createNewAxisVisibility, createNewAxisFilters, createNewAxisSizing } from '../helpers/sortHelpers';
import { getAllCells } from '../helpers/cellHelpers';
import {
   stateRowVisibility,
   stateRowFilters,
   stateColumnSortDirection,
   stateColumnSortByIndex,
   cellColumn,
   cellRow,
   stateFrozenRows,
   stateRowHeights,
} from '../helpers/dataStructureHelpers';
import { SORT_DECREASING, ROW_AXIS } from '../constants';
import { compareCellContent } from './sortAxis';

const updateCellsPerRowMap = R.curry((state, mapOfChangedRows) =>
   R.reduce(
      (accumulator, cell) => {
         const row = cellRow(cell);
         // the mapOfChangedRows is an array of arrays. Each sub-array is like, e.g. [2,3]
         // where 2 is the original row index and 3 is the index it is moving to
         const currentRowMapping = R.find(mappingPair => mappingPair[0] === row)(mapOfChangedRows);
         if (currentRowMapping) {
            // take the cell at the old row and give it the new row index
            const newCell = { 
               ...cell, 
               row: currentRowMapping[1] 
            };
            return [...accumulator, newCell];
         }
         return accumulator;
      },
      [],
      getAllCells(state)
   )
);

const createUpdatesForStore = R.curry((state, mapOfChangedRows) => {
   return {
      updatedCells: updateCellsPerRowMap(state, mapOfChangedRows),
      updatedVisibility: R.assoc(
         ROW_AXIS, 
         createNewAxisVisibility(stateRowVisibility(state), mapOfChangedRows), 
         {}
      ),
      updatedFilters: R.assoc(
         ROW_AXIS, 
         createNewAxisFilters(stateRowFilters(state), mapOfChangedRows), 
         {}
      ),
      updatedSizing: R.assoc(
         ROW_AXIS, 
         createNewAxisSizing(stateRowHeights(state), mapOfChangedRows),
         {}
      ),
   };
});

const createMapOfChangedRows = newCellOrder => 
   forLoopReduce(
      (accumulator, index) => {
         if (index !== newCellOrder[index].row) {
            return [...accumulator, [newCellOrder[index].row, index]]; // adds a tuple with the [original row index, new row index] 
         }
         return accumulator;
      },
      [],
      newCellOrder.length
   );

const columnSortFunc = state =>
   stateColumnSortDirection(state) === SORT_DECREASING ? compareCellContent(state, true) : compareCellContent(state, false);

const columnSort = R.curry((state, cellArrays) => {
   const sortedMoveableCells = R.sort(columnSortFunc(state), cellArrays.moveableCells);
   const sortedCells = R.reduce(
      (accumulator, frozenCell) =>
         R.insert(
            frozenCell.row, // index to insert at
            frozenCell, // element to insert
            accumulator // list to insert into
         ),
      sortedMoveableCells, // initial list
      cellArrays.frozenCells
   );
   return sortedCells;
}); 

const separateFrozenCells = R.curry((state, cellsInColumn) => {
   const frozenRows = stateFrozenRows(state);
   return R.reduce(
      (accumulator, cell) => {
         const frozen = getObjectFromArrayByKeyValue('index', cell.row, frozenRows);
         if (isSomething(frozen) && frozen.isFrozen) {
            accumulator.frozenCells = R.append(cell, accumulator.frozenCells);
            return accumulator
         }
         accumulator.moveableCells = R.append(cell, accumulator.moveableCells);
         return accumulator
      },
      {moveableCells: [], frozenCells: []},
      cellsInColumn
   );
})

const compareCellRow = (cell1, cell2) => {
   if (cell1.row === cell2.row) {
      return 0; 
   }
   return cell1.row > cell2.row ? 1 : -1;
};

const getCellsInColumn = state =>
   R.reduce(
      (accumulator, cell) => cellColumn(cell) === stateColumnSortByIndex(state) 
         ? [...accumulator, cell] 
         : accumulator,
      [],
      getAllCells(state)
   );

const sortColumn = state =>
   R.pipe(
      getCellsInColumn,
      R.sort(compareCellRow),
      separateFrozenCells(state),
      columnSort(state),
      createMapOfChangedRows,
      createUpdatesForStore(state),
   )(state);

export default sortColumn;