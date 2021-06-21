import * as R from 'ramda';
import sortColumn from './sortColumn';
import sortRow from './sortRow';
import { isNothing } from '../helpers';
import { getCellContent } from '../helpers/cellHelpers';
import { stateColumnSortByIndex, stateSortType } from '../helpers/dataStructureHelpers';
import { SORT_TYPE_DATES, SORT_TYPE_NUMBERS } from '../constants';

const compareValues = (value1, value2, isDecreasing) => {
   if (value1 === value2) {
      return 0;
   }
   if (isNothing(value1)) {
      return 1; // whether increasing or decreasing, we want nulls to go to the bottom
   }
   if (isNothing(value2)) {
      return -1; // whether increasing or decreasing, we want nulls to go to the bottom
   }
   return value1 > value2 
      ? isDecreasing ? -1 : 1
      : isDecreasing ? 1 : -1;
}

// do our best to get a number from the content string by removing everything that isn't a digit, decimal point or a negative sign
// this is not foolproof, but better than nothing
const createNumber = text => (isNothing(text) ? null : Number(text.replace(/[^\d-.]/g, '')));

const createDate = text => (isNothing(text) ? null : new Date(text).getTime());

export const compareCellContent = R.curry((state, isDecreasing, cell1, cell2) => {
   const cell1Content = getCellContent(cell1);
   const cell2Content = getCellContent(cell2);
   const sortType = stateSortType(state);
   switch (sortType) {
      case SORT_TYPE_DATES:
         return compareValues(createDate(cell1Content), createDate(cell2Content), isDecreasing);
      
      case SORT_TYPE_NUMBERS:
         return compareValues(createNumber(cell1Content), createNumber(cell2Content), isDecreasing);

      default:
         return compareValues(R.toLower(cell1Content), R.toLower(cell2Content), isDecreasing);
   }
});

export default state => {
   if (typeof stateColumnSortByIndex(state) === 'number') {
      return sortColumn(state);
   }
   return sortRow(state);
};
