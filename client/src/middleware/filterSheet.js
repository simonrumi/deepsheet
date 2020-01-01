import * as R from 'ramda';
import { UPDATED_FILTER, UPDATED_CELL_, UPDATED_COLUMN_VISIBILITY, UPDATED_ROW_VISIBILITY } from '../actions/types';
import { extractRowColFromCellKey, nothing } from '../helpers';

// has side effect (sends update cell actions)
const updateAllCellsInRow = (newVisibility, rowIndex, store) => {
	const storeState = store.getState();
	const equalsRowIndex = num => num === rowIndex;

	R.map(cellKey => {
		const rowCol = extractRowColFromCellKey(cellKey);

		const dispatchActions = rowIndex => {
			const cellState = storeState[cellKey];
			// note: need to AND row's current visibility with newVisibility to get the final visibility for the cell
			// this is because other filters may be acting on the cell, so we can't overwrite visible=false with visible=true
			const newCellState = {
				...cellState,
				visible: cellState.visible && newVisibility,
			};
			const updateCellAction = UPDATED_CELL_ + rowCol.row + '_' + rowCol.col;
			store.dispatch({
				type: updateCellAction,
				payload: newCellState,
			});
		};

		R.when(equalsRowIndex, dispatchActions, rowCol.row);

		// the map function wants us to return something, but we're not really interested in the
		// output of the map function, just the dispatching of the actions (by dispatchActions).
		// This is not a good functional programming appraoch, because we should really create some kind
		// of object with R.map() and then do something with it...but leaving as-is for now
		return null;
	}, storeState.cellKeys);
};

const updateRowVisibility = data => {
	const currentHiddenRows = data.store.getState().sheet.hiddenRows;
	const newHiddenRows = { ...currentHiddenRows, ...data.newVisibilityForRows };
	data.store.dispatch({
		type: UPDATED_ROW_VISIBILITY,
		payload: newHiddenRows,
	});
};

// TODO this not working
const updateColumnVisibility = data => {
	const currentHiddenColumns = data.store.getState().sheet.hiddenColumns;
	const newHiddenColumns = { ...currentHiddenColumns, ...data.newVisibilityForColumns };
	data.store.dispatch({
		type: UPDATED_COLUMN_VISIBILITY,
		payload: newHiddenColumns,
	});
};

const updateAllRows = data => {
	R.forEachObjIndexed((newVisibility, rowIndex, obj) => {
		updateAllCellsInRow(newVisibility, parseInt(rowIndex), data.store);
	}, data.newVisibilityForRows);
	return data;
};

// TODO this not working
const updateAllColumns = data => {
	R.forEachObjIndexed((newVisibility, colIndex, obj) => {
		updateAllCellsInRow(newVisibility, parseInt(colIndex), data.store);
	}, data.newVisibilityForColumns);
	return data;
};

const getCellsInColumn = (colIndex, storeState) =>
	R.filter(currentCellKey => storeState[currentCellKey].column === colIndex, storeState.cellKeys);

// QQQ new
const getCellsInRow = (rowIndex, storeState) =>
	R.filter(currentCellKey => storeState[currentCellKey].row === rowIndex, storeState.cellKeys);

const getRowVisibilityUpdates = data => {
	const regex = new RegExp(data.filterExpression);
	const storeState = data.store.getState();
	const newVisibilityForRows = R.reduce(
		(accumulator, columnCell) => {
			const currentCell = storeState[columnCell];
			accumulator[currentCell.row] = regex.test(currentCell.content);
			return accumulator;
		},
		{},
		data.columnCells
	);
	return R.mergeAll([data, { newVisibilityForRows }]);
};

// QQQ new
const getColumnVisibilityUpdates = data => {
	const regex = new RegExp(data.filterExpression);
	const storeState = data.store.getState();
	const newVisibilityForColumns = R.reduce(
		(accumulator, rowCell) => {
			const currentCell = storeState[rowCell];
			accumulator[currentCell.column] = regex.test(currentCell.content);
			return accumulator;
		},
		{},
		data.rowCells
	);
	return R.mergeAll([data, { newVisibilityForColumns }]);
};

const addCellsInColumn = data =>
	R.mergeAll([data, { columnCells: getCellsInColumn(data.colIndex, data.store.getState()) }]);

// QQQ new
const addCellsInRow = data => R.mergeAll([data, { rowCells: getCellsInRow(data.rowIndex, data.store.getState()) }]);

const getDataFromActionAndStore = (actionData, store) => R.mergeAll([actionData, { store }]);

// TODO !!! get this going so we can hide the columns
// along the way, create some generic versions of functions from hideFilteredRows
//
const hideFilteredColumns = R.pipe(
	getDataFromActionAndStore,
	addCellsInRow,
	getColumnVisibilityUpdates,
	updateAllColumns,
	R.tap(console.log),
	updateColumnVisibility
);

const hideFilteredRows = R.pipe(
	getDataFromActionAndStore,
	addCellsInColumn,
	getRowVisibilityUpdates,
	updateAllRows,
	R.tap(console.log),
	updateRowVisibility
);

const isTriggeredByRow = filterData => !R.isNil(filterData.rowIndex);
const isTriggeredByColumn = filterData => !R.isNil(filterData.colIndex);

export default store => next => action => {
	if (!action) {
		return;
	}
	switch (action.type) {
		case UPDATED_FILTER:
			const storeState = store.getState();
			R.ifElse(isTriggeredByColumn, hideFilteredRows, hideFilteredColumns)(action.payload, store);
			break;
		default:
		//console.log('in filterSheet but not UPDATED_FILTER');
	}

	return next(action);
};
