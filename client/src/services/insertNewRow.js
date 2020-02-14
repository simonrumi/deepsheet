import * as R from 'ramda';
import managedStore from '../store';
import { updatedTotalRows, updatedCellKeys, updatedCell, updatedRowVisibility } from '../actions';
import { cellReducerFactory } from '../reducers/cellReducers';
import { COLUMN_AXIS } from '../helpers';
import { createCellKey } from '../helpers/cellHelpers';
import { shouldShowColumn, getAxisVisibilityName } from '../helpers/visibilityHelpers';

const makeNewCell = (rowIndex, columnIndex, columnVisibility) => {
	return {
		row: rowIndex,
		column: columnIndex,
		content: '',
		visible: shouldShowColumn(columnVisibility, columnIndex), // getVisibilityForColumn(columnIndex),
	};
};

const maybeAddRowVisibilityEntry = (rowIndex, rowVisibilityObj) =>
	R.when(
		R.both(
			// rowVisibilityObj is not empty and...
			R.pipe(
				R.isEmpty,
				R.not
			),
			// rowVisibilityObj doesn't have an entry for the row we're adding
			R.pipe(
				R.has(rowIndex),
				R.not
			)
		),
		R.pipe(
			R.thunkify(R.assoc)(rowIndex, true, {}), // make an object like {3: true} (where 3 is the value of totalRows)
			updatedRowVisibility // add that object into the rowVisibility object
		)
	)(rowVisibilityObj);

const addManyCellReducersToStore = cellReducers => {
	const combineNewReducers = managedStore.store.reducerManager.addMany(cellReducers);
	managedStore.store.replaceReducer(combineNewReducers);
};

// returns copy of cellReducers with and added cellReducer
const addOneCellReducer = (cellKey, row, column, cellReducers = {}) =>
	R.pipe(
		cellReducerFactory,
		R.assoc(cellKey, R.__, cellReducers)
	)(row, column);

const addOneCell = (rowIndex, columnIndex, columnVisibility, updates) => {
	const cellKey = createCellKey(rowIndex, columnIndex);
	const cellKeys = R.append(cellKey, updates.cellKeys);
	const cellReducers = addOneCellReducer(cellKey, rowIndex, columnIndex, updates.cellReducers);
	const cell = makeNewCell(rowIndex, columnIndex, columnVisibility);
	const cells = R.append(cell, updates.cells);
	return { cellReducers, cellKeys, cells };
};

const addNewCellsToStore = cells => R.map(cell => updatedCell(cell), cells);

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

const insertNewRow = (cellKeys, totalRows, totalColumns, rowVisibility, columnVisibility) => {
	const updates = createUpdatesForNewCells(
		{ cellKeys: cellKeys, cellReducers: {}, cells: [] },
		columnVisibility,
		totalRows,
		totalColumns
	); // totalRows, being the count of existing rows, will give us the index of the next row
	updatedCellKeys(updates.cellKeys);
	addManyCellReducersToStore(updates.cellReducers);
	maybeAddRowVisibilityEntry(totalRows, rowVisibility);
	addNewCellsToStore(updates.cells);
	updatedTotalRows(totalRows + 1);
};

export default insertNewRow;
