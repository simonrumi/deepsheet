import * as R from 'ramda';
import { indexToColumnLetter, indexToRowNumber, isSomething } from './index';
import { THIN_COLUMN } from '../constants';

export const getCellContent = cell =>
   isSomething(cell) && isSomething(cell.content) && isSomething(cell.content.text) ? cell.content.text : '';

export const createClassNames = (classes, isHighlighted) => {
   const cellBaseClasses = 'grid-item text-dark-dark-blue ';
   const borderClasses = isHighlighted ? 'border-2 border-subdued-blue ' : 'border-t border-l ';
   const otherClasses = classes ? classes : '';
   return cellBaseClasses + borderClasses + otherClasses;
};

export const getRowNumFromObj = obj => (R.isNil(obj) ? null : R.has('row') ? obj.row : null);

export const getColNumFromObj = obj => (R.isNil(obj) ? null : R.has('column') ? obj.column : null);

//cellId is e.g. "B2"
export const createCellId = (columnIndex, rowIndex) =>
   R.concat(indexToColumnLetter(columnIndex), R.pipe(indexToRowNumber, R.toString)(rowIndex));

export const createCellKey = (rowIndex, columnIndex) => 'cell_' + rowIndex + '_' + columnIndex;

export const renderWholeRowGridSizingStyle = numCols => {
   const rowsStyle = 'repeat(1, 1.5em)';
   const columnsStyle = THIN_COLUMN + ' repeat(' + numCols + ', 1fr) ' + THIN_COLUMN;
   return {
      gridTemplateRows: rowsStyle,
      gridTemplateColumns: columnsStyle,
   };
};
