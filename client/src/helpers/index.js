import managedStore from '../store';
import { updatedSheetId } from '../actions';

// temp fake data
import mockSheet from '../mockSheet2';
import mockSubSheet from '../mockSubSheet';

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

export const fetchSheet = id => {
   // very temporary - returning fake data
   // real version will need to get this from the database
   if (id === 1) {
      return mockSheet;
   }
   if (id === 2) {
      return mockSubSheet;
   }
};

export const fetchSummaryCellFromSheet = sheetId => {
   // the idea here is to use the database to look up the sheet with the given sheetId and return the content of the
   // cell designated as the summaryCell
   // however for the moment we'll just return some fake data
   if (sheetId === 2) {
      return 'summary of sheet with id 2';
   }
   return null;
};

export const extractRowColFromString = str => {
   // expecting a string like some_prefix_2_3
   //where 2 & 3 are the row and column numbers respectively
   const regex = new RegExp(/.*_(\d+)_(\d+)$/);
   const matchArr = regex.exec(str);
   if (!matchArr || matchArr.length < 3) {
      return;
   }
   const row = parseInt(matchArr[1]);
   const col = parseInt(matchArr[2]);
   return { row, col };
};

export const loadSheet = async sheetId => {
   const newCombinedReducers = managedStore.store.reducerManager.removeMany(
      managedStore.state.cellKeys
   );
   managedStore.store.replaceReducer(newCombinedReducers);
   updatedSheetId(sheetId);
};
