import * as R from 'ramda';
import sortColumn from './sortColumn';
import sortRow from './sortRow';
import { getCellContent } from '../helpers/cellHelpers';
import { stateColumnSortByIndex, stateSortType } from '../helpers/dataStructureHelpers';
import { SORT_TYPE_DATES, SORT_TYPE_NUMBERS } from '../constants';

const compareValues = (value1, value2) => {
   if (value1 === value2) {
      return 0;
   }
   return value1 > value2 ? 1 : -1;
}

export const compareCellContent = R.curry((state, cell1, cell2) => {
   const cell1Content = getCellContent(cell1);
   const cell2Content = getCellContent(cell2);
   const sortType = stateSortType(state);
   if (sortType === SORT_TYPE_DATES) {
      const cell1Date = new Date(cell1Content).getTime();
      const cell2Date = new Date(cell2Content).getTime();
      return compareValues(cell1Date, cell2Date);
   }
   if (sortType === SORT_TYPE_NUMBERS) {
      // do our best to get a number from the content string by removing everything that isn't a digit, decimal point or a negative sign
      // this is not foolproof, but better than nothing
      const cell1NumOnly = cell1Content.replace(/[^\d-.]/g, '');
      const cell2NumOnly = cell2Content.replace(/[^\d-.]/g, '');
      return compareValues(Number(cell1NumOnly), Number(cell2NumOnly));
   }
   return compareValues(R.toLower(cell1Content), R.toLower(cell2Content));
});

export const compareCellContentDecreasing = R.curry((state, cell1, cell2) => compareCellContent(state, cell1, cell2) * -1);

export default state => {
   if (typeof stateColumnSortByIndex(state) === 'number') {
      return sortColumn(state);
   }
   return sortRow(state);
};
