import * as R from 'ramda';
import { UPDATED_FILTER, UPDATED_CELL_, UPDATED_COLUMN_VISIBILITY, UPDATED_ROW_VISIBILITY } from '../actions/types';
import { extractRowColFromCellKey } from '../helpers';

export default store => next => action => {
	if (!action) {
		return;
	}
	switch (action.type) {
		case UPDATED_FILTER:
			const storeState = store.getState();
			const columnCells = getCellsInColumn(action.payload.colIndex, storeState);
			const newVisibilityForAllRows = getRowVisibilityFromColumnFilter(
				action.payload.filterExpression,
				action.payload.caseSensitive,
				action.payload.regex,
				columnCells,
				storeState
			);
			hideFilteredRows(newVisibilityForAllRows, store);
			break;
		default:
		//console.log('in filterSheet but not UPDATED_FILTER');
	}

	let result = next(action);
	return result;
};

const getCellsInColumn = (colIndex, storeState) =>
	R.filter(currentCellKey => storeState[currentCellKey].column === colIndex, storeState.cellKeys);

const getRowVisibilityFromColumnFilter = (filterExpression, caseSensitive, isRegex, columnCells, storeState) => {
	const regex = new RegExp(filterExpression);
	const rowVisibility = {};
	for (let i = 0; i < columnCells.length; i++) {
		const currentCell = storeState[columnCells[i]];
		//currentCell.visible = regex.test(currentCell.content);
		rowVisibility[currentCell.row] = regex.test(currentCell.content);
	}
	return rowVisibility;
};

// has side effect (via updateAllCellsInRow)
const hideFilteredRows = (newVisibilityForAllRows, store) => {
	R.forEachObjIndexed((newVisibility, rowIndex, obj) => {
		updateAllCellsInRow(newVisibility, parseInt(rowIndex), store);
	}, newVisibilityForAllRows);

	const currentHiddenRows = store.getState().sheet.hiddenRows;
	const newHiddenRows = { ...currentHiddenRows, ...newVisibilityForAllRows };
	store.dispatch({
		type: UPDATED_ROW_VISIBILITY,
		payload: newHiddenRows,
	});
};

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
			const newCellState = { ...cellState, visible: cellState.visible && newVisibility };
			const updateCellAction = UPDATED_CELL_ + rowCol.row + '_' + rowCol.col;
			store.dispatch({
				type: updateCellAction,
				payload: newCellState,
			});
		};

		R.when(equalsRowIndex, dispatchActions, rowCol.row);
	}, storeState.cellKeys);
};
