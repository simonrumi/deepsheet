import * as R from 'ramda';
import managedStore from '../store';
import { extractRowColFromCellKey, isSomething } from '../helpers';
import { dbTotalRows, dbTotalColumns, dbCells } from '../helpers/dataStructureHelpers';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';
import { updatedCell } from '../actions/cellActions';
import {
   UPDATED_CELL_KEYS,
   UPDATED_CELL_,
   UPDATED_CONTENT_OF_CELL_,
   POSTING_UPDATED_CELLS,
   COMPLETED_CELLS_UPDATE,
   CELLS_UPDATE_FAILED,
} from '../actions/cellTypes';
import { FETCHED_SHEET } from '../actions/fetchSheetTypes';

export const createCellReducers = sheet => {
   const store = managedStore.store;
   const cellReducers = {};
   if (!store || !store.reducerManager) {
      console.log('ERROR: generateCellReducers failed as there was no store.reducerManager');
      return;
   }
   for (let row = 0; row < dbTotalRows(sheet); row++) {
      for (let col = 0; col < dbTotalColumns(sheet); col++) {
         cellReducers['cell_' + row + '_' + col] = cellReducerFactory(row, col);
      }
   }
   const combineNewReducers = store.reducerManager.addMany(cellReducers);
   store.replaceReducer(combineNewReducers);
};

export const cellReducerFactory = (rowNum, colNum) => {
   return (state = {}, action) => {
      if (!action || !action.type) {
         return state;
      }
      const numsFromType = extractRowColFromCellKey(action.type);
      if (numsFromType && numsFromType[ROW_AXIS] === rowNum && numsFromType[COLUMN_AXIS] === colNum) {
         const hasUpdatedCell = new RegExp(UPDATED_CELL_, 'ig');
         const hasUpdatedContent = new RegExp(UPDATED_CONTENT_OF_CELL_, 'ig');
         return hasUpdatedCell.test(action.type)
            ? action.payload
            : hasUpdatedContent.test(action.type)
            ? {
                 ...state,
                 content: action.payload.content,
                 hasChanged: action.payload.hasChanged,
              }
            : state;
      }
      return state;
   };
};

export const cellKeyReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_CELL_KEYS:
         return action.payload;
      default:
         return state;
   }
};

export const populateCellsInStore = sheet => R.forEach(cell => updatedCell(cell), dbCells(sheet));

export const cellDbUpdatesReducer = (state = {}, action) => {
   switch (action.type) {
      case FETCHED_SHEET:
         return {
            isCallingDb: false,
            isStale: false,
            needsUpdate: false,
            errorMessage: null,
            lastUpdated: Date.now(),
         };

      case POSTING_UPDATED_CELLS:
         return {
            isCallingDb: true,
            isStale: true,
            needsUpdate: true,
            errorMessage: null,
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      case COMPLETED_CELLS_UPDATE:
         return {
            isCallingDb: false,
            isStale: false,
            needsUpdate: false,
            errorMessage: null,
            lastUpdated: action.payload.timestamp,
         };

      case CELLS_UPDATE_FAILED:
         return {
            isCallingDb: false,
            isStale: true,
            needsUpdate: true,
            errorMessage: isSomething(action.payload.errorMessage) ? action.payload.errorMessage : null,
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      default:
         return state;
   }
};
