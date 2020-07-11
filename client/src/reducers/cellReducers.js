import * as R from 'ramda';
import managedStore from '../store';
import { extractRowColFromCellKey, isSomething, isNothing } from '../helpers';
import { dbTotalRows, dbTotalColumns, dbCells } from '../helpers/dataStructureHelpers';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';
import { updatedCell } from '../actions/cellActions';
import {
   UPDATED_CELL_KEYS,
   UPDATED_CELL_,
   UPDATED_CONTENT_OF_CELL_,
   POSTING_UPDATED_CELLS,
   COMPLETED_SAVE_CELLS,
   CELLS_UPDATE_FAILED,
   HAS_CHANGED_CELL,
   COMPLETED_SAVE_CELL_,
} from '../actions/cellTypes';
import { FETCHED_SHEET } from '../actions/fetchSheetTypes';

export const createCellReducers = sheet => {
   const store = managedStore.store;
   const cellReducers = {};
   if (!store || !store.reducerManager) {
      console.error('ERROR: generateCellReducers failed as there was no store.reducerManager');
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
         if (hasUpdatedCell.test(action.type)) {
            return action.payload;
         }
         const hasUpdatedContent = new RegExp(UPDATED_CONTENT_OF_CELL_, 'ig');
         if (hasUpdatedContent.test(action.type)) {
            return {
               ...state,
               content: action.payload.content,
               isStale: action.payload.isStale,
            };
         }
         const completedSaveCell = new RegExp(COMPLETED_SAVE_CELL_, 'ig');
         if (completedSaveCell.test(action.type)) {
            return { ...state, isStale: false };
         }
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
            ...state,
            isCallingDb: false,
            isStale: false,
            errorMessage: null,
            lastUpdated: Date.now(),
         };

      case POSTING_UPDATED_CELLS:
         return {
            ...state,
            isCallingDb: true,
            isStale: true,
            errorMessage: null,
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      case COMPLETED_SAVE_CELLS:
         return {
            ...state,
            isCallingDb: false,
            isStale: false,
            errorMessage: null,
            lastUpdated: action.payload.lastUpdated,
            changedCells: [],
         };

      case CELLS_UPDATE_FAILED:
         return {
            ...state,
            isCallingDb: false,
            isStale: true,
            errorMessage: isSomething(action.payload.errorMessage) ? action.payload.errorMessage : null,
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      case HAS_CHANGED_CELL:
         const changedCells = state.changedCells || [];
         const cellAlreadyInArray = R.find(changedCell => {
            const { row, column } = action.payload;
            return changedCell.row === row && changedCell.column === column;
         }, changedCells);
         if (isNothing(cellAlreadyInArray)) {
            changedCells.push(action.payload);
         }
         return {
            ...state,
            isStale: true,
            changedCells,
         };

      default:
         return state;
   }
};
