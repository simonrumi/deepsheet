import * as R from 'ramda';
import { extractRowColFromCellKey, forLoopReduce } from '../helpers';
import { getCellContent } from '../helpers/cellHelpers';
import { SORT_INCREASING } from '../constants';

// TODO - ZtoA sorting not working - seems to toggle between 2 states

// TODO need to put subContent into cell showing subsheet

const updateCellsPerRowMap = (mapOfChangedRows, state) =>
   R.reduce(
      (accumulator, cellKey) => {
         const { row } = extractRowColFromCellKey(cellKey);
         // the mapOfChangedRows is an array of arrays. Each sub-array is like, e.g. [2,3]
         // where 2 is the original row index and 3 is the index it is moving to
         const currentRowMapping = R.find(
            mappingPair => mappingPair[0] === row
         )(mapOfChangedRows);
         if (currentRowMapping) {
            // take the cell at the old row and give it the new row index
            const newCell = { ...state[cellKey], row: currentRowMapping[1] };
            return [...accumulator, newCell];
         }
         return accumulator;
      },
      [],
      state.cellKeys
   );

const createMapOfChangedRows = (oldCellOrder, newCellOrder) =>
   forLoopReduce(
      (accumulator, index) => {
         if (oldCellOrder[index].row !== newCellOrder[index].row) {
            return [
               ...accumulator,
               [oldCellOrder[index].row, newCellOrder[index].row],
            ];
         }
         return accumulator;
      },
      [],
      oldCellOrder.length
   );

const compareCellContent = (cell1, cell2) => {
   const cell1Content = getCellContent(cell1);
   const cell2Content = getCellContent(cell2);
   console.log(
      'compareCellContent cell1Content',
      cell1Content,
      'cell2Content',
      cell2Content
   );
   if (R.toLower(cell1Content) === R.toLower(cell2Content)) {
      return 0;
   }
   return R.toLower(cell1Content) > R.toLower(cell2Content) ? 1 : -1;
};

const compareCellContentDecreasing = (cell1, cell2) =>
   compareCellContent(cell1, cell2) * -1;

const compareCellRow = (cell1, cell2) => {
   if (cell1.row === cell2.row) {
      return 0;
   }
   return cell1.row > cell2.row ? 1 : -1;
};

// TODO mabye move to cellHelpers
const getCellsInColumn = (indexOfColumnToGet, state) => {
   return R.reduce(
      (accumulator, cellKey) => {
         const { column } = extractRowColFromCellKey(cellKey);
         return column === indexOfColumnToGet
            ? [...accumulator, state[cellKey]]
            : accumulator;
      },
      [],
      state.cellKeys
   );
};

export default state => {
   const cellsInColumn = getCellsInColumn(state.sheet.columnSortByIndex, state);
   // make 100% sure the cells are in row order
   const cellsInColumnOrdered = R.sort(compareCellRow, cellsInColumn);
   const sortFunc =
      state.sheet.columnSortDirection === SORT_INCREASING
         ? compareCellContent
         : compareCellContentDecreasing;
   const newRowOrder = R.sort(sortFunc, cellsInColumnOrdered);
   const mapOfChangedRows = createMapOfChangedRows(
      cellsInColumnOrdered,
      newRowOrder
   );
   return updateCellsPerRowMap(mapOfChangedRows, state);
};
