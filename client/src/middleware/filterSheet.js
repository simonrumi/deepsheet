import * as R from 'ramda';
import { UPDATED_COLUMN_VISIBILITY, UPDATED_ROW_VISIBILITY, HIDE_FILTERED } from '../actions/types';
import { updatedColumnFilters, updatedRowFilters } from '../actions';
import { ROW_AXIS, COLUMN_AXIS } from '../helpers';
import { getTotalForAxis } from '../helpers/visibilityHelpers';
import { updatedCell } from '../actions';

/* these are used by multiple functions below */
const getAxis = data => R.ifElse(R.isNil, () => COLUMN_AXIS, () => ROW_AXIS)(data.rowIndex);

const getOppositeAxis = data => R.ifElse(R.isNil, () => ROW_AXIS, () => COLUMN_AXIS)(data.rowIndex);

const getOtherAxis = axis => (axis === ROW_AXIS ? COLUMN_AXIS : ROW_AXIS);

const getAxisVisibilityName = axis => R.concat(axis, 'Visibility'); // will be "rowVisibility" or "columnVisibility"

const getActionTypeByAxis = axis => (axis === ROW_AXIS ? UPDATED_ROW_VISIBILITY : UPDATED_COLUMN_VISIBILITY);

const getStateFromData = data => R.path(['store', 'getState'], data)();

const getSheetFromData = R.pipe(
	getStateFromData,
	R.prop('sheet')
);

const getFilters = (axisName, sheet) => sheet[R.concat(axisName, 'Filters')]; // helper for a couple of fns below

// TODO take into account the regex and case sensitive flags
const isCellShownByFilter = R.curry((cell, filter) => {
	const regex = new RegExp(filter.filterExpression);
	return regex.test(cell.content);
});

const createCellKey = (data, axis, itemIndex, otherAxisIndex) => {
	const rowIndex = axis === ROW_AXIS ? itemIndex : otherAxisIndex;
	const colIndex = axis === COLUMN_AXIS ? itemIndex : otherAxisIndex;
	const cellKey = 'cell_' + rowIndex + '_' + colIndex;
	return cellKey; // TODO make createCellKey(rowIndex, colIndex) and put in cellHelpers
};

const getCellFromDataAndCellKey = R.curry((data, cellKey) => R.prop(cellKey, getStateFromData(data)));

const getCellFromDataAxisAndIndicies = (data, axis, itemIndex, otherAxisIndex) =>
	R.pipe(
		createCellKey,
		getCellFromDataAndCellKey(data)
	)(data, axis, itemIndex, otherAxisIndex);

const getVisibilityForCellsInAxisItem = (data, axis, itemIndex) => {
	// if we have no filters that is the same as saying every cell should be visible,
	// so we can return an object  like
	// { 0: true }
	// which says just one column/row is visible,
	// and this will be reduced in getAxisVisibilityValue to a single true value for the whole row or column

	// also note R.mapObjIndexed sends its 1st argument, a function, the parameters (value, key, obj),
	// but we're not using the obj

	const filters = getFilters(getOtherAxis(axis), getSheetFromData(data));
	return R.ifElse(
		R.isNil,
		() => R.identity({ 0: true }),
		filters =>
			R.mapObjIndexed((filter, filterIndex) =>
				R.pipe(
					getCellFromDataAxisAndIndicies,
					isCellShownByFilter(R.__, filter)
				)(data, axis, itemIndex, filterIndex)
			)(filters) // here, in the onFalse Fn, filters is the object to map over
	)(filters); // filters obj is given to all 3 ifElse Fns - condition, onTrue and onFalse
};

// receives (data, axis, itemIndex)
const getAxisVisibilityValue = R.pipe(
	getVisibilityForCellsInAxisItem,
	R.values,
	R.reduce((accumulator, isVisible) => accumulator && isVisible, true)
);

const getAxisVisibilityObj = R.converge(R.prop, [R.flip(getAxisVisibilityName), getSheetFromData]); // receives (data, axis, itemIndex)

// receives (data, axis, itemIndex)
const getNewVisibilityForAxisItem = R.converge(R.assoc, [
	(data, axis, itemIndex) => itemIndex,
	getAxisVisibilityValue,
	getAxisVisibilityObj,
]);

const actionTypeLens = R.lens(R.prop('type'), R.assoc('type'));
const actionPayloadLens = R.lens(R.prop('payload'), R.assoc('payload'));
const makeAction = (type, payload) =>
	R.pipe(
		R.set(actionTypeLens, type),
		R.set(actionPayloadLens, payload)
	)({});

const createAxisVisibilityUpdateAction = R.converge(makeAction, [
	R.flip(getActionTypeByAxis),
	getNewVisibilityForAxisItem,
]);

const setVisibilityForAxisItem = R.curry((data, axis, itemIndex) =>
	R.pipe(
		createAxisVisibilityUpdateAction(data, R.__, itemIndex),
		data.store.dispatch
	)(axis)
);

const filterAllItemsInOtherAxis = R.curry((data, axis) => {
	const otherAxis = getOtherAxis(axis);
	R.times(setVisibilityForAxisItem(data, otherAxis), getTotalForAxis(otherAxis, getSheetFromData(data)));
});

const getCellVisibilityForAxis = R.curry((cell, axis) =>
	R.pipe(
		getSheetFromData,
		R.path([getAxisVisibilityName(axis), R.prop(axis, cell)])
	)
);

const getCellVisibilityFnsFromCell = cell => R.map(getCellVisibilityForAxis(cell), [ROW_AXIS, COLUMN_AXIS]);

const getCellFromData = R.curry((data, cellKey) =>
	R.pipe(
		getStateFromData,
		R.prop(cellKey)
	)(data)
);

const getCellVisibilityFns = R.pipe(
	getCellFromData,
	getCellVisibilityFnsFromCell
);

const setVisibilityForCell = (data, cellKey) => {
	const cellVisibility = R.reduce(
		(accumulator, visibilityFn) => visibilityFn(data) && accumulator,
		true,
		getCellVisibilityFns(data, cellKey)
	);
	const cell = getCellFromData(data, cellKey);
	updatedCell({ ...cell, visible: cellVisibility });
};

const getCellKeysFromData = R.pipe(
	getStateFromData,
	R.prop('cellKeys')
);

const filterCells = data => {
	const cellKeys = getCellKeysFromData(data);
	R.map(cellKey => {
		return setVisibilityForCell(data, cellKey);
	}, cellKeys);
};

// TODO this should really be a pipe. Functions above should output data to go to next function
const filterAxes = data => {
	R.map(filterAllItemsInOtherAxis(data), [getAxis(data), getOppositeAxis(data)]);
	return data;
};

/* getDataFromActionAndStore - creates a data object for passing to subsequent functions in hideFiltered's pipe */
const getDataFromActionAndStore = (actionData, store) => R.mergeAll([actionData, { store }]);

// TODO make more functional
const addNewFilter = data => {
	const filterIndex = R.isNil(data.rowIndex) ? data.colIndex : data.rowIndex;
	const newFilters = R.assoc(
		filterIndex,
		{
			filterExpression: data.filterExpression,
			caseSensitive: data.caseSensitive,
			regex: data.regex,
		},
		{}
	);
	R.ifElse(R.equals(ROW_AXIS), () => updatedRowFilters(newFilters), () => updatedColumnFilters(newFilters))(
		getAxis(data)
	);
	return data;
};

const hideFiltered = R.pipe(
	getDataFromActionAndStore,
	addNewFilter,
	filterAxes,
	filterCells
);

export default store => next => action => {
	if (!action) {
		return;
	}
	switch (action.type) {
		case HIDE_FILTERED:
			hideFiltered(action.payload, store);
			break;
		default:
	}
	return next(action);
};
