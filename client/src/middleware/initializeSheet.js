import * as R from 'ramda';
import { TRIGGERED_FETCH_SHEET, COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';
import { fetchSheet, fetchSheetByUserId } from '../services/sheetServices';
import { fetchedSheet, fetchingSheet, fetchSheetError } from '../actions/sheetActions';
import { cellsLoaded, clearedAllCellKeys } from '../actions/cellActions';
import { clearedCellRange } from '../actions/cellRangeActions';
import { clearedFocus } from '../actions/focusActions';
import { hidePopups } from '../actions';
import { createCellReducers, populateCellsInStore } from '../reducers/cellReducers';
import { isNothing, isSomething, arrayContainsSomething } from '../helpers';
import { applyFilters, initializeAxesVisibility } from '../helpers/visibilityHelpers';
import { updateCellsInRange } from '../helpers/rangeToolHelpers';
import { removeAllCellReducers, clearCells } from '../helpers/cellHelpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import {
   dbCells,
   stateIsLoggedIn,
   stateSheetIsCallingDb,
   stateSheetErrorMessage,
	stateCellKeys,
} from '../helpers/dataStructureHelpers';


const initializeCells = R.curry((store, sheet) => {
   if (arrayContainsSomething(dbCells(sheet))) {
      initializeAxesVisibility();

      if (arrayContainsSomething(stateCellKeys(store.getState()))) {
         removeAllCellReducers();
         clearCells(store.getState());
         clearedAllCellKeys();
      }

      createCellReducers(sheet);
      populateCellsInStore(sheet);
      applyFilters(sheet);
      clearedFocus();
   } else {
      console.warn('WARNING: Missing Data');
   }
});

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
      if (isSomething(sheet)) {
         R.pipe(fetchedSheet, store.dispatch)(sheet);
         R.pipe(hidePopups, store.dispatch)();
         initializeCells(store, sheet);
         cellsLoaded();
			updateCellsInRange(false); // false means we want to remove all the cells from the range
			clearedCellRange();
      }
      return sheet;
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
         try {
            const sheetResult = await Promise.resolve(getOrFindSheet(store, action.payload));
            if (isNothing(sheetResult)) {
               fetchSheetError('No sheet found');
               return;
            }
         } catch (err) {
            console.error('error fetching sheet');
            fetchSheetError('error fetching sheet: ' + err);
         }
         return next(action);

      case COMPLETED_CREATE_SHEET:
         // clear out any previous cells, cell reducers, and the cell range, before loading the new cells. 
			// removeAllCellReducers() must run before clearCells()
			// updateCellsInRange & clearedCellRange must run before initializeCells....and probably before removeAllCellReducers but that hasn't been tested
         updateCellsInRange(false); // false means we want to remove all the cells from the range
			clearedCellRange();
			removeAllCellReducers();
         clearCells(store.getState());
         clearedAllCellKeys();
         initializeCells(store, action.payload.sheet);
         return next(action);

      default:
   }
   return next(action);
};
