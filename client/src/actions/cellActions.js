import * as R from 'ramda';
import managedStore from '../store';
import {
   UPDATED_CELL,
   UPDATED_CELL_VISIBILITY,
   POSTING_UPDATED_CELLS,
	POSTING_DELETED_CELLS,
   HAS_ADDED_CELL,
   HAS_CHANGED_CELL,
   POSTING_DELETE_SUBSHEET_ID,
   CELLS_LOADED,
   ADDED_CELL_KEYS,
   REMOVED_CELL_KEYS,
   CLEARED_ALL_CELL_KEYS,
   CELLS_REDRAW_COMPLETED,
	UPDATED_END_OF_ROW_CELL,
	COMPLETED_SAVE_CELLS,
	COMPLETED_SAVE_CELL,
	COMPLETED_DELETE_CELLS,
	UPDATE_CELLS_FAILED,
	DELETE_CELLS_FAILED
} from './cellTypes';
import { ADDED_CELL_TO_RANGE, } from './cellRangeTypes';
import { isNothing } from '../helpers';
import { addKeysToBlocks } from '../helpers/cellHelpers';

export const updatedCell = cell => {
   if (isNothing(cell) || R.not(R.has('content', cell))) {
      console.warn('WARNING: updatedCell could not create an action. It received', cell);
      return;
   }

   managedStore.store.dispatch({
      type: UPDATED_CELL,
      payload: addKeysToBlocks(cell),
   });
};

export const updatedCellVisibility = cell => {
   managedStore.store.dispatch({
      type: UPDATED_CELL_VISIBILITY,
      payload: cell,
   });
}
 
export const updatedCellsAction = async ({ sheetId, cells, floatingCells }) => {
   managedStore.store.dispatch({ type: POSTING_UPDATED_CELLS, payload: { sheetId, cells, floatingCells } });
};

export const deletedCellsAction = async ({ sheetId, cells, floatingCells }) => {
   managedStore.store.dispatch({ type: POSTING_DELETED_CELLS, payload: { sheetId, cells, floatingCells } });
};

export const deleteSubsheetId = R.curry(async (row, column, formattedText, subsheetId, sheetId) => {
   managedStore.store.dispatch({
      type: POSTING_DELETE_SUBSHEET_ID,
      payload: {
         row, 
         column, 
         content: {
				formattedText,
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

export const cellsRedrawCompleted = () => {
   managedStore.store.dispatch({
      type: CELLS_REDRAW_COMPLETED,
   });
}

export const addCellToRange = cell => {
   managedStore.store.dispatch({
      type: UPDATED_CELL,
      payload: { ...cell, inCellRange: true },
   });
   managedStore.store.dispatch({
      type: ADDED_CELL_TO_RANGE,
      payload: cell,
   });
}

export const removeCellFromRange = cell => {
   managedStore.store.dispatch({
      type: UPDATED_CELL,
      payload: { ...cell, inCellRange: false },
   });
}

export const updatedEndOfRowCell = isEndOfRowCell => {
	managedStore.store.dispatch({
      type: UPDATED_END_OF_ROW_CELL,
      payload: isEndOfRowCell,
   });
}

export const completedSaveCells = response => {
	managedStore.store.dispatch({
      type: COMPLETED_SAVE_CELLS,
      payload: response,
   });
}

export const completedSaveCell = completedCell => {
	managedStore.store.dispatch({
      type: COMPLETED_SAVE_CELL,
      payload: completedCell, // this includes the sheetId
   });
}

export const completedDeleteCells = response => {
	managedStore.store.dispatch({
      type: COMPLETED_DELETE_CELLS,
      payload: response,
   });
}

export const updateCellsFailed = () => {
	managedStore.store.dispatch({
		type: UPDATE_CELLS_FAILED,
		payload: { errorMessage: 'Could not save updates to cells'}, // don't publish the exact error, err for security reasons
	});
}

export const deleteCellsFailed = () => {
	managedStore.store.dispatch({
		type: DELETE_CELLS_FAILED,
		payload: { errorMessage: 'Could not save the deletion of cells'}, // don't publish the exact error, err for security reasons
	});
}