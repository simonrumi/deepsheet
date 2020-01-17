/*
See notes in getVisibilityForCellsInAxis

BUT MAYBE first refactor store so that columnVisibility, rowVisibility, columnFilters and rowFilters
are pulled out from sheet and put at the top level of the store (sheet data stays as is)

Then make actions to update each of those

Then work out some string of actions like
dispatch UPDATED_FILTER when user is typing in filter text input
when OK button is clicked in filter modal
tirgger updatedColumnFilters or updatedRowFilters with the full sheet data
Then dispatch HIDE_FILTERED to trigger the code here

*/

import * as R from 'ramda';
import {
   UPDATED_COLUMN_VISIBILITY,
   UPDATED_ROW_VISIBILITY,
   HIDE_FILTERED,
} from '../actions/types';
import { updatedColumnFilters, updatedRowFilters } from '../actions';
import {
   extractRowColFromCellKey,
   ROW_AXIS,
   COLUMN_AXIS,
   nothing,
} from '../helpers';
import {
   getVisibilityForAxis,
   getTotalForAxis,
   replaceFilterEntry,
   getFilterName,
} from '../helpers/visibilityHelpers';
//import * as RWrap from '../helpers/ramdaWrappers';

/* these are used by multiple functions below */
const getAxis = data =>
   R.ifElse(R.isNil, () => COLUMN_AXIS, () => ROW_AXIS)(data.rowIndex);

const getOppositeAxis = data =>
   R.ifElse(R.isNil, () => ROW_AXIS, () => COLUMN_AXIS)(data.rowIndex);

const getOtherAxis = axis => (axis === ROW_AXIS ? COLUMN_AXIS : ROW_AXIS);

const getAxisVisibilityName = axis => R.concat(axis, 'Visibility'); // will be "rowVisibility" or "columnVisibility"

const getActionTypeByAxis = axis =>
   axis === ROW_AXIS ? UPDATED_ROW_VISIBILITY : UPDATED_COLUMN_VISIBILITY;

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
// 	** don't do?:  if axisFilters are not empty <applyAllFiltersInAxis>
// 		for each oppositeAxis Item <filterAllItemsInOtherAxis>
// 			start by setting the axis visibility to true (unhidden) <??>
// 			for each filter in axisFilters <setVisibilityForOtherAxisItem>
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

const createCellKey = (data, axis, itemIndex, otherAxisIndex) => {
   const rowIndex = axis === ROW_AXIS ? itemIndex : otherAxisIndex;
   const colIndex = axis === COLUMN_AXIS ? itemIndex : otherAxisIndex;
   const cellKey = 'cell_' + rowIndex + '_' + colIndex;
   console.log('createCellKey, axis = ', axis);
   console.log('createCellKey, cellKey = ', cellKey);
   return cellKey; // TODO make createCellKey(rowIndex, colIndex) and put in cellHelpers
};

const getVisibilityForCellsInAxis = (data, axis, indexOfOtherAxis) => {
   console.log(
      'getVisibilityForCellsInAxis, data =',
      data,
      ', axis =',
      axis,
      'indexOfOtherAxis =',
      indexOfOtherAxis
   );

   // BUG TODO: getFilters now returns correct object with filters for axis in it....check what is happening next
   // BUG TODO: getVisibilityForCellsInAxis, createCellKey and createAxisVisibilityUpdateAction are being called twice
   // for each cell (same results though)
   console.log(
      'getVisibilityForCellsInAxis getFilters(axis, data.store.getState().sheet) will give',
      getFilters(axis, data.store.getState().sheet)
   );

   const sheet = data.store.getState().sheet;

   // **** TODO: remember that data.filterExpression contains new filter data for the clicked axis item

   return R.mapObjIndexed((filter, filterIndex, axisFilters) => {
      const cellKey = createCellKey(data, axis, indexOfOtherAxis, filterIndex);
      const cell = data.store.getState()[cellKey];
      return !isCellHiddenByFilter(cell, filter);
   }, getFilters(axis, data.store.getState().sheet));
};

// receives (data, axis, itemIndex)
const getAxisVisibilityValue = R.pipe(
   getVisibilityForCellsInAxis,
   R.values,
   R.reduce((accumulator, isVisible) => accumulator && isVisible, true)
);

// receives (data, axis, itemIndex)
const getAxisVisibilityObj = R.converge(R.prop, [
   R.flip(getAxisVisibilityName),
   R.path(['storeState', 'sheet']),
]);

// receives (data, axis, itemIndex)
const getNewVisibilityForAxis = R.converge(R.assoc, [
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
   getNewVisibilityForAxis,
]);

// for each filter in axisFilters
// TODO remove console logs
const setVisibilityForOtherAxisItem = R.curry((data, axis, itemIndex) => {
   console.log('setVisibilityForOtherAxisItem', itemIndex);
   console.log(
      'createAxisVisibilityUpdateAction(data, getOtherAxis(axis), itemIndex)',
      createAxisVisibilityUpdateAction(data, getOtherAxis(axis), itemIndex)
   );
   R.pipe(
      getOtherAxis,
      createAxisVisibilityUpdateAction(data, R.__, itemIndex),
      data.store.dispatch
   )(axis);
});

// TODO remove console logs
// for each oppositeAxis Item
const filterAllItemsInOtherAxis = R.curry((data, axis) => {
   console.log('filterAllItemsInOtherAxis, axis = ', axis);
   console.log(
      'getTotalForAxis(axis, data.store.getState().sheet)',
      getTotalForAxis(axis, data.store.getState().sheet)
   );
   R.times(
      setVisibilityForOtherAxisItem(data, axis),
      getTotalForAxis(axis, data.store.getState().sheet)
   );
});

// if axisFilters are not empty - QQQQ skipping this for now
const applyAllFiltersInAxis = R.curry((data, axis) => {
   console.log('applyAllFiltersInAxis, data = ', data, 'axis = ', axis);
   return R.pipe(
      getFilters,
      R.isEmpty
   )(axis, data.store.getState().sheet)
      ? nothing()
      : filterAllItemsInOtherAxis(data);
});

// TODO this should really be a pipe. Functions above should output data to go to next function
// for each axis
const filterWholeSheet = data =>
   R.map(filterAllItemsInOtherAxis(data), [
      getAxis(data),
      getOppositeAxis(data),
   ]);
//R.map(applyAllFiltersInAxis(data), [getAxis(data), getOppositeAxis(data)]);

/* getDataFromActionAndStore - creates a data object for passing to subsequent functions in hideFiltered's pipe */
const getDataFromActionAndStore = (actionData, store) =>
   R.mergeAll([actionData, { store }, { storeState: store.getState() }]);

// TODO make more functional and remove console logs
const addNewFilter = data => {
   const filterName = getFilterName(data);
   const sheet = data.store.getState().sheet;
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
   console.log('addNewFilter created newFilters', newFilters);
   updatedColumnFilters(newFilters);
   return data;
};

const hideFiltered = R.pipe(
   getDataFromActionAndStore,
   addNewFilter,
   R.tap(console.log),
   filterWholeSheet
);

export default store => next => action => {
   if (!action) {
      return;
   }
   switch (action.type) {
      case HIDE_FILTERED:
         hideFiltered(action.payload, store);
         break;
   }

   return next(action);
};
