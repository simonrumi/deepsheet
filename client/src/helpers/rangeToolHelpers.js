import * as R from 'ramda';
import managedStore from '../store';
import {
   getObjectFromArrayByKeyValue,
   isSomething,
	isNothing,
   forLoopMap,
   reduceWithIndex,
   arrayContainsSomething,
   ifThen,
   ifThenElse,
} from '.';
import { updateSystemClipboard, getCellRangeAsText } from './clipboardHelpers';
import { clearCellRangeHighlight } from './focusHelpers';
import { getUserInfoFromCookie } from './userHelpers';
import { orderCells, createCellKey } from './cellHelpers';
import {
   stateColumnWidths,
   stateRowHeights,
   cellRow,
   cellColumn,
   cellText,
	cellInCellRangeSetter,
   stateSheetId,
   stateRangeWasCopied,
	stateFocusAbortControl,
	stateCellRangeFrom,
	stateCellRangeTo,
	stateCellRangeCells,
	statePresent,
} from './dataStructureHelpers';
import { createdSheet } from '../actions/sheetActions';
import { updatedClipboard } from '../actions/clipboardActions';
import { clearedCellRange, updatedRangeWasCopied, clearListOfCellsInRange } from '../actions/cellRangeActions';
import { updatedCell, addCellToRange, removeCellFromRange } from '../actions/cellActions';
import { DEFAULT_COLUMN_WIDTH, DEFAULT_TOTAL_ROWS, DEFAULT_TOTAL_COLUMNS, DEFAULT_ROW_HEIGHT, LOG } from '../constants';
import { DEFAULT_TITLE_FOR_SUBSHEET_FROM_CELL_RANGE } from '../components/displayText';
import { log } from '../clientLogger';

const getOneCellPerColumn = R.reduce((accumulator, cell) => {
   const existingCellInColumn = getObjectFromArrayByKeyValue('column', cellColumn(cell), accumulator);
   return isSomething(existingCellInColumn) ? accumulator : R.append(cell, accumulator);
}, []);

const getOneCellPerRow = R.reduce((accumulator, cell) => {
   const existingCellInRow = getObjectFromArrayByKeyValue('row', cellRow(cell), accumulator);
   return isSomething(existingCellInRow) ? accumulator : R.append(cell, accumulator);
}, []);

const createColumnWidthItem = ({ oneCellPerColumn, columnIndex }) =>
   R.pipe(
      R.useWith(
         getObjectFromArrayByKeyValue('index'), // the remaining 2 params come from the array below
         [
            R.path([columnIndex, 'column']), //operates on oneCellPerColumn
            stateColumnWidths, //operates on managedStore.state
         ]
      ),
      R.prop('size'), // useWith outputs an obejct like { index: 3, size: '144px', }
      R.assoc('size', R.__, { index: columnIndex }) // keep the size property but replace the index with columnIndex, because we're remapping the cellRange to start at cell A1
   )(oneCellPerColumn, managedStore.state);

// note that here on the client, the columnWidths and the rowHeights are being moved from their original
// range positions to start at cell A1
// however the same transformation of the cells is done on the server
// this is yeechy...it would probably be more in keeping with the thin-server approach to do it all on the client
export const createColumnWidths = ({ totalColumns, orderedCellRange }) => {
   const oneCellPerColumn = getOneCellPerColumn(orderedCellRange);
   return forLoopMap(
      columnIndex =>
         oneCellPerColumn[columnIndex] === undefined
            ? { index: columnIndex, size: DEFAULT_COLUMN_WIDTH }
            : createColumnWidthItem({ oneCellPerColumn, columnIndex }),
      totalColumns
   );
};

const createRowHeightItem = ({ oneCellPerRow, rowIndex }) =>
   R.pipe(
      R.useWith(
         getObjectFromArrayByKeyValue('index'), // the remaining 2 params come from the array below
         [
            R.path([rowIndex, 'row']), //operates on oneCellPerRow
            stateRowHeights, //operates on managedStore.state
         ]
      ),
      R.prop('size'), // useWith outputs an obejct like { index: 3, size: '144px', }
      R.assoc('size', R.__, { index: rowIndex }) // keep the size property but replace the index with rowIndex, because we're remapping the cellRange to start at cell A1
   )(oneCellPerRow, managedStore.state);

export const createRowHeights = ({ totalRows, orderedCellRange }) => {
   const oneCellPerRow = getOneCellPerRow(orderedCellRange);
   return forLoopMap(
      rowIndex =>
         oneCellPerRow[rowIndex] === undefined
            ? { index: rowIndex, size: DEFAULT_ROW_HEIGHT }
            : createRowHeightItem({ oneCellPerRow, rowIndex }),
      totalRows
   );
};

export const calculateTotalForColumn = ({ cells }) => {
   const oneCellPerColumn = getOneCellPerColumn(cells);
   return oneCellPerColumn.length > DEFAULT_TOTAL_COLUMNS ? oneCellPerColumn.length : DEFAULT_TOTAL_COLUMNS;
};

export const calculateTotalForRow = ({ cells }) => {
   const oneCellPerRow = getOneCellPerRow(cells);
   return oneCellPerRow.length > DEFAULT_TOTAL_ROWS ? oneCellPerRow.length : DEFAULT_TOTAL_ROWS;
};

export const orderCellsInRange = cellsInRange => R.pipe(getOneCellPerRow, orderCells(R.__, cellsInRange))(cellsInRange);

export const compareCellsArrays = (cellRange1, cellRange2) => {
   if (
      !arrayContainsSomething(cellRange1) ||
      !arrayContainsSomething(cellRange2) ||
      cellRange1.length !== cellRange2.length
   ) {
      return false;
   }
   const cellRange1Ordered = orderCellsInRange(cellRange1);
   const cellRange2Ordered = orderCellsInRange(cellRange2);
   return reduceWithIndex(
      (accumulator, cellRange1Cell, index) =>
         cellRow(cellRange2Ordered[index]) === cellRow(cellRange1Cell) &&
         cellColumn(cellRange2Ordered[index]) === cellColumn(cellRange1Cell) &&
         cellText(cellRange2Ordered[index]) === cellText(cellRange1Cell) &&
         accumulator,
      true,
      cellRange1Ordered
   );
};

export const triggerCreatedSheetAction = ({ cellRange }) => {
   const rows = calculateTotalForRow({ cells: cellRange.cells });
   const columns = calculateTotalForColumn({ cells: cellRange.cells });
   const orderedCells = orderCellsInRange(cellRange.cells);
   const title = DEFAULT_TITLE_FOR_SUBSHEET_FROM_CELL_RANGE;
   const parentSheetId = stateSheetId(managedStore.state);
   const parentSheetCell = orderedCells[0];
   const rowHeights = createRowHeights({ totalRows: rows, orderedCellRange: orderedCells });
   const columnWidths = createColumnWidths({ totalColumns: columns, orderedCellRange: orderedCells });
   const { userId } = getUserInfoFromCookie();
   createdSheet({
      rows,
      columns,
      title,
      parentSheetId,
      parentSheetCell,
      rowHeights,
      columnWidths,
      userId,
      cellRange: orderedCells,
   });
};

export const copyRange = () => {
   const allTextInRange = getCellRangeAsText();
   updatedClipboard({ text: allTextInRange });
   updateSystemClipboard(allTextInRange);
   updatedRangeWasCopied(true);
};

export const clearRangeHighlight = () =>
   ifThenElse({
      ifCond: stateRangeWasCopied,
      thenDo: clearCellRangeHighlight,
      elseDo: [ updateCellsInRange, clearedCellRange ],
      params: { ifParams: managedStore.state, elseParams: false },
   });

export const maybeAbortFocus = () => ifThen({
   ifCond: R.pipe(
      R.tap(data => console.log('rangeToolHelpers--maybeAbortFocus ifCond got the param', data)),
      stateFocusAbortControl,
		R.tap(data => console.log('rangeToolHelpers--maybeAbortFocus ifCond after stateFocusAbortControl got', data)),
      isSomething
   ),
   thenDo: [stateFocusAbortControl, abortControl => abortControl.abort()],
   params: { ifParams: managedStore.state, thenParams: managedStore.state },
});

export const isRowDirectionForward = (fromCell, toCell) => cellRow(fromCell) <= cellRow(toCell);
export const isColumnDirectionForward = (fromCell, toCell) => cellColumn(fromCell) <= cellColumn(toCell);

export const orderFromAndToAxes = (fromCell, toCell) => {
	// if the 'from' cell comes after the 'to' cell, then we will swap what we're calling from and to 
	const rowDirectionForward = isRowDirectionForward(fromCell, toCell);
	const columnDirectionForward = isColumnDirectionForward(fromCell, toCell);
	return {
		 fromRow: rowDirectionForward ? fromCell.row : toCell.row,
		 toRow: rowDirectionForward ? toCell.row : fromCell.row,
		 fromColumn: columnDirectionForward ? fromCell.column : toCell.column,
		 toColumn: columnDirectionForward ? toCell.column : fromCell.column,
	} 
}

const clearPriorCellRange = () => {
	const priorCells = stateCellRangeCells(managedStore.state);
	ifThen({
      ifCond: arrayContainsSomething,
      thenDo: R.forEach(cell => R.pipe(cellInCellRangeSetter, updatedCell)(false, cell)),
      params: { ifParams: [priorCells], thenParams: [priorCells] },
   });
	clearListOfCellsInRange();
}

export const updateCellsInRange = addingCells => {
	console.log('rangeToolHelpers--updateCellsInRange got addingCells', addingCells);

	const fromCell = stateCellRangeFrom(managedStore.state);
	const toCell = stateCellRangeTo(managedStore.state);
	if (isNothing(fromCell) || isNothing(toCell)) {
		return;
	}

	clearPriorCellRange();
	
	const { fromRow, toRow, fromColumn, toColumn } = orderFromAndToAxes(fromCell, toCell);
	if (isNothing(fromRow) || isNothing(toRow) || isNothing(fromColumn) || isNothing(toColumn)) {
		// this should never happen
		log({ level: LOG.ERROR }, 'rangeToolHelpers--updateCellsInRange cannot proceed because it got fromRow', fromRow, 'toRow', toRow, 'fromColumn', fromColumn, 'toColumn', toColumn);
		return;
	}

	const listCellsInRow = R.curry((row, column) => {
		if (column >= fromColumn && column <= toColumn) {
			const cellKey = createCellKey(row, column);
			const cell = statePresent(managedStore.state)[cellKey];
			addingCells ? addCellToRange(cell) : removeCellFromRange(cell);
			listCellsInRow(row, ++column, fromColumn, toColumn);
		}
	});

	const listCellsInRange = row => ifThen({
		ifCond: row <= toRow,
		thenDo: [
			() => listCellsInRow(row, fromColumn),
			() => listCellsInRange(row + 1)
		],
		params: {}
	});
	listCellsInRange(fromRow);
}
