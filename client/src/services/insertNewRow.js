/**
 * note that most functions here are very similar to functions in inserNewColumn.js
 * common functions have been moved to insertNewAxis.js
 * but these remaining ones are different enough from their Column counterparts that it doesn't
 * seem worthwhile generalizing them further.
 **/
import * as R from 'ramda';
import managedStore from '../store';
import { updatedTotalRows, updatedRowVisibility, } from '../actions';
import { addedCellKeys } from '../actions/cellActions';
import { hasChangedMetadata, updatedRowHeight } from '../actions/metadataActions';
import { shouldShowColumn } from '../helpers/visibilityHelpers';
import {
   addNewCellsToStore,
   addNewCellsToCellDbUpdates,
   maybeAddAxisVisibilityEntry,
   createUpdatesForNewCellKeys,
} from './insertNewAxis';
import {
   stateTotalColumns,
   stateTotalRows,
   stateColumnVisibility,
   stateRowVisibility,
} from '../helpers/dataStructureHelpers';
import { addCellReducers } from '../reducers/cellReducers';
import { DEFAULT_ROW_HEIGHT } from '../constants';

const makeNewRowCell = (rowIndex, columnIndex, columnVisibility) => {
   const partialCell = {
      row: rowIndex,
      column: columnIndex,
      content: { text: '', subsheetId: null },
      isStale: true,
   }
   return R.pipe(
      shouldShowColumn,
      R.assoc('visible', R.__, partialCell)
   )(columnVisibility, columnIndex);

};

const addOneCell = (rowIndex, columnIndex, columnVisibility, cells) => R.pipe(
      makeNewRowCell,
      R.append(R.__, cells),
   )(rowIndex, columnIndex, columnVisibility);

const createUpdatesForNewCells = (
   cells,
   columnVisibility,
   rowIndex,
   totalColumns,
   columnIndex = 0
) => {
   if (totalColumns === columnIndex) {
      return cells;
   }
   return createUpdatesForNewCells(
      addOneCell(rowIndex, columnIndex, columnVisibility, cells),
      columnVisibility,
      rowIndex,
      totalColumns,
      columnIndex + 1
   );
};

const insertNewRow = () => {
   const totalRows = stateTotalRows(managedStore.state);
   const rowVisibility = stateRowVisibility(managedStore.state);
   const columnVisibility = stateColumnVisibility(managedStore.state);
   const updatedCells = createUpdatesForNewCells(
      [], // initial value for updatedCells
      columnVisibility,
      totalRows, // being the count of existing rows, this gives us the index of the next row
      stateTotalColumns(managedStore.state)
   );
   const updatedCellKeys = createUpdatesForNewCellKeys(updatedCells);
   maybeAddAxisVisibilityEntry(
      totalRows, 
      rowVisibility, 
      updatedRowVisibility
   );
   addCellReducers(updatedCells);
   addedCellKeys(updatedCellKeys);
   addNewCellsToStore(updatedCells);
   addNewCellsToCellDbUpdates(updatedCells);
   updatedTotalRows(totalRows + 1);
   updatedRowHeight(totalRows, DEFAULT_ROW_HEIGHT);
   hasChangedMetadata();
};

export default insertNewRow;
