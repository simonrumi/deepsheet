import * as R from 'ramda';
import managedStore from '../store';
import { extractRowColFromCellKey } from '../helpers';
import { dbTotalRows, dbTotalColumns } from '../helpers/dataStructureHelpers';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';
import { updatedCell } from '../actions';
import { UPDATED_CELL_KEYS, UPDATED_CELL_, UPDATED_CONTENT_OF_CELL_ } from '../actions/types';

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

export const populateCellsInStore = sheet => {
   const triggerCellActionsForRow = row => {
      R.forEach(cell => updatedCell(cell), row.columns);
   };
   R.forEach(triggerCellActionsForRow, sheet.rows);
};
