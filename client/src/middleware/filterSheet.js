import * as R from 'ramda';
import { UPDATED_FILTER, UPDATED_CELL_, UPDATED_COLUMN_VISIBILITY, UPDATED_ROW_VISIBILITY } from '../actions/types';
import { extractRowColFromCellKey, ROW_AXIS, COLUMN_AXIS } from '../helpers';
//import * as RWrap from '../helpers/ramdaWrappers';

/* this is used by a couple of functions below */
const getOppositeAxis = data => R.ifElse(R.isNil, () => ROW_AXIS, () => COLUMN_AXIS)(data.rowIndex);

/* updateOppositeAxisVisibility and related function
 * we will have something like
 * currentOppositeAxisVisibility = {0: true, 1: true, 2: true, 3: false, 4: true};
 * newOppositeAxisVisibility = {0: false, 1: false, 2: true, 3: true, 5: false};
 * ...we need to AND the equivalent values together
 * ....or if a key is present in one but not the other, we need to use the value that is present
 * so in the example above we should get
 * {"0": false, "1": false, "2": true, "3": false, "4": true, "5": false}
 */
const getActionTypeByAxis = axis => (axis === ROW_AXIS ? UPDATED_ROW_VISIBILITY : UPDATED_COLUMN_VISIBILITY);

const uniqueKeys = R.pipe(
	R.concat,
	R.uniq
);

const confirmedBool = (key, obj) => (R.has(key, obj) ? obj[key] : true);

const mergeOldAndNewVisibility = (oldVis, newVis) =>
	R.reduce(
		(accumulator, key) => {
			accumulator[key] = confirmedBool(key, oldVis) && confirmedBool(key, newVis);
			return accumulator;
		},
		{},
		uniqueKeys(R.keys(oldVis), R.keys(newVis))
	);

const updateOppositeAxisVisibility = data => {
	const oppositeAxis = getOppositeAxis(data);
	const oppositeAxisVisibilityName = R.concat(oppositeAxis, 'Visibility'); // will be "rowVisibility" or "columnVisibility"
	const currentOppositeAxisVisibility = data.store.getState().sheet[oppositeAxisVisibilityName];
	const newOppositeAxisVisibility = mergeOldAndNewVisibility(
		currentOppositeAxisVisibility,
		data.newVisibilityForOppositeAxis
	);
	data.store.dispatch({
		type: getActionTypeByAxis(oppositeAxis),
		payload: newOppositeAxisVisibility,
	});
};

/* updateByOppositeAxis and related function updateAllCellsInOppositeAxis
 * Say the user has clicked on a filter icon in a column and entered som filtering data.
 * The opposite Axis - the rows - will have their visibility changed (some will be hidden)
 * these 2 functions look at each cell in each row and update their visibility according
 * to the info in data.newVisibilityForOppositeAxis
 */
const updateAllCellsInOppositeAxis = (newVisibility, index, data) => {
	const storeState = data.store.getState();
	const equalsIndex = num => num === index;

	R.map(cellKey => {
		const axesIndicies = extractRowColFromCellKey(cellKey);

		const dispatchActions = colIndex => {
			const cellState = storeState[cellKey];
			// note: need to AND row's current visibility with newVisibility to get the final visibility for the cell
			// this is because other filters may be acting on the cell, so we can't overwrite visible=false with visible=true
			const newCellState = {
				...cellState,
				visible: cellState.visible && newVisibility,
			};
			// console.log(
			// 	'updateAllCellsInOppositeAxis, cellState.visible = ' +
			// 		cellState.visible +
			// 		', newVisibility = ' +
			// 		newVisibility
			// );
			// console.log('...so newCellState = ', newCellState);
			const updateCellAction = UPDATED_CELL_ + axesIndicies[ROW_AXIS] + '_' + axesIndicies[COLUMN_AXIS];
			data.store.dispatch({
				type: updateCellAction,
				payload: newCellState,
			});
		};

		const oppositeAxisName = getOppositeAxis(data);
		R.when(equalsIndex, dispatchActions, axesIndicies[oppositeAxisName]);

		// the map function wants us to return something, but we're not really interested in the
		// output of the map function, just the dispatching of the actions (by dispatchActions).
		// This is probably not a good functional programming appraoch, because we should really create some kind
		// of object with R.map() and then do something with it...but leaving as-is for now
		return null;
	}, storeState.cellKeys);
};

const updateByOppositeAxis = data => {
	R.forEachObjIndexed((newVisibility, index, obj) => {
		updateAllCellsInOppositeAxis(newVisibility, parseInt(index), data);
	}, data.newVisibilityForOppositeAxis);
	return data;
};

/* getOppositeAxisVisibilityUpdates
 * Say the user clicked on the filtering icon in column C and added some filtering data
 * that filtering is going to mean that some rows (not columns) will be hidden
 * so although the user clicked on a column, it is the opposite axis - the rows - that will have visibility changes
 *
 */
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

/* addCellsFromAxisWithFiltering and related functions
 * Say the user clicked on the filtering icon in column C,
 * addCellsFromAxisWithFiltering gets a list of the cells in that column, ie C1, C2, C3, etc
 * (keep in mind columns and rows are identified by 0-based indecies, so e.g. C2 is cell_1_2)
 */
const getAxis = data => R.ifElse(R.isNil, () => COLUMN_AXIS, () => ROW_AXIS)(data.rowIndex);

const getAxisIndex = data => R.ifElse(R.isNil, () => data.colIndex, () => data.rowIndex)(data.rowIndex);

const getCellsInAxis = (index, storeState, axis) =>
	R.filter(currentCellKey => storeState[currentCellKey][axis] === index, storeState.cellKeys);

const addCellsFromAxisWithFiltering = data =>
	R.mergeAll([
		data,
		{
			cells: getCellsInAxis(getAxisIndex(data), data.store.getState(), getAxis(data)),
		},
	]);

/* getDataFromActionAndStore - creates a data object for passing to subsequent functions in hideFiltered's pipe */
const getDataFromActionAndStore = (actionData, store) => R.mergeAll([actionData, { store }]);

const hideFiltered = R.pipe(
	getDataFromActionAndStore,
	addCellsFromAxisWithFiltering,
	getOppositeAxisVisibilityUpdates,
	updateByOppositeAxis,
	updateOppositeAxisVisibility
);

export default store => next => action => {
	if (!action) {
		return;
	}
	switch (action.type) {
		case UPDATED_FILTER:
			hideFiltered(action.payload, store);
			break;
		default:
		//console.log('in filterSheet but not UPDATED_FILTER');
	}

	return next(action);
};
