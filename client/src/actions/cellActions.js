import * as R from 'ramda';
import managedStore from '../store';
import {
   UPDATED_CELL_,
   UPDATED_CONTENT_OF_CELL_,
   UPDATED_CELL_KEYS,
   POSTING_UPDATED_CELLS,
   COMPLETED_SAVE_CELLS,
   COMPLETED_SAVE_CELL_,
   CELLS_UPDATE_FAILED,
   HAS_ADDED_CELL,
   HAS_CHANGED_CELL,
   HIGHLIGHTED_CELL_,
   UNHIGHLIGHTED_CELL_,
} from './cellTypes';
import { updateCellsMutation } from '../queries/cellMutations';

export const updatedCell = cell => {
   if (R.isNil(cell) || R.not(R.has('content', cell))) {
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

export const updatedCells = async updatedCellsData => {
   managedStore.store.dispatch({ type: POSTING_UPDATED_CELLS });
   try {
      const { sheetId, updatedCells } = updatedCellsData;
      const response = await updateCellsMutation(sheetId, updatedCells);
      managedStore.store.dispatch({
         type: COMPLETED_SAVE_CELLS,
         payload: {
            updatedCells: response.data.updateCells,
            lastUpdated: Date.now(),
         }, //note that "updateCells" is the name of the mutation in cellMutation.js
      });
      R.map(cell => {
         const type = COMPLETED_SAVE_CELL_ + cell.row + '_' + cell.column;
         managedStore.store.dispatch({ type });
         return null; // no return value needed, putting here to clear a warning from the console
      })(updatedCells);
   } catch (err) {
      console.error('did not successfully update the cells in the db: err:', err);
      managedStore.store.dispatch({
         type: CELLS_UPDATE_FAILED,
         payload: { errorMessage: 'cells were not updated in the db: ' + err },
      });
   }
};

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

export const highlightedCell = cellData => {
   managedStore.store.dispatch({
      type: HIGHLIGHTED_CELL_ + cellData.row + '_' + cellData.column,
   });
};

export const unhighlightedCell = cellData => {
   managedStore.store.dispatch({
      type: UNHIGHLIGHTED_CELL_ + cellData.row + '_' + cellData.column,
   });
};
