import { map } from 'ramda';
import { updatedCell } from '../actions';
import managedStore from '../store';

// temp for testing
import { FETCHED_SHEET } from '../actions/types';

export const createCellReducers = sheetMetadata => {
   const store = managedStore.store;
   const cellReducers = {};
   for (let row = 0; row < sheetMetadata.totalRows; row++) {
      for (let col = 0; col < sheetMetadata.totalColumns; col++) {
         cellReducers['cell_' + row + '_' + col] = cellReducerFactory(row, col);
      }
   }
   if (!store || !store.reducerManager) {
      console.log(
         'ERROR: generateCellReducers failed as there was no store.reducerManager'
      );
      return;
   }
   const newCombinedReducer = store.reducerManager.addMany(cellReducers);
   return newCombinedReducer;
};

export const cellReducerFactory = (rowNum, colNum) => {
   return (state = {}, action) => {
      console.log(
         'called cellReducer, rowNum:' + rowNum + ', colNum:' + colNum
      );
      console.log('...state:', state);
      console.log('...action:', action);
      if (!action || !action.type) {
         return state;
      }

      // temp testing
      if (action.type === 'update_one_cell') {
         //|| action.type === FETCHED_SHEET
         return action.payload;
      }
      //  end testing

      // action.type will be something like UPDATE_CELL_r_c where r = row num, c = col num
      const typeRegex = new RegExp(/.*_(\d+)_(\d+)$/);
      const matchArr = typeRegex.exec(action.type);
      if (!matchArr || matchArr.length < 3) {
         return state;
      }
      const typeRowNum = parseInt(matchArr[1]);
      const typeColNum = parseInt(matchArr[2]);
      if (typeRowNum === rowNum && typeColNum === colNum) {
         return action.payload;
      }
      return state;
   };
};

export const populateCellsInStore = sheet => {
   const getCellsFromRow = row => {
      for (let index in row.columns) {
         updatedCell(row.columns[index]);
      }
   };
   map(getCellsFromRow, sheet.rows);
};
