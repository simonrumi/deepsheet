/**
 * note that most functions here are very similar to functions in inserNewRow.js
 * common functions have been moved to insertNewAxis.js
 * but these remaining ones are different enough from their Row counterparts that it doesn't
 * seem worthwhile generalizing them further.
 **/
import * as R from 'ramda';
import managedStore from '../store';
import { updatedTotalColumns, updatedColumnVisibility, } from '../actions';
import { addedCellKeys } from '../actions/cellActions';
import { hasChangedMetadata, } from '../actions/metadataActions';
import { shouldShowRow } from '../helpers/visibilityHelpers';
import {
   stateTotalColumns,
   stateTotalRows,
   stateColumnVisibility,
   stateRowVisibility,
} from '../helpers/dataStructureHelpers';
import {
   addNewCellsToStore,
   addNewCellsToCellDbUpdates,
   maybeAddAxisVisibilityEntry,
   createUpdatesForNewCellKeys,
} from './insertNewAxis';
import { addCellReducers } from '../reducers/cellReducers';

const makeNewColumnCell = R.curry((rowIndex, columnIndex, rowVisibility) => {
   const partialCell = {
      row: rowIndex,
      column: columnIndex,
      content: { text: '', subsheetId: null },
      isStale: true,
   }
   return R.pipe(
      shouldShowRow(rowVisibility),
      R.assoc('visible', R.__, partialCell)
   )(partialCell);
});

const addOneCell = (columnIndex, rowIndex, state, cells) => R.pipe(
      stateRowVisibility, // get the visibility for the row
      makeNewColumnCell(rowIndex, columnIndex), // make the cell with the visibility set
      R.append(R.__, cells), // add the cell to the array of cells
   )(state);

const createUpdatesForNewCells = (
   cells,
   state,
   columnIndex,
   totalRows,
   rowIndex = 0
) => {
   if (totalRows === rowIndex) {
      return cells;
   }
   return createUpdatesForNewCells(
      addOneCell(columnIndex, rowIndex, state, cells),
      state,
      columnIndex,
      totalRows,
      rowIndex + 1
   );
};

const insertNewColumn = () => {
   const totalColumns = stateTotalColumns(managedStore.state);
   const updatedCells = createUpdatesForNewCells(
      [], // initial value for updatedCells
      managedStore.state,
      totalColumns, // being the count of existing columns, this gives us the index of the next column
      stateTotalRows(managedStore.state)
   ); 
   const updatedCellKeys = createUpdatesForNewCellKeys(updatedCells);
   maybeAddAxisVisibilityEntry(
      totalColumns, 
      stateColumnVisibility(managedStore.state), 
      updatedColumnVisibility
   );
   addCellReducers(updatedCells);
   addedCellKeys(updatedCellKeys);
   addNewCellsToStore(updatedCells);
   addNewCellsToCellDbUpdates(updatedCells);
   updatedTotalColumns(totalColumns + 1);
   hasChangedMetadata();
};

export default insertNewColumn;
