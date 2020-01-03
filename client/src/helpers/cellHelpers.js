import * as R from 'ramda';
import {
   extractRowColFromCellKey,
   indexToColumnLetter,
   indexToRowNumber,
} from './index';

export const createClassNames = (sheet, cellKey) =>
   R.pipe(
      baseClasses,
      R.curry(addRightBorder)(
         getIsLast(getColNumFromObj, sheet.totalColumns, cellKey)
      ),
      R.curry(addBottomBorder)(
         getIsLast(getRowNumFromObj, sheet.totalRows, cellKey)
      )
   )();
const baseClasses = () => 'grid-item text-dark-dark-blue border-t border-l';

const addRightBorder = (isLastColumn, classes) =>
   isLastColumn ? classes + ' border-r' : classes;

const addBottomBorder = (isLastRow, classes) =>
   isLastRow ? classes + ' border-b' : classes;

const getIsLast = (getNumFromObj, totalColumns, cellKey) =>
   R.pipe(
      extractRowColFromCellKey,
      getNumFromObj,
      isLast(totalColumns)
   )(cellKey);

export const getRowNumFromObj = obj =>
   R.isNil(obj) ? null : R.has('row') ? obj.row : null;

export const getColNumFromObj = obj =>
   R.isNil(obj) ? null : R.has('column') ? obj.column : null;

const isLast = R.curry((total, currentIndex) => total - 1 === currentIndex);

//cellId is e.g. "B2"
export const createCellId = (colIndex, rowIndex) =>
   R.concat(
      indexToColumnLetter(colIndex),
      R.pipe(
         indexToRowNumber,
         R.toString
      )(rowIndex)
   );
