import * as R from 'ramda';
import managedStore from '../store';
import {
   UPDATED_CELL_,
   UPDATED_CONTENT_OF_CELL_,
   UPDATED_CELL_KEYS,
   POSTING_UPDATED_CELLS,
   COMPLETED_CELLS_UPDATE,
   CELLS_UPDATE_FAILED,
} from './cellTypes';
import { updateCellsInDB } from '../services/sheetServices';

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

// when sending a regular array of cells in the updatedCellData graphQL throws error
// ERROR: Field \"__typename\" is not defined by type \"CellInput\".",

export const updatedCells = updatedCellsData => {
   managedStore.store.dispatch({ type: POSTING_UPDATED_CELLS });
   console.log('cellActions.updatedCells got updatedCellsData', updatedCellsData);
   // updatedCellsData.changedCells.__typename = 'CellInput';  ////this doens't work
   updateCellsInDB(updatedCellsData.sheetId, updatedCellsData.changedCells)
      .then(response => {
         managedStore.store.dispatch({
            type: COMPLETED_CELLS_UPDATE,
            /// TODO  is this the payload we should be sending here?
            payload: {
               text: response.data.updateCells,
               lastUpdated: Date.now(),
            } /* note that "updateCells" is the name of the mutation in cellMutation.js */,
         });
      })
      .catch(err => {
         console.error('did not successfully update the cells in the db: err:', err);
         managedStore.store.dispatch({
            type: CELLS_UPDATE_FAILED,
            payload: { errorMessage: 'cells were not updated in the db: ' + err },
         });
      });
};
