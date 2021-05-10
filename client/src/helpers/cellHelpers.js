import * as R from 'ramda';
import managedStore from '../store';
import {
   indexToColumnLetter,
   indexToRowNumber,
   isSomething,
   isNothing,
   arrayContainsSomething,
   S,
   toLeft,
   eitherIsSomething,
   compareIndexValues,
   forLoopMap,
} from './index';
import {
   UPDATED_COLUMN_WIDTH,
   UPDATED_ROW_HEIGHT,
   UPDATED_COLUMN_FILTERS,
   UPDATED_ROW_FILTERS,
   UPDATED_COLUMN_VISIBILITY,
   UPDATED_ROW_VISIBILITY,
   UPDATED_TOTAL_COLUMNS,
   UPDATED_TOTAL_ROWS,
   ROW_MOVED,
   COLUMN_MOVED,
} from '../actions/metadataTypes';
import { UPDATED_CELL } from '../actions/cellTypes';
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
import { focusedCell } from '../actions/focusActions';
import { THIN_COLUMN, ROW_AXIS, COLUMN_AXIS } from '../constants';

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

/**
 * The following functions are used to make the final function validateAction which is used in cellReducers.js
 */
const isCellAction = actionEither => {
   return S.isLeft(actionEither) 
      ? actionEither
      : R.pipe(
         R.map(action => 
            isSomething(action?.type) &&
            isSomething(action?.payload?.row) &&
            isSomething(action?.payload?.column)
               ? action
               : 'not a cell action'
         ),
         toLeft(R.includes('not a cell action'))
      )(actionEither);
};

const axisEqual = actionEither => cellEither => axis => S.chain(action => 
   S.map(cell => action.payload[axis] === cell[axis])(cellEither)
   )(actionEither);

const isSameCell = R.curry(
   (action, cell) => S.isLeft(action) 
   ? action
   : S.isLeft(cell)
      ? cell
      : R.pipe(
         S.lift2(S.and) (axisEqual(action)(cell)('column')),
         toLeft(R.not)
      )(axisEqual(action)(cell)('row'))
);

// use: validateAction(S.Right(someAction), S.Right(someCell))
export const validateAction = R.curry((action, cell) => R.pipe(
      R.useWith(isSameCell, [isCellAction, eitherIsSomething]),
      answer => (S.isRight(answer) ? action : answer) // isSameCell will return Right(true) if the action is valid, or a Left if not
   )(action, cell)
);
/* *** end of cell validation functions **** */

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
         ? columnIndex //we're already at the first column so stay where we are
         : columnIndex - 1
      : columnIndex === (stateTotalColumns(managedStore.state) - 1)
         ? columnIndex //we're already at the last column so stay where we are
         : columnIndex + 1

export const tabToNextVisibleCell = (rowIndex, columnIndex, goBackwards) => R.pipe(
   stateColumnVisibility,
   getNextVisibleColumn(columnIndex, goBackwards),
   createCellKey(rowIndex),
   cellKey => statePresent(managedStore.state)[cellKey],
   focusedCell
)(managedStore.state);

export const isCellInRange = (row, column, cellRange) => {
   if (isNothing(cellRange)) {
      return false;
   }

   //  cellRange = {
   //    from: { row: 3, column: 0 },
   //    to: { row: 4, column: 2 }
   // }
   const fromRow = cellRange.from.row < cellRange.to.row ? cellRange.from.row : cellRange.to.row;
   const toRow = cellRange.from.row === fromRow ? cellRange.to.row : cellRange.from.row;
   const fromColumn = cellRange.from.column < cellRange.to.column ? cellRange.from.column : cellRange.to.column;
   const toColumn = cellRange.from.row === fromColumn ? cellRange.to.column : cellRange.from.column;

   return row >= fromRow && row <= toRow && column >= fromColumn && column <= toColumn;
}

export const haveCellsNeedingUpdate = state => R.pipe(
   stateCellsUpdateInfo,
   arrayContainsSomething,
)(state);
   
const getCellKeysInAxis = (axis, axisIndex, state) => R.filter(
   cellKey => getIndexFromCellKey(axis, cellKey) === axisIndex, 
   stateCellKeys(state)
);

// example: given start and end points (6,9) this makes an array [6,7,8]
const makeArrOfIndices = (startingIndex, endingIndex) => forLoopMap(
   index => startingIndex + index, 
   endingIndex - startingIndex
);

const getCellKeysInAddedAxisItems = (axis, oldAxisTotal, newAxisTotal, state) => {
   const indiciesArr = makeArrOfIndices(oldAxisTotal, newAxisTotal);
   return R.reduce(
      (accumulator, index) => R.pipe(
         getCellKeysInAxis, 
         R.concat(accumulator)
      )(axis, index, state), 
      [], 
      indiciesArr
   );
}

export const getCellsFromCellKeys = R.curry((state, cellKeys) => R.map(cellKey => stateCell(state, cellKey), cellKeys));

// TODO doesn't seem like we are using this, so get rid of it if that's the case
const getCellsForChangeType = (state, changeInfo) => {
   const { changeType, data } = changeInfo;
   switch (changeType) {
      /**
       * UPDATED_COLUMN_WIDTH & UPDATED_ROW_HEIGHT are likely not needed as only the grid needs to be re-rendered, not the cells themselves
       * however leaving these here in case this proves useful in future 
       */
      case UPDATED_COLUMN_WIDTH:
         return getCellKeysInAxis(COLUMN_AXIS, data, state); // data == index of the column

      case UPDATED_ROW_HEIGHT:
         return getCellKeysInAxis(ROW_AXIS, data, state); // data == index of the row

      case UPDATED_COLUMN_FILTERS:
         // data == newColumnFilter
         // for now, when the filters are updated, we will say that all cells need to be updated. Could do some optimizaion later
         return getAllCells(state);

      case UPDATED_ROW_FILTERS: 
         // data == newRowFilter
         // for now, when the filters are updated, we will say that all cells need to be updated. Could do some optimizaion later
         return getAllCells(state);

      case UPDATED_COLUMN_VISIBILITY:
         // data == newVisibility
         return getAllCells(state);

      case UPDATED_ROW_VISIBILITY:
         // data == newVisibility
         return getAllCells(state);

      case UPDATED_TOTAL_COLUMNS:
         // data == { oldTotalColumns, newTotalColumns }
         return R.pipe(
            getCellKeysInAddedAxisItems,
            getCellsFromCellKeys(state)
         )(COLUMN_AXIS, data.oldTotalColumns, data.newTotalColumns, state); 

      case UPDATED_TOTAL_ROWS:
         // data == { oldTotalRows, newTotalRows }
         return R.pipe(
            getCellKeysInAddedAxisItems,
            getCellsFromCellKeys(state)
         )(ROW_AXIS, data.oldTotalRows, data.newTotalRows, state);

      case ROW_MOVED:
         // data: { rowMoved, rowMovedTo }
         break;
      case COLUMN_MOVED:
         // data: { columnMoved, columnMovedTo }
         break;
         
      default:
         return getAllCells(state);
   }
}

// TODO remove getCellsToRender & renderChangedCells when sure they are not needed. Note that renderChangedCells was called from Sheet.js
export const getCellsToRender = state => {
   const cellsUpdateInfo = stateCellsUpdateInfo(state);

   if (isSomething(cellsUpdateInfo)) {
      /* if (arrayContainsSomething(cellsUpdateInfo.data) && cellsUpdateInfo.data[0] === ALL_CELLS) {
         return getAllCells(state);
      } */
      const returnVal =  R.reduce(
         (accumulator, changeInfo) => R.pipe(getCellsForChangeType, R.concat(accumulator), R.uniq)(state, changeInfo), 
         [], 
         cellsUpdateInfo
      );
      return returnVal;
   }
   return getAllCells(state); // by default render everything to be safe
} 

export const renderChangedCells = () => {
   const cells = getCellsToRender(managedStore.state);
   R.forEach(cell => managedStore.store.dispatch({ type: UPDATED_CELL, payload: cell }), cells);
}