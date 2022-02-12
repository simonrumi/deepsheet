import * as R from 'ramda';
import managedStore from '../store';
import {
   indexToColumnLetter,
   indexToRowNumber,
   isSomething,
   arrayContainsSomething,
   compareIndexValues,
   ifThenElse,
} from './index';
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
   stateCellKeys,
   stateCell,
   statePresent,
   stateTotalColumns,
   stateColumnVisibility,
   stateCellsUpdateInfo,
} from './dataStructureHelpers';
import { THIN_COLUMN, ROW_AXIS } from '../constants';

export const getCellContent = cell =>
   isSomething(cell) && isSomething(cell.content) && isSomething(cell.content.text) ? cell.content.text : '';

export const getRowNumFromObj = obj => (R.isNil(obj) ? null : R.has('row') ? obj.row : null);

export const getColNumFromObj = obj => (R.isNil(obj) ? null : R.has('column') ? obj.column : null);

//cellId is e.g. "B2"
export const createCellId = (rowIndex, columnIndex) =>
   R.concat(indexToColumnLetter(columnIndex), R.pipe(indexToRowNumber, R.toString)(rowIndex));

export const createCellKey = R.curry((rowIndex, columnIndex) => 'cell_' + rowIndex + '_' + columnIndex);

const getIndexFromCellKey = (axis, cellKey) => {
   const indexRegex = /cell_(\d+)_(\d+)/i;
   const matchArr = indexRegex.exec(cellKey); // returns e.g. ['cell_1_2', '1', '2'] where 1 is the row index and 2 is the column index
   return axis === ROW_AXIS ? parseInt(matchArr[1]) : parseInt(matchArr[2])
}

export const renderWholeRowGridSizingStyle = numCols => {
   const rowsStyle = 'repeat(1, 1.5em)';
   const columnsStyle = THIN_COLUMN + ' repeat(' + numCols + ', 1fr) ' + THIN_COLUMN;
   return {
      gridTemplateRows: rowsStyle,
      gridTemplateColumns: columnsStyle,
   };
};

// returns an object with only the cell's fields that are savable in the db
export const getSaveableCellData = cell =>
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
      currentlyFocused.cell?.row === cell?.row &&
      currentlyFocused.cell?.column === cell?.column
   );
};

export const getCellFromStore = ({row, column, state}) => R.pipe(
   createCellKey,
   stateCell(state)
)(row, column);

export const clearCells = state => R.pipe(
      stateCellKeys,
      managedStore.store.reducerManager.removeMany
   )(state);

export const getAllCells = state => R.pipe(
      stateCellKeys,
      R.map(cellKey => statePresent(state)[cellKey])
   )(state);

// when the cell reducer needs to update the cell, this creates the new state that the reducer returns
export const createUpdatedCellState = (payloadCell, state, sheetId) => {
   if (R.equals(sheetId, payloadCell.sheetId)) {
      return R.pipe(
            R.dissoc('sheetId'),
            R.append(R.__, [state]),
            R.append({isStale: false}), // at this point we have an array like [state, payloadCellWithoutSheetId, {isStale: false}]
            R.mergeAll //....so we merge all that to make the updated state
         )(payloadCell);
   }
   return state;
}

/***** ordering cells by row then column */
const filterToCurrentRow = R.curry((rowIndex, cells) => R.filter(cell => cell.row === rowIndex)(cells));
const sortByColumns = R.sortBy(cell => cell.column);

/**
 * makes sure at least one cell contains something
 */
const checkCells = cells => {
   if (!arrayContainsSomething(cells)) {
      return false;
   }
   return R.reduce(
      (accumulator, cell) => accumulator || isSomething(cell),
      false,
      cells
   );
}

export const orderCells = R.curry((totalRows, cells) => {
   if (!checkCells(cells)) {
      return [];
   }
   const buildSortedArr = (unsortedCells, sortedCells = [], currentRow = 0) => {
      const cellsSortedSoFar = R.pipe(
         filterToCurrentRow,
         sortByColumns,
         R.concat(sortedCells)
      )(currentRow, unsortedCells);
      return cellsSortedSoFar.length >= cells.length || currentRow >= totalRows 
         ? cellsSortedSoFar
         : buildSortedArr(unsortedCells, cellsSortedSoFar, currentRow + 1);
   };
   return R.pipe(
      R.sortBy(cell => cell.row),
      buildSortedArr
   )(cells);
});
/********/

const getAllCellReducerNames = R.map(cell => createCellKey(cell.row, cell.column))

export const removeAllCellReducers = () => R.pipe(
      managedStore.store.getState,
      getAllCells,
      getAllCellReducerNames,
      managedStore.store.reducerManager.removeMany,
      managedStore.store.replaceReducer
   )();

const getNextVisibleColumn = (columnIndex, goBackwards) => columnVisibilityArr => arrayContainsSomething(columnVisibilityArr)
   ? R.pipe(
      R.sort(compareIndexValues),
      sortedColumnVisibility => goBackwards 
         ? R.pipe(R.slice(0, columnIndex), R.reverse)(sortedColumnVisibility) // get the column indexes lower than the current one we're on, then reverse the order
         : R.slice(columnIndex + 1, Infinity)(sortedColumnVisibility), // get the column indexs higher than the current one we're on
      R.reduce(
         (accumulator, columnVisibility) => columnVisibility.isVisible ? R.reduced(columnVisibility.index) : accumulator, // when we find a visible column, return that index and finish
         columnIndex, // default value is the current column
      )
   )(columnVisibilityArr)
   : goBackwards 
      ? columnIndex === 0
         ? 0 // we're already at the first column, so stay where we are
         : columnIndex - 1
      : columnIndex === (stateTotalColumns(managedStore.state) - 1)
         ? columnIndex // we're already at the last column, so stay where we are
         : columnIndex + 1

export const tabToNextVisibleCell = (rowIndex, columnIndex, goBackwards) => R.pipe(
   stateColumnVisibility,
   getNextVisibleColumn(columnIndex, goBackwards),
   nextColumn => ifThenElse({
      ifCond: nextColumn !== columnIndex,
      thenDo: [
         createCellKey(rowIndex),
         cellKey => statePresent(managedStore.state)[cellKey]
      ],
      elseDo: () => null, // return null indicating that we are staying in the same cell
      params: { thenParams: nextColumn }
   })
)(managedStore.state);

export const haveCellsNeedingUpdate = state => R.pipe(
   stateCellsUpdateInfo,
   arrayContainsSomething,
)(state);
   
// not using this, but keeping since it could be useful
export const getCellKeysInAxis = (axis, axisIndex, state) => R.filter(
   cellKey => getIndexFromCellKey(axis, cellKey) === axisIndex, 
   stateCellKeys(state)
);

export const getCellsFromCellKeys = R.curry(
   (state, cellKeys) => R.map(cellKey => stateCell(state, cellKey), cellKeys)
);

export const encodeText = text => isSomething(text) ? text.replace(/([^a-zA-Z0-9\s])/g, '\\$1') : '';

export const encodeCellText = cell => R.pipe(
      cellText,
      encodeText,
      cellTextSetter(R.__, cell)
   )(cell);

export const decodeText = text => isSomething(text) ? text.replace(/\\/g, '') : '';

export const decodeCellText = cell => R.pipe(
   cellText,
   text => ifThenElse({
      ifCond: isSomething,
      thenDo: [
         decodeText,
         cellTextSetter(R.__, cell),
      ],
      elseDo: R.identity,
      params: { ifParams: text, thenParams: text, elseParams: cell }
   })
)(cell);

export const removeCellFromArray = (cell, arr) => R.filter(
   cellFromArr => cell.row !== cellFromArr.row || cell.column !== cellFromArr.column, 
   arr
);

export const cellsInColumn = ({ state, columnIndex }) =>
   R.reduce(
      (accumulator, cell) => cellColumn(cell) === columnIndex 
         ? [...accumulator, cell] 
         : accumulator,
      [],
      getAllCells(state)
   );

export const cellsInRow = ({ state, rowIndex }) =>
   R.reduce(
      (accumulator, cell) => cellRow(cell) === rowIndex 
         ? [...accumulator, cell] 
         : accumulator,
      [],
      getAllCells(state)
   );

export const prepCellsForDb = cells => R.map(
   R.pipe(
      encodeCellText, 
      R.pick(['row', 'column', 'visible', 'content']) // leave out unnecessary fields, like isStale and __typename
   ), 
   cells // each call to R.pipe will be giving it a cell
);