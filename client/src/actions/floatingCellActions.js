import * as R from 'ramda';
import managedStore from '../store';
import { 
	UPDATED_FLOATING_CELL,
	POSTING_UPDATED_FLOATING_CELLS,
	ADDED_FLOATING_CELL_KEYS,
	REMOVED_FLOATING_CELL_KEYS,
	CLEARED_ALL_FLOATING_CELL_KEYS, 
	UPDATED_FLOATING_CELL_STARTING_POSITION,
	DELETED_FLOATING_CELL,
	ADDED_FLOATING_CELL,
	REPORT_NEW_FLOATING_CELL,
	COMPLETED_SAVE_FLOATING_CELL,
} from './floatingCellTypes';
import { isNothing } from '../helpers';
import { addKeysToBlocks } from '../helpers/cellHelpers'; 
import { LOG } from '../constants';
import { log } from '../clientLogger'

export const updatedFloatingCell = floatingCell => {
	console.log('floatingCellActions--updatedFloatingCell got floatingCell', floatingCell );
	
   if (isNothing(floatingCell) || R.not(R.has('content', floatingCell))) {
		log({ level: LOG.WARN }, 'WARNING: updatedFloatingCell could not create an action. It received', floatingCell);
      return;
   }

   managedStore.store.dispatch({
      type: UPDATED_FLOATING_CELL,
      payload: addKeysToBlocks(floatingCell),
   });
};

export const updatedFloatingCells = async ({ sheetId, floatingCells }) => {
	console.log('floatingCellActions--updatedFloatingCells got sheetId', sheetId, 'floatingCells', floatingCells);
   managedStore.store.dispatch({ type: POSTING_UPDATED_FLOATING_CELLS, payload: { floatingCellsSheetId: sheetId, floatingCells } });
};

// can give this action either a single floating cell key or an array of them
export const addedFloatingCellKeys = floatingCellKeys => {
   managedStore.store.dispatch({
      type: ADDED_FLOATING_CELL_KEYS,
      payload: floatingCellKeys
   });
}

export const addedFloatingCell = floatingCell => {
   managedStore.store.dispatch({
      type: ADDED_FLOATING_CELL,
      payload: addKeysToBlocks(floatingCell),
   });
}

// this action is just for the cellDbUpdates reducer (not for an individual floating cell reducer)
export const reportNewFloatingCellChange = floatingCell => {
	managedStore.store.dispatch({
      type: REPORT_NEW_FLOATING_CELL,
      payload: floatingCell,
   });
}

export const completedSaveFloatingCell = completedFloatingCell => {
	managedStore.store.dispatch({
		type: COMPLETED_SAVE_FLOATING_CELL,
		payload: completedFloatingCell, // this includes the sheetId
	})
}

export const removedFloatingCellKeys = floatingCellKey => { // could be an array of keys or a single key
   managedStore.store.dispatch({
      type: REMOVED_FLOATING_CELL_KEYS,
      payload: floatingCellKey
   });
}

export const clearedAllFloatingCellKeys = () => {
   managedStore.store.dispatch({
      type: CLEARED_ALL_FLOATING_CELL_KEYS,
   });
}

export const updatedFloatingCellStartingPosition = newStartingPosition => {
	managedStore.store.dispatch({
      type: UPDATED_FLOATING_CELL_STARTING_POSITION,
      payload: newStartingPosition
   });
}

export const deletedFloatingCell = floatingCell => {
	managedStore.store.dispatch({
      type: DELETED_FLOATING_CELL,
      payload: floatingCell,
   });
}