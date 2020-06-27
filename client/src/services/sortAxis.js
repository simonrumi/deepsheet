import * as R from 'ramda';
import sortColumn from './sortColumn';
import sortRow from './sortRow';
import { getCellContent } from '../helpers/cellHelpers';
import { stateColumnSortByIndex } from '../helpers/dataStructureHelpers';

export const compareCellContent = (cell1, cell2) => {
   const cell1Content = getCellContent(cell1);
   const cell2Content = getCellContent(cell2);
   if (R.toLower(cell1Content) === R.toLower(cell2Content)) {
      return 0;
   }
   return R.toLower(cell1Content) > R.toLower(cell2Content) ? 1 : -1;
};

export const compareCellContentDecreasing = (cell1, cell2) => compareCellContent(cell1, cell2) * -1;

export default state => {
   if (typeof stateColumnSortByIndex(state) === 'number') {
      return sortColumn(state);
   }
   return sortRow(state);
};
