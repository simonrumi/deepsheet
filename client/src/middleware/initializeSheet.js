import * as R from 'ramda';
import { UPDATED_SHEET_ID } from '../actions/fetchSheetTypes';
import { COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';
import { fetchSheet } from '../services/sheetServices';
import { updatedCellKeys } from '../actions/cellActions';
import { fetchedSheet, fetchingSheet, fetchSheetError } from '../actions/fetchSheetActions';
import { createCellReducers, populateCellsInStore } from '../reducers/cellReducers';
import { isSomething } from '../helpers';
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
      R.pipe(
         dbCells,
         orderCells,
         createCellKeys,
         R.tap(data => console.log('initializeCells-createCellKeys returned', data)),
         updatedCellKeys
      )(sheet);
   } else {
      console.warn('WARNING: App.render.initializeCells had no data to operate on');
   }
};

export default store => next => async action => {
   switch (action.type) {
      case UPDATED_SHEET_ID:
         const newSheetId = action.payload;
         fetchingSheet(newSheetId);
         try {
            const sheet = await fetchSheet(newSheetId);
            // if sheet has some data then dispatch the fetchedSheet action
            // note that R.juxt applies the argument sheet to both fns in its array
            R.when(isSomething, R.juxt([R.pipe(fetchedSheet, store.dispatch), initializeCells]))(sheet);
         } catch (err) {
            console.error('failed to fetchSheet', err);
            fetchSheetError(err);
            return {};
         }
         break;

      case COMPLETED_CREATE_SHEET:
         initializeCells(action.payload.sheet);
         break;

      default:
   }
   return next(action);
};
