import * as R from 'ramda';
import { TRIGGERED_FETCH_SHEET, COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';
import { fetchSheet, fetchSheetByUserId } from '../services/sheetServices';
import { fetchedSheet, fetchingSheet, fetchSheetError } from '../actions/sheetActions';
import { cellsLoaded, clearedAllCellKeys } from '../actions/cellActions';
import { clearedFocus } from '../actions/focusActions';
import { hidePopups } from '../actions';
import { createCellReducers, populateCellsInStore } from '../reducers/cellReducers';
import { isNothing, isSomething, arrayContainsSomething } from '../helpers';
import { applyFilters, initializeAxesVisibility } from '../helpers/visibilityHelpers';
import { removeAllCellReducers, clearCells } from '../helpers/cellHelpers';
import {
   dbCells,
   stateIsLoggedIn,
   stateSheetIsCallingDb,
   stateSheetErrorMessage,
} from '../helpers/dataStructureHelpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';

const initializeCells = sheet => {
   if (arrayContainsSomething(dbCells(sheet))) {
      initializeAxesVisibility();
      createCellReducers(sheet);
      populateCellsInStore(sheet);
      applyFilters(sheet);
      clearedFocus();
   } else {
      console.warn('WARNING: Missing Data');
   }
};

const runFetchFunctionForId = async ({ sheetId, userId }) => {
   if (isNothing(userId)) {
      throw new Error('userId needed');
   }
   return sheetId ? await fetchSheet(sheetId, userId) : await fetchSheetByUserId(userId);
};

const runFetchSheet = async ({ store, sheetId, userId }) => {
   if (stateIsLoggedIn(store.getState()) === false) {
      fetchSheetError('Must log in before fetching a sheet');
      return {};
   }
   fetchingSheet({ sheetId, userId });
   try {
      const sheet = await runFetchFunctionForId({ sheetId, userId });
      // if sheet has some data then dispatch the fetchedSheet action
      return isNothing(sheet) 
         ? null 
         : R.when(
            isSomething,
            // note that R.juxt applies the argument sheet to all fns in its array
            R.juxt([
               R.pipe(fetchedSheet, store.dispatch), 
               R.pipe(hidePopups, store.dispatch), 
               initializeCells,
               cellsLoaded,
            ])
         )(sheet);
   } catch (err) {
      fetchSheetError(err);
   }
};

const getOrFindSheet = async (store, sheetId) => {
   const { userId } = getUserInfoFromCookie();
   return await runFetchSheet({ store, sheetId, userId });
};

export default store => next => async action => {
   switch (action.type) {
      case TRIGGERED_FETCH_SHEET:
         const state = store.getState();
         if (
            stateIsLoggedIn(state) === false ||
            stateSheetIsCallingDb(state) ||
            /status code 401/.test(stateSheetErrorMessage(state))
         ) {
            return null;
         }
         const sheetResult = await getOrFindSheet(store, action.payload);
         if (isNothing(sheetResult)) {
            fetchSheetError('No sheet found');
            return null;
         }
         break;

      case COMPLETED_CREATE_SHEET:
         // clear out any previous cells and cell reducers before loading the new cells. removeAllCellReducers() must run before clearCells() 
         removeAllCellReducers();
         clearCells(store.getState());
         clearedAllCellKeys();
         initializeCells(action.payload.sheet);
         next(action); // finish with this action before we fire the next
         return;

      default:
   }
   return next(action);
};
