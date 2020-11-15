import * as R from 'ramda';
import managedStore from '../store';
import {
   UPDATED_CELL,
   UPDATED_CONTENT_OF_CELL,
   POSTING_UPDATED_CELLS,
   HAS_ADDED_CELL,
   HAS_CHANGED_CELL,
   POSTING_DELETE_SUBSHEET_ID,
   CELLS_LOADED,
   ADDED_CELL_KEYS,
   REMOVED_CELL_KEYS,
   CLEARED_ALL_CELL_KEYS,
} from './cellTypes';
import { isNothing } from '../helpers';

export const updatedCell = cell => {
   if (isNothing(cell) || R.not(R.has('content', cell))) {
      console.warn('WARNING: updatedCell could not create an action. It received', cell);
      return;
   }

   managedStore.store.dispatch({
      type: UPDATED_CELL,
      payload: cell,
   });
};

export const updatedCellBeingEdited = cell => {
   managedStore.store.dispatch({ type: UPDATED_CONTENT_OF_CELL, payload: cell }); 
};

export const updatedCells = async ({ sheetId, cells }) => {
   managedStore.store.dispatch({ type: POSTING_UPDATED_CELLS, payload: { sheetId, cells } });
};

export const deleteSubsheetId = R.curry(async (row, column, text, subsheetId, sheetId) => {
   console.log('cellActions deleteSubsheetId dispatching POSTING_DELETE_SUBSHEET_ID');
   managedStore.store.dispatch({
      type: POSTING_DELETE_SUBSHEET_ID,
      payload: {
         row, 
         column, 
         content: {
            text, 
            subsheetId
         },
         sheetId, 
      }
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

export const cellsLoaded = () => {
   managedStore.store.dispatch({
      type: CELLS_LOADED,
   });
}

export const addedCellKeys = cellKey => {
   managedStore.store.dispatch({
      type: ADDED_CELL_KEYS,
      payload: cellKey
   });
}

export const removedCellKeys = cellKey => {
   managedStore.store.dispatch({
      type: REMOVED_CELL_KEYS,
      payload: cellKey
   });
}

export const clearedAllCellKeys = () => {
   managedStore.store.dispatch({
      type: CLEARED_ALL_CELL_KEYS,
   });
}