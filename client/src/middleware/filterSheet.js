import * as R from 'ramda';
import { UPDATED_FILTER, UPDATED_CELL_, UPDATED_COLUMN_VISIBILITY, UPDATED_ROW_VISIBILITY } from '../actions/types';
import { extractRowColFromCellKey, ROW_AXIS, COLUMN_AXIS, nothing } from '../helpers';
import { getVisibilityForAxis, getTotalForAxis } from '../helpers/visibilityHelpers';
//import * as RWrap from '../helpers/ramdaWrappers';

/* these are used by multiple functions below */
const getAxis = data => R.ifElse(R.isNil, () => COLUMN_AXIS, () => ROW_AXIS)(data.rowIndex);

const getOppositeAxis = data => R.ifElse(R.isNil, () => ROW_AXIS, () => COLUMN_AXIS)(data.rowIndex);

const getAxisVisibilityName = axis => R.concat(axis, 'Visibility'); // will be "rowVisibility" or "columnVisibility"

const getActionTypeByAxis = axis => (axis === ROW_AXIS ? UPDATED_ROW_VISIBILITY : UPDATED_COLUMN_VISIBILITY);

/*********** new ideas start **********/
//QQQQQQQQ working on this .....e.g. to find if a row should be hidden,
// check the contents of each cell that is in a column with a filter against the filter for that column
const checkEachItemAgainstFilter = (axisName, sheet) => {
	const axisFilters = sheet[R.concat(axisName, 'Filters')];
	console.log('axisName', axisName);
	console.log('axisFilters', axisFilters);
	return R.map(filter => {
		console.log('filter,', filter);
	}, axisFilters);
};

// TODO - building this
// for each axis <filterWholeSheet>
// 	if axisFilters are not empty <applyAllFiltersInAxis>
// 		for each oppositeAxis Item <filterAllItemsInOppositeAxis>
// 			start by setting the axis visibility to true (unhidden) <??>
// 			for each filter in axisFilters <setVisibilityForOppositeAxisItem>
// 				is the cell in the opposite axis hidden by the axis filter? <isCellHiddenByFilter>
// 					if yes - hide the oppositeAxis and stop
//
// TODO NEXT :
// for each cell
// 	cell visibility = row visibility && column visibility
//

const getFilters = (axisName, sheet) => sheet[R.concat(axisName, 'Filters')]; // helper for a couple of fns below

//is the cell in the opposite axis hidden by the axis filter?
const isCellHiddenByFilter = (cell, filter) => {
	// ******** TODO there should be some centralized function to compare cell content to a filter and return true or false
	// it should take into account the regex and case sensitive flags
	const regex = new RegExp(filter.filterExpression);
	return regex.test(cell.content);
};

const createCellKey = (data, oppositeAxisItemIndex, filterIndex) => {
	const rowIndex = getOppositeAxis(data) === ROW_AXIS ? oppositeAxisItemIndex : filterIndex;
	const colIndex = getOppositeAxis(data) === COLUMN_AXIS ? oppositeAxisItemIndex : filterIndex;
	return 'cell_' + rowIndex + '_' + colIndex; // TODO make createCellKey(rowIndex, colIndex) and put in cellHelpers
};

const getVisibilityForCellsInOppositeAxis = (data, itemIndex) =>
	R.mapObjIndexed((filter, filterIndex, axisFilters) => {
		const cellKey = createCellKey(data, itemIndex, filterIndex);
		const cell = data.storeState[cellKey];
		return !isCellHiddenByFilter(cell, filter);
	}, getFilters(getAxis(data), data.storeState.sheet));

const getOppositeAxisVisibilityValue = R.pipe(
	getVisibilityForCellsInOppositeAxis,
	R.values,
	R.reduce((accumulator, isVisible) => accumulator && isVisible, true)
);

const getOppositeAxisVisibilityObj = R.converge(R.prop, [
	R.pipe(
		getOppositeAxis,
		getAxisVisibilityName
	),
	R.path(['storeState', 'sheet']),
]);

const getNewVisibilityForOppositeAxis = R.converge(R.assoc, [
	(data, itemIndex) => itemIndex,
	getOppositeAxisVisibilityValue,
	getOppositeAxisVisibilityObj,
]);

const actionTypeLens = R.lens(R.prop('type'), R.assoc('type'));
const actionPayloadLens = R.lens(R.prop('payload'), R.assoc('payload'));
const makeAction = (type, payload) =>
	R.pipe(
		R.set(actionTypeLens, type),
		R.set(actionPayloadLens, payload)
	)({});

const createOppositeAxisVisibilityUpdateAction = R.converge(makeAction, [
	R.pipe(
		getOppositeAxis,
		getActionTypeByAxis
	),
	getNewVisibilityForOppositeAxis,
]);

// for each filter in axisFilters
const setVisibilityForOppositeAxisItem = (data, itemIndex) =>
	data.store.dispatch(createOppositeAxisVisibilityUpdateAction(data, itemIndex));

// for each oppositeAxis Item
const filterAllItemsInOppositeAxis = R.converge(R.times, [
	data => setVisibilityForOppositeAxisItem(data),
	R.pipe(
		getAxis,
		getTotalForAxis
	),
]);

// if axisFilters are not empty
const applyAllFiltersInAxis = R.curry((data, axis) => {
	console.log('applyAllFiltersInAxis, data = ', data, 'axis = ', axis);
	return R.pipe(
		getFilters,
		R.isEmpty
	)(axis, data.storeState.sheet)
		? nothing()
		: filterAllItemsInOppositeAxis(data);
});

// for each axis
const filterWholeSheet = data => R.map(applyAllFiltersInAxis(data), [getAxis(data), getOppositeAxis(data)]);

/************* new ideas end *********/

/* updateOppositeAxisVisibility and related function
 * TODO - this is no longer correct...update these notes
 * we will have something like
 * currentOppositeAxisVisibility = {0: true, 1: true, 2: true, 3: false, 4: true};
 * newOppositeAxisVisibility = {0: false, 1: false, 2: true, 3: true, 5: false};
 * ...we need to AND the equivalent values together
 * ....or if a key is present in one but not the other, we need to use the value that is present
 * so in the example above we should get
 * {"0": false, "1": false, "2": true, "3": false, "4": true, "5": false}
 */

// const uniqueKeys = R.pipe(
//    R.concat,
//    R.uniq
// );

// const confirmedBool = (key, obj) => (R.has(key, obj) ? obj[key] : true);

// const mergeOldAndNewVisibility = (oldVis, newVis) =>
//    R.reduce(
//       (accumulator, key) => {
//          accumulator[key] =
//             confirmedBool(key, oldVis) && confirmedBool(key, newVis);
//          return accumulator;
//       },
//       {},
//       uniqueKeys(R.keys(oldVis), R.keys(newVis))
//    );

const updateOppositeAxisVisibility = data => {
	const oppositeAxis = getOppositeAxis(data);
	// const oppositeAxisVisibilityName = getAxisVisibilityName(oppositeAxis); // will be "rowVisibility" or "columnVisibility"
	// const currentOppositeAxisVisibility = data.store.getState().sheet[
	//    oppositeAxisVisibilityName
	// ];
	// const newOppositeAxisVisibility = mergeOldAndNewVisibility(
	//    currentOppositeAxisVisibility,
	//    data.newVisibilityForOppositeAxis
	// );
	// console.log(
	//    'updateOppositeAxisVisibility got currentOppositeAxisVisibility',
	//    currentOppositeAxisVisibility
	// );
	// console.log(
	//    '...and data.newVisibilityForOppositeAxis',
	//    data.newVisibilityForOppositeAxis
	// );
	data.store.dispatch({
		type: getActionTypeByAxis(oppositeAxis),
		payload: data.newVisibilityForOppositeAxis, //newOppositeAxisVisibility,
	});
};

/* updateByOppositeAxis and related function updateAllCellsInOppositeAxis
 * Say the user has clicked on a filter icon in a column and entered some filtering data.
 * The opposite Axis - the rows - will have their visibility changed (some will be hidden)
 * these 2 functions look at each cell in each row and update their visibility according
 * to the info in data.newVisibilityForOppositeAxis
 */
const defaultToTrue = bool => (R.isNil(bool) ? true : bool);

const updateAllCellsInOppositeAxis = (newVisibility, index, data) => {
	const storeState = data.store.getState();
	const equalsIndex = num => num === index;

	const thisAxis = getAxis(data);
	// const oppositeAxis = getOppositeAxis(data);
	const thisAxisVisibility = getVisibilityForAxis(thisAxis, storeState.sheet);
	// const thisAxisVisibilityName = getAxisVisibilityName(thisAxis);
	// const oppositeAxisVisibilityName = getAxisVisibilityName(oppositeAxis);
	// const oppositeAxisVisibility = getVisibilityForAxis(
	//    oppositeAxisVisibilityName,
	//    storeState.sheet
	// );

	R.map(cellKey => {
		const axesIndicies = extractRowColFromCellKey(cellKey);

		const dispatchActions = colIndex => {
			const newCellVisibility = defaultToTrue(thisAxisVisibility[axesIndicies[thisAxis]]) && newVisibility;

			const cellState = storeState[cellKey];
			// note: need to AND row's current visibility with newVisibility to get the final visibility for the cell
			// this is because other filters may be acting on the cell, so we can't overwrite visible=false with visible=true
			const newCellState = {
				...cellState,
				visible: newCellVisibility,
			};
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
 * (keep in mind columns and rows are identified by 0-based indicies, so e.g. C2 is cell_1_2)
 */
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
const getDataFromActionAndStore = (actionData, store) =>
	R.mergeAll([actionData, { store }, { storeState: store.getState() }]);

// const hideFiltered = R.pipe(
// 	getDataFromActionAndStore,
// 	R.tap(console.log),
// 	addCellsFromAxisWithFiltering,
// 	getOppositeAxisVisibilityUpdates,
// 	updateByOppositeAxis,
// 	updateOppositeAxisVisibility
// );
const hideFiltered = R.pipe(
	getDataFromActionAndStore,
	filterWholeSheet
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
