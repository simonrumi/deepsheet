/**
 * note that most functions here are very similar to functions in inserNewColumn.js
 * common functions have been moved to insertNewAxis.js
 * but these remaining ones are different enough from their Column counterparts that it doesn't
 * seem worthwhile generalizing them further.
 **/
import * as R from 'ramda';
import { updatedTotalRows, updatedCellKeys, updatedRowVisibility } from '../actions';
import { createCellKey } from '../helpers/cellHelpers';
import { shouldShowColumn } from '../helpers/visibilityHelpers';
import {
	addOneCellReducer,
	addNewCellsToStore,
	addManyCellReducersToStore,
	maybeAddAxisVisibilityEntry,
} from './insertNewAxis';

const makeNewCell = (rowIndex, columnIndex, columnVisibility) => {
	return {
		row: rowIndex,
		column: columnIndex,
		content: '',
		visible: shouldShowColumn(columnVisibility, columnIndex),
	};
};

const addOneCell = (rowIndex, columnIndex, columnVisibility, updates) => {
	const cellKey = createCellKey(rowIndex, columnIndex);
	const cellKeys = R.append(cellKey, updates.cellKeys);
	const cellReducers = addOneCellReducer(cellKey, rowIndex, columnIndex, updates.cellReducers);
	const cell = makeNewCell(rowIndex, columnIndex, columnVisibility);
	const cells = R.append(cell, updates.cells);
	return { cellReducers, cellKeys, cells };
};

const createUpdatesForNewCells = (
	updates, //contains { cellReducers, cellKeys, cells }
	columnVisibility,
	rowIndex,
	totalColumns,
	columnIndex = 0
) => {
	if (totalColumns === columnIndex) {
		return updates;
	}
	return createUpdatesForNewCells(
		addOneCell(rowIndex, columnIndex, columnVisibility, updates),
		columnVisibility,
		rowIndex,
		totalColumns,
		columnIndex + 1
	);
};

const insertNewRow = (cellKeys, totalRows, totalColumns, sheet) => {
	const updates = createUpdatesForNewCells(
		{ cellKeys: cellKeys, cellReducers: {}, cells: [] },
		sheet.columnVisibility,
		totalRows,
		totalColumns
	); // totalRows, being the count of existing rows, will give us the index of the next row
	updatedCellKeys(updates.cellKeys);
	addManyCellReducersToStore(updates.cellReducers);
	maybeAddAxisVisibilityEntry(totalRows, sheet.rowVisibility, updatedRowVisibility);
	addNewCellsToStore(updates.cells);
	updatedTotalRows(totalRows + 1);
};

export default insertNewRow;