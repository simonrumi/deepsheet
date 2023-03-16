import * as R from 'ramda';
import managedStore from '../store';
import { 
	UPDATED_FLOATING_CELL,
	ADDED_FLOATING_CELL_KEYS,
	REMOVED_FLOATING_CELL_KEYS,
	CLEARED_ALL_FLOATING_CELL_KEYS, 
	UPDATED_FLOATING_CELL_STARTING_POSITION,
	DELETED_FLOATING_CELL,
	ADDED_FLOATING_CELL,
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

export const addedFloatingCellKeys = floatingCellKey => {
   managedStore.store.dispatch({
      type: ADDED_FLOATING_CELL_KEYS,
      payload: floatingCellKey
   });
}

export const addedFloatingCell = floatingCell => {
   managedStore.store.dispatch({
      type: ADDED_FLOATING_CELL,
      payload: addKeysToBlocks(floatingCell),
   });
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