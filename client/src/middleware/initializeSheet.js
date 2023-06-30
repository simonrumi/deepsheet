import * as R from 'ramda';
import { TRIGGERED_FETCH_SHEET, COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';
import { fetchSheet, fetchSheetByUserId, fetchSheetHistory, fetchSheetHistoryByUserId } from '../services/sheetServices';
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
	dbSheet,
   dbCells,
	dbFloatingCells,
   stateIsLoggedIn,
   stateSheetIsCallingDb,
   stateSheetErrorMessage,
	stateCellKeys,
} from '../helpers/dataStructureHelpers';
import { LOG } from '../constants'
import { log } from '../clientLogger';

const initializeCells = R.curry((store, sheetHistory) => {
   if (arrayContainsSomething(dbCells(sheetHistory))) {
      initializeAxesVisibility();

		console.log('initializeSheet--initializeCells will check stateCellKeys(store.getState())', stateCellKeys(store.getState()));

      if (arrayContainsSomething(stateCellKeys(store.getState()))) {
         removeAllCellReducers();
         clearCells(store.getState()); // unclear whether we need this step as well as removeAllCellReducers
         clearedAllCellKeys();
      }

		const sheet = dbSheet(sheetHistory);
		console.log('initializeSheet--initializeCells got sheet', sheet, 'about to createCellReducers');
      createCellReducers(sheet);
		console.log('initializeSheet--initializeCells about to populateCellsInStore');
      populateCellsInStore(sheet);
		console.log('initializeSheet--initializeCells about to applyFilters');
      applyFilters(sheet);
   } else {
		log({ level: LOG.WARN }, 'initializeSheet--initializeCells got no cells data');
   }
	console.log('initializeSheet--initializeCells about to removeAllFloatingCellReducers() & clearedAllFloatingCellKeys()');
	removeAllFloatingCellReducers();
	clearedAllFloatingCellKeys();
	if (arrayContainsSomething(dbFloatingCells(sheetHistory))) {
		console.log('initializeSheet--initializeCells about to fromDbCreateFloatingCellReducers()');
		fromDbCreateFloatingCellReducers(sheetHistory);
		console.log('initializeSheet--initializeCells about to populateFloatingCellsInStore()');
		populateFloatingCellsInStore(sheetHistory);
	}
	// clearedFocus();// this line may be necessary but TIDY if not
});

const runFetchFunctionForId = async ({ sheetId, userId }) => {
   if (isNothing(userId)) {
      throw new Error('userId needed');
   }
	return sheetId ? await fetchSheetHistory(sheetId, userId) : await fetchSheetHistoryByUserId(userId);
   // return sheetId ? await fetchSheet(sheetId, userId) : await fetchSheetByUserId(userId); // TIDY
};

const fetchAndInitializeSheet = async ({ store, sheetId, userId }) => {
	console.log('initializeSheet--fetchAndInitializeSheet got sheetId', sheetId, 'userId', userId);
   if (stateIsLoggedIn(store.getState()) === false) {
      fetchSheetError('Must log in before fetching a sheet');
      return {};
   }
   fetchingSheet({ sheetId, userId });
   try {
		console.log('initializeSheet--fetchAndInitializeSheet about to call runFetchFunctionForId');
      const sheetHistory = await runFetchFunctionForId({ sheetId, userId });
		console.log('initializeSheet--fetchAndInitializeSheet got sheetHistory', sheetHistory, 'will call fetchedSheet next');
      if (isSomething(sheetHistory)) {
			fetchedSheet(sheetHistory);
			console.log('initializeSheet--fetchAndInitializeSheet after calling fetchedSheet, about to call hidePopups');
			hidePopups();
			console.log('initializeSheet--fetchAndInitializeSheet after calling hidePopups, about to call initializeCells');
         initializeCells(store, sheetHistory);
			console.log('initializeSheet--fetchAndInitializeSheet after calling initializeCells, about to call cellsLoaded');
         cellsLoaded();
			console.log('initializeSheet--fetchAndInitializeSheet after calling cellsLoaded, about to call updateCellsInRange');
			updateCellsInRange(false); // false means we want to remove all the cells from the range
			console.log('initializeSheet--fetchAndInitializeSheet after calling updateCellsInRange, about to call clearedCellRange');
			clearedCellRange();
			console.log('initializeSheet--fetchAndInitializeSheet after calling clearedCellRange');
      }
      return sheetHistory;
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
			console.log('initializeSheet--TRIGGERED_FETCH_SHEET got action.payload', action.payload);
         const state = store.getState();
         if (
            stateIsLoggedIn(state) === false ||
            stateSheetIsCallingDb(state) ||
            /status code 401/.test(stateSheetErrorMessage(state))
         ) {
            return null;
         }
         try {
				console.log('initializeSheet--TRIGGERED_FETCH_SHEET baout to call getSheet() which will trigger the async call to db');
            const sheetHistoryResult = await Promise.resolve(getSheet(store, action.payload));
				console.log('initializeSheet--TRIGGERED_FETCH_SHEET got sheetHistoryResult', sheetHistoryResult);
				log({ level: LOG.VERBOSE }, '*** initializeSheet got sheetHistoryResult', sheetHistoryResult);
            if (isNothing(sheetHistoryResult)) {
               fetchSheetError('No sheet history found');
               return;
            }
         } catch (err) {
				log({ level: LOG.ERROR }, 'error fetching sheet history', err);
            fetchSheetError('error fetching sheet history: ' + err);
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