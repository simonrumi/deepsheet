import * as R from 'ramda';
import { TRIGGERED_FETCH_SHEET } from '../actions/fetchSheetTypes';
import { COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';
import { fetchSheet, fetchSheetByUserId } from '../services/sheetServices';
import { updatedCellKeys } from '../actions/cellActions';
import { fetchedSheet, fetchingSheet, fetchSheetError } from '../actions/fetchSheetActions';
import { clearedFocus } from '../actions/focusActions';
import { menuHidden } from '../actions/menuActions';
import { createCellReducers, populateCellsInStore } from '../reducers/cellReducers';
import { isSomething } from '../helpers';
import { applyFilters } from '../helpers/visibilityHelpers';
import { dbMetadata, dbCells } from '../helpers/dataStructureHelpers';
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
   return sheetId ? await fetchSheet(sheetId) : await fetchSheetByUserId(userId);
};

const runFetchSheet = async ({ store, sheetId, userId }) => {
   console.log('runFetchSheet got sheetId', sheetId, 'and userId', userId);
   fetchingSheet({ sheetId, userId });
   console.log('runFetchSheet after calling fetchingSheet({sheetId, userId}), state is', store.getState());
   try {
      const sheet = await runFetchFunctionForId({ sheetId, userId });
      console.log('iniitializeSheet.runFetchFunctionForId got sheet', sheet);
      // if sheet has some data then dispatch the fetchedSheet action
      R.when(
         isSomething,
         // note that R.juxt applies the argument sheet to all fns in its array
         R.juxt([R.pipe(fetchedSheet, store.dispatch), R.pipe(menuHidden, store.dispatch), initializeCells])
      )(sheet);
   } catch (err) {
      console.error('failed to fetchSheet', err);
      fetchSheetError(err);
      return {};
   }
};

const getOrFindSheet = async (store, sheetId) => {
   const { userId } = sheetId ? { userId: null } : getUserInfoFromCookie();
   return await runFetchSheet({ store, sheetId, userId });
};

export default store => next => async action => {
   switch (action.type) {
      case TRIGGERED_FETCH_SHEET:
         console.log('initializeSheet got TRIGGERED_FETCH_SHEET with action.payload', action.payload);
         await getOrFindSheet(store, action.payload);
         break;

      case COMPLETED_CREATE_SHEET:
         initializeCells(action.payload.sheet);
         break;

      default:
   }
   return next(action);
};
