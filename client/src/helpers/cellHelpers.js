import * as R from 'ramda';
import { indexToColumnLetter, indexToRowNumber, isSomething } from './index';
import {
   cellRow,
   cellColumn,
   cellText,
   cellSubsheetId,
   cellVisible,
   cellRowSetter,
   cellColumnSetter,
   cellTextSetter,
   cellSubsheetIdSetter,
   cellVisibleSetter,
   stateFocus,
} from './dataStructureHelpers';
import { THIN_COLUMN } from '../constants';

export const getCellContent = cell =>
   isSomething(cell) && isSomething(cell.content) && isSomething(cell.content.text) ? cell.content.text : '';

export const createClassNames = (classes, cellHasFocus) => {
   const cellBaseClasses = 'grid-item text-dark-dark-blue ';
   const borderClasses = cellHasFocus ? 'border-2 border-subdued-blue ' : 'border-t border-l ';
   const otherClasses = classes ? classes : '';
   return cellBaseClasses + borderClasses + otherClasses;
};

export const getRowNumFromObj = obj => (R.isNil(obj) ? null : R.has('row') ? obj.row : null);

export const getColNumFromObj = obj => (R.isNil(obj) ? null : R.has('column') ? obj.column : null);

//cellId is e.g. "B2"
export const createCellId = (rowIndex, columnIndex) =>
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

// returns an object with only the cell's fields that are savable in the db
export const getSavableCellData = cell =>
   R.pipe(
      cellRowSetter(cellRow(cell)),
      cellColumnSetter(cellColumn(cell)),
      cellTextSetter(cellText(cell)),
      cellSubsheetIdSetter(cellSubsheetId(cell)),
      cellVisibleSetter(cellVisible(cell))
   )({});

export const isCellFocused = (cell, state) => {
   const currentlyFocused = stateFocus(state);
   return (
      R.hasPath(['cell'], currentlyFocused) &&
      currentlyFocused.cell.row === cell.row &&
      currentlyFocused.cell.column === cell.column
   );
};
