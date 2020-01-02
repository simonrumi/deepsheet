import * as R from 'ramda';
import { UPDATED_FILTER, UPDATED_CELL_, UPDATED_COLUMN_VISIBILITY, UPDATED_ROW_VISIBILITY } from '../actions/types';
import { extractRowColFromCellKey, nothing } from '../helpers';
import * as RWrap from '../helpers/ramdaWrappers';

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

// has side effect (sends update cell actions)
const updateAllCellsInColumn = (newVisibility, colIndex, store) => {
	const storeState = store.getState();
	const equalsRowIndex = num => num === colIndex;

	R.map(cellKey => {
		const rowCol = extractRowColFromCellKey(cellKey);

		const dispatchActions = colIndex => {
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

		R.when(equalsRowIndex, dispatchActions, rowCol.col);

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

const updateAllColumns = data => {
	R.forEachObjIndexed((newVisibility, colIndex, obj) => {
		updateAllCellsInColumn(newVisibility, parseInt(colIndex), data.store);
	}, data.newVisibilityForColumns);
	return data;
};

const updateByAxis = data => {
	R.forEachObjIndexed((newVisibility, index, obj) => {
		// QQQQ TODO need to make updateAllCellsInAxis
		updateAllCellsInColumn(newVisibility, parseInt(index), data.store);
	}, data.newVisibilityForOppositeAxis);
	return data;
};

const getCellsInColumn = (colIndex, storeState) =>
	R.filter(currentCellKey => storeState[currentCellKey].column === colIndex, storeState.cellKeys);

const getCellsInRow = (rowIndex, storeState) =>
	R.filter(currentCellKey => storeState[currentCellKey].row === rowIndex, storeState.cellKeys);

const getCellsInAxis = (index, storeState, axis) =>
	R.filter(currentCellKey => storeState[currentCellKey][axis] === index, storeState.cellKeys);

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

const getOppositeAxis = data => R.ifElse(R.isNil, () => 'row', () => 'column')(data.rowIndex);
const getOppositeAxisVisibilityUpdates = data => {
	const regex = new RegExp(data.filterExpression);
	const storeState = data.store.getState();
	const axis = getOppositeAxis(data);
	const newVisibilityForOppositeAxis = R.reduce(
		(accumulator, cell) => {
			const currentCell = storeState[cell];
			accumulator[currentCell[axis]] = regex.test(currentCell.content);
			return accumulator;
		},
		{},
		data.cells
	);
	return R.mergeAll([data, { newVisibilityForOppositeAxis }]);
};

const addCellsInColumn = data =>
	R.mergeAll([data, { columnCells: getCellsInColumn(data.colIndex, data.store.getState()) }]);

const addCellsInRow = data => R.mergeAll([data, { rowCells: getCellsInRow(data.rowIndex, data.store.getState()) }]);

// TODO: in the process of replacing addCellsInRow with addCellsInAxis
// getAxis works now
// addCellsInAxis may or may not work - perhaps the bug is in the next fucntion, getColumnVisibilityUpdates
// which still needs to be updated to a generic, axis version.
// to reproduce issue, click on a row filter icon and filter by, e.g. "t"
//
// also once this consolidation of functions is completed, then the next issue is that the grid needs to be
// recreated with fewer columns...OR some columns should be made blank
const getAxis = data => R.ifElse(R.isNil, () => 'column', () => 'row')(data.rowIndex);
const getAxisIndex = data => R.ifElse(R.isNil, () => data.columnIndex, () => data.rowIndex)(data.rowIndex);
const addCellsInAxis = data =>
	R.mergeAll([data, { cells: getCellsInAxis(getAxisIndex(data), data.store.getState(), getAxis(data)) }]);

const getDataFromActionAndStore = (actionData, store) => R.mergeAll([actionData, { store }]);

const hideFilteredColumns = R.pipe(
	getDataFromActionAndStore,
	addCellsInAxis,
	//addCellsInRow,
	//getColumnVisibilityUpdates,
	getOppositeAxisVisibilityUpdates,
	//updateAllColumns,
	updateByAxis,
	R.tap(console.log),
	updateColumnVisibility
);

const hideFilteredRows = R.pipe(
	getDataFromActionAndStore,
	addCellsInColumn,
	getRowVisibilityUpdates,
	R.tap(console.log),
	updateAllRows,
	updateRowVisibility
);

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
