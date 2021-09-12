import * as R from 'ramda';
import managedStore from '../store';
import { getObjectFromArrayByKeyValue, isSomething, forLoopMap } from '.';
import {
    stateColumnWidths,
    stateRowHeights,
    cellRow,
    cellColumn,
 } from './dataStructureHelpers';
 import { orderCells } from './cellHelpers';
import {
    DEFAULT_COLUMN_WIDTH,
    DEFAULT_TOTAL_ROWS,
    DEFAULT_TOTAL_COLUMNS,
    DEFAULT_ROW_HEIGHT,
 } from '../constants';

const getOneCellPerColumn = R.reduce((accumulator, cell) => {
    const existingCellInColumn = getObjectFromArrayByKeyValue('column', cellColumn(cell), accumulator);
    return isSomething(existingCellInColumn) ? accumulator : R.append(cell, accumulator);
}, []);

const getOneCellPerRow = R.reduce((accumulator, cell) => {
    const existingCellInRow = getObjectFromArrayByKeyValue('row', cellRow(cell), accumulator);
    return isSomething(existingCellInRow) ? accumulator : R.append(cell, accumulator);
}, []);

const createColumnWidthItem = ({ oneCellPerColumn, columnIndex }) => R.pipe(
    R.useWith(
        getObjectFromArrayByKeyValue('index'), // the remaining 2 params come from the array below
        [
            R.path([columnIndex, 'column']), //operates on oneCellPerColumn
            stateColumnWidths //operates on managedStore.state
        ]
    ),
    R.prop('size'), // useWith outputs an obejct like { index: 3, size: '144px', }
    R.assoc('size', R.__, { index: columnIndex }) // keep the size property but replace the index with columnIndex, because we're remapping the cellRange to start at cell A1
)(oneCellPerColumn, managedStore.state);

export const createColumnWidths = ({ totalColumns, orderedCellRange }) => {
    const oneCellPerColumn = getOneCellPerColumn(orderedCellRange);
    return forLoopMap(columnIndex =>
        oneCellPerColumn[columnIndex] === undefined
            ? { index: columnIndex, size: DEFAULT_COLUMN_WIDTH }
            : createColumnWidthItem({ oneCellPerColumn, columnIndex }),
            totalColumns
    );
}

const createRowHeightItem = ({ oneCellPerRow, rowIndex }) => R.pipe(
    R.useWith(
        getObjectFromArrayByKeyValue('index'), // the remaining 2 params come from the array below
        [
            R.path([rowIndex, 'row']), //operates on oneCellPerRow
            stateRowHeights //operates on managedStore.state
        ]
    ),
    R.prop('size'), // useWith outputs an obejct like { index: 3, size: '144px', }
    R.assoc('size', R.__, { index: rowIndex }) // keep the size property but replace the index with rowIndex, because we're remapping the cellRange to start at cell A1
)(oneCellPerRow, managedStore.state);

export const createRowHeights = ({ totalRows, orderedCellRange }) => {
    const oneCellPerRow = getOneCellPerRow(orderedCellRange);
    return forLoopMap(rowIndex =>
        oneCellPerRow[rowIndex] === undefined
            ? { index: rowIndex, size: DEFAULT_ROW_HEIGHT }
            : createRowHeightItem({ oneCellPerRow, rowIndex }),
        totalRows
    );
}

export const calculateTotalForColumn = ({ cells }) => {
    const oneCellPerColumn = getOneCellPerColumn(cells);
    return oneCellPerColumn.length > DEFAULT_TOTAL_COLUMNS ? oneCellPerColumn.length : DEFAULT_TOTAL_COLUMNS;
}

export const calculateTotalForRow = ({ cells }) => {
    const oneCellPerRow = getOneCellPerRow(cells);
    return oneCellPerRow.length > DEFAULT_TOTAL_ROWS ? oneCellPerRow.length : DEFAULT_TOTAL_ROWS;
}

export const orderCellsInRange = cellsInRange => R.pipe(
    getOneCellPerRow,
    orderCells(R.__, cellsInRange)
)(cellsInRange);