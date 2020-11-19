import * as R from 'ramda';
import managedStore from '../store';
import { isSomething, isNothing } from '../helpers';
import { createUpdatedCellState, createCellKey } from '../helpers/cellHelpers';
import { dbCells } from '../helpers/dataStructureHelpers';
import { updatedCell, addedCellKeys } from '../actions/cellActions';
import {
   UPDATED_CELL,
   UPDATED_CONTENT_OF_CELL,
   POSTING_UPDATED_CELLS,
   COMPLETED_SAVE_CELLS,
   CELLS_UPDATE_FAILED,
   HAS_CHANGED_CELL,
   COMPLETED_SAVE_CELL,
   HAS_ADDED_CELL,
   POSTING_DELETE_SUBSHEET_ID,
   COMPLETED_DELETE_SUBSHEET_ID,
   DELETE_SUBSHEET_ID_FAILED,
   ADDED_CELL_KEYS,
   REMOVED_CELL_KEYS,
   CLEARED_ALL_CELL_KEYS,
} from '../actions/cellTypes';
import { FETCHED_SHEET } from '../actions/sheetTypes';
import { COMPLETED_CREATE_SHEET } from '../actions/sheetTypes';

const cellReducerFactory = (cell, sheetId) => 
   (state = {}, action) => {
      if (!action || !action.type) {
         return state;
      }
      const payloadCell = action.payload;
      if (isNothing(payloadCell) || payloadCell.row !== cell.row || payloadCell.column !== cell.column) {
         return state;
      }

      switch (action.type) {
         case UPDATED_CELL:
            return { ...state, ...payloadCell };
   
         case UPDATED_CONTENT_OF_CELL:
            return { ...state, ...payloadCell, isStale: true };
   
         case COMPLETED_SAVE_CELL:
            return createUpdatedCellState(payloadCell, state, sheetId);
         
         case POSTING_DELETE_SUBSHEET_ID:
            /* action.payload looks like this:
            {
               row, 
               column, 
               content: {
                  text, 
                  subsheetId
               },
               sheetId, 
            } */
            return {
               ...state,
               ...R.dissoc('sheetId', action.payload),
               isStale: true,
               isCallingDb: true,
            };
   
         case COMPLETED_DELETE_SUBSHEET_ID:
            return { ...state, ...payloadCell, isStale: false, isCallingDb: false  };
   
         case DELETE_SUBSHEET_ID_FAILED:
            return { ...state, ...payloadCell, isStale: true, isCallingDb: false  };
   
         default:
            return state;
      }
   }

const cellReducerCreator = thunkifiedCreatorFunc => {
   const store = managedStore.store;
   if (!store || !store.reducerManager) {
      console.error('ERROR: createCellReducers failed as there was no reducerManager');
      return;
   }
   const cellReducers = thunkifiedCreatorFunc();
   const combineNewReducers = store.reducerManager.addMany(cellReducers);
   store.replaceReducer(combineNewReducers);
}

export const createCellReducers = sheet => {
   const thunkifiedCreatorFunc = R.thunkify(
      R.pipe(
         dbCells,
         R.reduce(
            (accumulator, cell) => {
               const cellReducer = cellReducerFactory(cell, sheet.id);
               const cellKey = createCellKey(cell.row, cell.column);
               accumulator[cellKey] = cellReducer;
               return accumulator;
            },
            {}
         )
      )
   )(sheet);
   cellReducerCreator(thunkifiedCreatorFunc);
};

export const addCellReducers = (cells, sheetId) => {
   const thunkifiedCreatorFunc = R.thunkify(
      R.reduce(
         (accumulator, cell) => {
            const cellReducer = cellReducerFactory(cell, sheetId);
            const cellKey = createCellKey(cell.row, cell.column);
            accumulator[cellKey] = cellReducer;
            return accumulator;
         },
         {}
      )
   )(cells);
   cellReducerCreator(thunkifiedCreatorFunc);
}

export const populateCellsInStore = sheet => R.forEach(
   cell => {
      updatedCell(cell);
      R.pipe(
         createCellKey,
         addedCellKeys
      )(cell.row, cell.column);
   }, 
   dbCells(sheet)
);

export const cellDbUpdatesReducer = (state = {}, action) => {
   switch (action.type) {
      case COMPLETED_CREATE_SHEET:
         return {
            ...state,
            isCallingDb: false,
            isStale: false,
            errorMessage: null,
            lastUpdated: Date.now(),
         };

      case FETCHED_SHEET:
         return {
            ...state,
            isCallingDb: false,
            isStale: false,
            errorMessage: null,
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
      case HAS_ADDED_CELL:
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

export const cellKeysReducer = (state = [], action) => {
   switch (action.type) {
      case ADDED_CELL_KEYS:
         return action.payload instanceof Array ? R.concat(state, action.payload) : R.append(action.payload, state);

      case REMOVED_CELL_KEYS:
         return action.payload instanceof Array ? R.without(action.payload, state) : R.without([action.payload], state);

      case CLEARED_ALL_CELL_KEYS:
         return [];

      default:
         return state;

   }
}