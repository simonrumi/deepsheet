import * as R from 'ramda';
import { UPDATED_SHEET_ID } from '../actions/fetchSheetTypes';
import { fetchSheet } from '../services/sheetServices';
import { updatedCellKeys } from '../actions/cellActions';
import { fetchedSheet, fetchingSheet, fetchSheetError } from '../actions/fetchSheetActions';
import { createCellReducers, populateCellsInStore } from '../reducers/cellReducers';
import { isSomething } from '../helpers';
import { dbMetadata, dbCells } from '../helpers/dataStructureHelpers';

const createCellKeys = R.map(cell => 'cell_' + cell.row + '_' + cell.column);

const initializeCells = sheet => {
   if (isSomething(dbMetadata(sheet))) {
      createCellReducers(sheet);
      populateCellsInStore(sheet);
      R.pipe(dbCells, createCellKeys, updatedCellKeys)(sheet);
   } else {
      console.warn('WARNING: App.render.initializeCells had no data to operate on');
   }
};

export default store => next => async action => {
   if (!action) {
      return;
   }
   switch (action.type) {
      case UPDATED_SHEET_ID:
         const newSheetId = action.payload;
         fetchingSheet(newSheetId);
         try {
            const sheet = await fetchSheet(newSheetId);
            // if sheet has some data then dispatch the fetchedSheet action
            // note that R.juxt applies the argument sheet to both fns in its array
            R.when(R.pipe(R.isNil, R.not), R.juxt([R.pipe(fetchedSheet, store.dispatch), initializeCells]))(sheet);
         } catch (err) {
            console.error('failed to fetchSheet', err);
            fetchSheetError(err);
            return {};
         }
         break;
      default:
   }
   return next(action);
};
