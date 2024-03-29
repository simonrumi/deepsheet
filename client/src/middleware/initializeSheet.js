import * as R from 'ramda';
import { TRIGGERED_FETCH_SHEET, COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';
import { fetchSheet, fetchSheetByUserId } from '../services/sheetServices';
import { fetchedSheet, fetchingSheet, fetchSheetError } from '../actions/sheetActions';
import { cellsLoaded, clearedAllCellKeys } from '../actions/cellActions';
import { clearedAllFloatingCellKeys } from '../actions/floatingCellActions';
import { clearedCellRange } from '../actions/cellRangeActions';
import { clearedFocus } from '../actions/focusActions';
import { hidePopups } from '../actions';
import { createCellReducers } from '../reducers/cellReducers';
import { fromDbCreateFloatingCellReducers } from '../reducers/floatingCellReducers';
import { isNothing, isSomething, arrayContainsSomething } from '../helpers';
import { populateCellsInStore } from '../helpers/cellHelpers';
import { populateFloatingCellsInStore } from '../helpers/floatingCellHelpers';
import { applyFilters, initializeAxesVisibility } from '../helpers/visibilityHelpers';
import { updateCellsInRange } from '../helpers/rangeToolHelpers';
import { removeAllCellReducers, clearCells } from '../helpers/cellHelpers';
import { removeAllFloatingCellReducers } from '../helpers/floatingCellHelpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';
import {
   dbCells,
	dbFloatingCells,
   stateIsLoggedIn,
   stateSheetIsCallingDb,
   stateSheetErrorMessage,
	stateCellKeys,
} from '../helpers/dataStructureHelpers';
import { LOG } from '../constants'
import { log } from '../clientLogger';


const initializeCells = R.curry((store, sheet) => {
   if (arrayContainsSomething(dbCells(sheet))) {
      initializeAxesVisibility();

      if (arrayContainsSomething(stateCellKeys(store.getState()))) {
         removeAllCellReducers();
         clearCells(store.getState()); // unclear whether we need this step as well as removeAllCellReducers
         clearedAllCellKeys();
      }

      createCellReducers(sheet);
      populateCellsInStore(sheet);
      applyFilters(sheet);
   } else {
		log({ level: LOG.WARN }, 'initializeSheet--initializeCells got no cells data');
   }
	if (arrayContainsSomething(dbFloatingCells(sheet))) {
		removeAllFloatingCellReducers();
		clearedAllFloatingCellKeys();
		fromDbCreateFloatingCellReducers(sheet);
		populateFloatingCellsInStore(sheet);
	}
	clearedFocus();
});

const runFetchFunctionForId = async ({ sheetId, userId }) => {
   if (isNothing(userId)) {
      throw new Error('userId needed');
   }
   return sheetId ? await fetchSheet(sheetId, userId) : await fetchSheetByUserId(userId);
};

const fetchAndInitializeSheet = async ({ store, sheetId, userId }) => {
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

const getSheet = async (store, sheetId) => {
   const { userId } = getUserInfoFromCookie();
   return await fetchAndInitializeSheet({ store, sheetId, userId });
};

const initializeSheet = store => next => async action => {
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
            const sheetResult = await Promise.resolve(getSheet(store, action.payload));
				log({ level: LOG.VERBOSE }, '*** initializeSheet got sheetResult', sheetResult);
            if (isNothing(sheetResult)) {
               fetchSheetError('No sheet found');
               return;
            }
         } catch (err) {
				log({ level: LOG.ERROR }, 'error fetching sheet', err);
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

export default initializeSheet;