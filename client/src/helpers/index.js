import { map } from 'ramda';
import { updateCell } from '../actions';

export const removePTags = str => {
   return str.replace(/<p>|<\/p>/gi, '');
};

export const indexToColumnLetter = index => {
   let num = index + 1; // counting from 1, A = 1, Z = 26
   const getPlaceValue = (num, placeValues = []) => {
      const BASE = 26;
      let remainder = num % BASE;
      let quotient = Math.floor(num / BASE);
      if (remainder === 0) {
         // quirk of the lettering system is that there is no equivalent of zero
         // ie there is no equivalent of  the decimal "10" because we have "AA"
         // instead of "A0". So these 2 lines do the equivalent of skipping from
         // "9" to "11"
         remainder = BASE;
         quotient = quotient - 1;
      }
      if (quotient === 0) {
         return [remainder, ...placeValues];
      }
      return getPlaceValue(quotient, [remainder, ...placeValues]);
   };
   const placeValues = getPlaceValue(num);

   const UPPERCASE_CODE_OFFSET = 64; // 65 is "A" but we want to add to map to "A"
   const columnLetters = placeValues.reduce((accumulator, currentValue) => {
      return (
         accumulator + String.fromCharCode(currentValue + UPPERCASE_CODE_OFFSET)
      );
   }, '');
   return columnLetters;
};

export const indexToRowNumber = index => {
   return index + 1;
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

export const createCellReducers = (totalRows, totalCols) => {
   const cellReducers = {};
   for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalCols; col++) {
         cellReducers['cell_' + row + '_' + col] = cellReducerFactory(row, col);
      }
   }
   return cellReducers;
};

export const populateCellsInStore = sheet => {
   const getCellsFromRow = row => {
      for (let index in row.columns) {
         updateCell(row.columns[index]);
      }
   };
   map(getCellsFromRow, sheet.rows);
};
