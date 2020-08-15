import * as R from 'ramda';
import { UPDATED_SHEET_ID } from '../actions/fetchSheetTypes';
import { COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';
import { fetchSheet } from '../services/sheetServices';
import { updatedCellKeys } from '../actions/cellActions';
import { createdSheet } from '../actions/sheetActions';
import { fetchedSheet, fetchingSheet, fetchSheetError } from '../actions/fetchSheetActions';
import { clearedFocus } from '../actions/focusActions';
import { menuHidden } from '../actions/menuActions';
import { createCellReducers, populateCellsInStore } from '../reducers/cellReducers';
import { isSomething, isNothing } from '../helpers';
import { applyFilters } from '../helpers/visibilityHelpers';
import { dbMetadata, dbCells } from '../helpers/dataStructureHelpers';

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

const runFetchSheet = async (store, sheetId) => {
   fetchingSheet(sheetId);
   try {
      const sheet = await fetchSheet(sheetId);
      console.log('iniitializeSheet.runFetchSheet got sheet', sheet);
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

const getOrCreateSheet = async (store, sheetId) => {
   if (isNothing(sheetId)) {
      const sheet = await createdSheet({});
      console.log('initializeSheet.getOrCreateSheet createdSheet', sheet);
      return sheet;
   }
   return await runFetchSheet(store, sheetId);
};

export default store => next => async action => {
   switch (action.type) {
      case UPDATED_SHEET_ID:
         console.log('initializeSheet got UPDATED_SHEET_ID with action.payload', action.payload);
         await getOrCreateSheet(store, action.payload);
         break;

      case COMPLETED_CREATE_SHEET:
         initializeCells(action.payload.sheet);
         break;

      default:
   }
   return next(action);
};
