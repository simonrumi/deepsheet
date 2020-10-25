import * as R from 'ramda';
import { TRIGGERED_FETCH_SHEET } from '../actions/fetchSheetTypes';
import { COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';
import { fetchSheet, fetchSheetByUserId } from '../services/sheetServices';
import { updatedCellKeys } from '../actions/cellActions';
import { fetchedSheet, fetchingSheet, fetchSheetError } from '../actions/fetchSheetActions';
import { clearedFocus } from '../actions/focusActions';
import { menuHidden } from '../actions/menuActions';
import { createCellReducers, populateCellsInStore } from '../reducers/cellReducers';
import { isNothing, isSomething } from '../helpers';
import { applyFilters } from '../helpers/visibilityHelpers';
import {
   dbMetadata,
   dbCells,
   stateIsLoggedIn,
   stateSheetIsCallingDb,
   stateSheetErrorMessage,
} from '../helpers/dataStructureHelpers';
import { getUserInfoFromCookie } from '../helpers/userHelpers';

/***** ordering cells by row then column */
const filterToCurrentRow = R.curry((rowIndex, cells) => R.filter(cell => cell.row === rowIndex)(cells));
const sortByColumns = R.sortBy(cell => cell.column);

const orderCells = cells => {
   const buildSortedArr = (unsortedCells, sortedCells = [], currentRow = 0) => {
      const cellsSortedSoFar = R.pipe(
         filterToCurrentRow,
         sortByColumns,
         R.concat(sortedCells)
      )(currentRow, unsortedCells);
      return cellsSortedSoFar.length === cells.length
         ? cellsSortedSoFar
         : buildSortedArr(unsortedCells, cellsSortedSoFar, currentRow + 1);
   };
   return R.pipe(
      R.sortBy(cell => cell.row),
      buildSortedArr
   )(cells);
};
/********/

const createCellKeys = R.map(cell => 'cell_' + cell.row + '_' + cell.column);

const initializeCells = sheet => {
   if (isSomething(dbMetadata(sheet))) {
      createCellReducers(sheet);
      populateCellsInStore(sheet);
      R.pipe(dbCells, orderCells, createCellKeys, updatedCellKeys)(sheet);
      applyFilters(sheet);
      clearedFocus();
   } else {
      console.warn('WARNING: App.render.initializeCells had no data to operate on');
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
      R.when(
         isSomething,
         // note that R.juxt applies the argument sheet to all fns in its array
         R.juxt([
            R.pipe(fetchedSheet, store.dispatch), 
            R.pipe(menuHidden, store.dispatch), 
            initializeCells
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
         await getOrFindSheet(store, action.payload);
         break;

      case COMPLETED_CREATE_SHEET:
         initializeCells(action.payload.sheet);
         break;

      default:
   }
   return next(action);
};
