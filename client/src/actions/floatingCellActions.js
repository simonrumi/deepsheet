import * as R from 'ramda';
import managedStore from '../store';
import { 
	UPDATED_FLOATING_CELL,
	ADDED_FLOATING_CELL_KEYS,
	REMOVED_FLOATING_CELL_KEYS,
	CLEARED_ALL_FLOATING_CELL_KEYS, 
} from './floatingCellTypes';
import { isNothing } from '../helpers';
import { addKeysToBlocks } from '../helpers/cellHelpers'; 
import { LOG } from '../constants';
import { log } from '../clientLogger'

export const updatedFloatingCell = floatingCell => {
	console.log('floatingCellActions--updatedFloatingCell got floatingCell', floatingCell );
	
   if (isNothing(floatingCell) || R.not(R.has('content', floatingCell))) {
		log({ level: LOG.WARN }, 'WARNING: updatedCell could not create an action. It received', floatingCell);
      return;
   }

   managedStore.store.dispatch({
      type: UPDATED_FLOATING_CELL,
      payload: addKeysToBlocks(floatingCell),
   });
};

export const addedFloatingCellKeys = floatingCellKey => {
	console.log('floatingCellActions--addedFloatingCellKeys got floatingCellKey', floatingCellKey );
   managedStore.store.dispatch({
      type: ADDED_FLOATING_CELL_KEYS,
      payload: floatingCellKey
   });
}

export const removedFloatingCellKeys = floatingCellKey => {
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