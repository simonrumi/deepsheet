/**
 * note that most functions here are very similar to functions in inserNewColumn.js
 * common functions have been moved to insertNewAxis.js
 * but these remaining ones are different enough from their Column counterparts that it doesn't
 * seem worthwhile generalizing them further.
 **/
import * as R from 'ramda';
import { updatedTotalRows, updatedRowVisibility, updatedHasChanged } from '../actions';
import { updatedCellKeys } from '../actions/cellActions';
import { createCellKey } from '../helpers/cellHelpers';
import { shouldShowColumn } from '../helpers/visibilityHelpers';
import {
   addOneCellReducer,
   addNewCellsToStore,
   addManyCellReducersToStore,
   maybeAddAxisVisibilityEntry,
} from './insertNewAxis';
import {
   stateTotalColumns,
   stateTotalRows,
   stateColumnVisibility,
   stateRowVisibility,
   // stateMetadata,
} from '../helpers/dataStructureHelpers';

const makeNewCell = (rowIndex, columnIndex, columnVisibility) => {
   return {
      row: rowIndex,
      column: columnIndex,
      content: '',
      visible: shouldShowColumn(columnVisibility, columnIndex),
   };
};

const addOneCell = (rowIndex, columnIndex, columnVisibility, updates) => {
   const cellKey = createCellKey(rowIndex, columnIndex);
   const cellKeys = R.append(cellKey, updates.cellKeys);
   const cellReducers = addOneCellReducer(cellKey, rowIndex, columnIndex, updates.cellReducers);
   const cell = makeNewCell(rowIndex, columnIndex, columnVisibility);
   const cells = R.append(cell, updates.cells);
   return { cellReducers, cellKeys, cells };
};

const createUpdatesForNewCells = (
   updates, //contains { cellReducers, cellKeys, cells }
   columnVisibility,
   rowIndex,
   totalColumns,
   columnIndex = 0
) => {
   if (totalColumns === columnIndex) {
      return updates;
   }
   return createUpdatesForNewCells(
      addOneCell(rowIndex, columnIndex, columnVisibility, updates),
      columnVisibility,
      rowIndex,
      totalColumns,
      columnIndex + 1
   );
};

const insertNewRow = (cellKeys, state) => {
   const totalRows = stateTotalRows(state);
   const totalColumns = stateTotalColumns(state);
   const rowVisibility = stateRowVisibility(state);
   const columnVisibility = stateColumnVisibility(state);
   const updates = createUpdatesForNewCells(
      { cellKeys: cellKeys, cellReducers: {}, cells: [] },
      columnVisibility,
      totalRows,
      totalColumns
   ); // totalRows, being the count of existing rows, will give us the index of the next row
   updatedCellKeys(updates.cellKeys);
   addManyCellReducersToStore(updates.cellReducers);
   maybeAddAxisVisibilityEntry(totalRows, rowVisibility, updatedRowVisibility);
   addNewCellsToStore(updates.cells);
   updatedTotalRows(totalRows + 1);
   updatedHasChanged(true);
};

export default insertNewRow;
