import * as R from 'ramda';
import managedStore from '../store';
import {
   UPDATED_CELL_,
   UPDATED_CONTENT_OF_CELL_,
   UPDATED_CELL_KEYS,
   POSTING_UPDATED_CELLS,
   HAS_ADDED_CELL,
   HAS_CHANGED_CELL,
   POSTING_DELETE_SUBSHEET_ID_,
} from './cellTypes';
import { isNothing } from '../helpers';

export const updatedCell = cell => {
   if (isNothing(cell) || R.not(R.has('content', cell))) {
      console.warn('WARNING: updatedCell could not create an action. It received', cell);
      return;
   }
   managedStore.store.dispatch({
      type: UPDATED_CELL_ + cell.row + '_' + cell.column,
      payload: cell,
   });
};

export const updatedCellBeingEdited = cell => {
   const updateCellType = UPDATED_CONTENT_OF_CELL_ + cell.row + '_' + cell.column;
   managedStore.store.dispatch({ type: updateCellType, payload: cell });
};

export const updatedCellKeys = keys => {
   managedStore.store.dispatch({ type: UPDATED_CELL_KEYS, payload: keys });
};

export const updatedCells = async ({ sheetId, cells }) => {
   managedStore.store.dispatch({ type: POSTING_UPDATED_CELLS, payload: { sheetId, cells } });
};

export const deleteSubsheetId = R.curry(async (row, column, text, subsheetId, sheetId) => {
   managedStore.store.dispatch({
      type: POSTING_DELETE_SUBSHEET_ID_ + row + '_' + column,
      payload: { row, column, text, sheetId, subsheetId },
   });
});

export const hasChangedCell = cellCoordinates => {
   managedStore.store.dispatch({
      type: HAS_CHANGED_CELL,
      payload: cellCoordinates,
   });
};

export const hasAddedCell = cellCoordinates => {
   managedStore.store.dispatch({
      type: HAS_ADDED_CELL,
      payload: cellCoordinates,
   });
};
