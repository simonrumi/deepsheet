import { map, reduce, concat } from 'ramda';
import { UPDATED_SHEET_ID } from '../actions/types';
import { fetchSheet } from '../helpers';
import { fetchedSheet, updatedCellKeys } from '../actions';
import {
   createCellReducers,
   populateCellsInStore,
} from '../reducers/cellReducers';

export default store => next => async action => {
   if (!action) {
      console.log('WARNING: initializeSheet received action', action);
      return;
   }
   switch (action.type) {
      case UPDATED_SHEET_ID:
         const newSheetId = action.payload;
         const sheet = await fetchSheet(newSheetId);
         store.dispatch(fetchedSheet(sheet));
         initializeCells(sheet);
         break;
      default:
   }

   let result = next(action);
   //console.log('next state', store.getState());
   return result;
};

const initializeCells = sheet => {
   if (sheet.metadata) {
      createCellReducers(sheet.metadata);
      populateCellsInStore(sheet);
      updatedCellKeys(createCellKeys(sheet.rows));
   } else {
      console.log(
         'WARNING: App.render.initializeCells had no data to operate on'
      );
   }
};

// generates a flat array of all the key names to identify cells in the sheet
const createCellKeys = rows => {
   return reduce(
      (accumulator, row) => {
         const rowOfCells = map(
            cell => 'cell_' + cell.row + '_' + cell.column,
            row.columns
         );
         return concat(accumulator, rowOfCells);
      },
      [], // starting value for accumulator
      rows
   );
};
