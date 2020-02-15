/**
 * note that most functions here are very similar to functions in inserNewRow.js
 * common functions have been moved to insertNewAxis.js
 * but these remaining ones are different enough from their Row counterparts that it doesn't
 * seem worthwhile generalizing them further.
 **/
import * as R from 'ramda';
import { updatedTotalColumns, updatedCellKeys, updatedColumnVisibility } from '../actions';
import { createCellKey } from '../helpers/cellHelpers';
import { shouldShowRow } from '../helpers/visibilityHelpers';
import {
	addOneCellReducer,
	addNewCellsToStore,
	addManyCellReducersToStore,
	maybeAddAxisVisibilityEntry,
} from './insertNewAxis';

const makeNewCell = (rowIndex, columnIndex, sheet) => {
	const cellKey = createCellKey(rowIndex, columnIndex);
	return {
		row: rowIndex,
		column: columnIndex,
		content: '',
		visible: shouldShowRow(sheet, cellKey), //(rowVisibility, rowIndex),
	};
};

const insertNewCellKeyInColumn = (rowIndex, columnIndex, newCellKey, cellKeys) =>
	R.pipe(
		createCellKey, // get the cellKey of the element before the spot newCellKey should go
		R.equals,
		R.findIndex(R.__, cellKeys), // find the index of the element before newCellKey
		R.add(1), // R.insert inserts at the point before the given index, so adding 1 to place it after
		R.insert(R.__, newCellKey, cellKeys)
	)(rowIndex, columnIndex - 1);

const addOneCell = (columnIndex, rowIndex, sheet, updates) => {
	const cellKey = createCellKey(rowIndex, columnIndex);
	const cellKeys = insertNewCellKeyInColumn(rowIndex, columnIndex, cellKey, updates.cellKeys);
	const cellReducers = addOneCellReducer(cellKey, rowIndex, columnIndex, updates.cellReducers);
	const cell = makeNewCell(rowIndex, columnIndex, sheet, cellKey);
	const cells = R.append(cell, updates.cells);
	return { cellReducers, cellKeys, cells };
};

const createUpdatesForNewCells = (
	updates, //contains { cellReducers, cellKeys, cells }
	sheet,
	columnIndex,
	totalRows,
	rowIndex = 0
) => {
	if (totalRows === rowIndex) {
		return updates;
	}
	return createUpdatesForNewCells(
		addOneCell(columnIndex, rowIndex, sheet, updates),
		sheet,
		columnIndex,
		totalRows,
		rowIndex + 1
	);
};

const insertNewColumn = (cellKeys, totalRows, totalColumns, sheet) => {
	const updates = createUpdatesForNewCells(
		{ cellKeys: cellKeys, cellReducers: {}, cells: [] },
		sheet,
		totalColumns,
		totalRows
	); // totalColumns, being the count of existing columns, will give us the index of the next column
	updatedCellKeys(updates.cellKeys);
	addManyCellReducersToStore(updates.cellReducers);
	maybeAddAxisVisibilityEntry(totalColumns, sheet.columnVisibility, updatedColumnVisibility);
	addNewCellsToStore(updates.cells);
	updatedTotalColumns(totalColumns + 1);
};

export default insertNewColumn;
