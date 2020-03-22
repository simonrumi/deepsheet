import * as R from 'ramda';
import {
   indexToColumnLetter,
   indexToRowNumber,
   isString,
   isObject,
} from './index';
import { THIN_COLUMN } from '../constants';

export const getCellContent = cell =>
   isString(cell.content)
      ? cell.content
      : isObject(cell.content)
      ? cell.content.subContent
      : null;

export const cellBaseClasses = () =>
   'grid-item text-dark-dark-blue border-t border-l ';
export const createClassNames = classes =>
   R.concat(cellBaseClasses(), classes ? classes : '');

export const getRowNumFromObj = obj =>
   R.isNil(obj) ? null : R.has('row') ? obj.row : null;

export const getColNumFromObj = obj =>
   R.isNil(obj) ? null : R.has('column') ? obj.column : null;

//cellId is e.g. "B2"
export const createCellId = (columnIndex, rowIndex) =>
   R.concat(
      indexToColumnLetter(columnIndex),
      R.pipe(
         indexToRowNumber,
         R.toString
      )(rowIndex)
   );

export const createCellKey = (rowIndex, columnIndex) =>
   'cell_' + rowIndex + '_' + columnIndex;

export const renderWholeRowGridSizingStyle = numCols => {
   const rowsStyle = 'repeat(1, 1.5em)';
   const columnsStyle =
      THIN_COLUMN + ' repeat(' + numCols + ', 1fr) ' + THIN_COLUMN;
   return {
      gridTemplateRows: rowsStyle,
      gridTemplateColumns: columnsStyle,
   };
};
