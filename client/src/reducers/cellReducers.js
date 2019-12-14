import { forEach } from 'ramda';
import managedStore from '../store';
import { extractRowColFromCellKey } from '../helpers';
import { updatedCell } from '../actions';
import { UPDATED_CELL_KEYS, UPDATED_CELL_ } from '../actions/types';

export const createCellReducers = sheetMetadata => {
   const store = managedStore.store;
   const cellReducers = {};
   if (!store || !store.reducerManager) {
      console.log(
         'ERROR: generateCellReducers failed as there was no store.reducerManager'
      );
      return;
   }
   for (let row = 0; row < sheetMetadata.totalRows; row++) {
      for (let col = 0; col < sheetMetadata.totalColumns; col++) {
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
      if (action.type.indexOf(UPDATED_CELL_) !== 0) {
         return state;
      }

      const numsFromType = extractRowColFromCellKey(action.type);
      if (
         numsFromType &&
         numsFromType.row === rowNum &&
         numsFromType.col === colNum
      ) {
         return action.payload;
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
      forEach(cell => updatedCell(cell), row.columns);
   };
   forEach(triggerCellActionsForRow, sheet.rows);
};
