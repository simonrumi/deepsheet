import * as R from 'ramda';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';
import {
   REPLACED_COLUMN_VISIBILITY,
   REPLACED_ROW_VISIBILITY,
   RESET_VISIBLITY,
   HIDE_FILTERED,
   CLEAR_ALL_FILTERS,
} from '../actions/types';
import {
   updatedColumnFilters,
   updatedRowFilters,
   updatedHasChanged,
   updatedCell,
   toggledShowFilterModal,
} from '../actions';
import {
   getObjectFromArrayByKeyValue,
   isSomething,
   isNothing,
   arrayContainsSomething,
} from '../helpers';
import {
   getTotalForAxis,
   getAxisVisibilityName,
} from '../helpers/visibilityHelpers';

/* these are used by multiple functions below */
const getAxis = (data) =>
   R.ifElse(
      R.isNil,
      () => COLUMN_AXIS,
      () => ROW_AXIS
   )(data.rowIndex);

const getOppositeAxis = (data) =>
   R.ifElse(
      R.isNil,
      () => ROW_AXIS,
      () => COLUMN_AXIS
   )(data.rowIndex);

const getOtherAxis = (axis) => (axis === ROW_AXIS ? COLUMN_AXIS : ROW_AXIS);

const getVisibilityActionTypeByAxis = (axis) =>
   axis === ROW_AXIS ? REPLACED_ROW_VISIBILITY : REPLACED_COLUMN_VISIBILITY;

const getStateFromData = (data) => R.path(['store', 'getState'], data)();

const getSheetFromData = R.pipe(getStateFromData, R.prop('sheet'));

const getFilters = (axisName, sheet) => sheet[R.concat(axisName, 'Filters')];

/**** filterAxes and related functions *****/

// note that the 3rd parameter to R.reduce is the string to operate on - it will be passed as a parameter to escapeRegexChars
const escapeRegexChars = R.memoizeWith(
   R.identity,
   R.reduce((processedString, char) => {
      const charNums = [91, 94, 36, 46, 124, 63, 42, 43, 40, 41, 92]; // nums for the chars [^$.|?*+()\
      const charCode = char.charCodeAt(0);
      const needsEscaping = R.includes(charCode, charNums);
      const maybeEscapedChar = needsEscaping
         ? String.fromCharCode(92, charCode)
         : char;
      return R.concat(processedString, maybeEscapedChar);
   }, '')
);

const isCellShownByFilter = R.curry((cell, filter) => {
   const flags = filter.caseSensitive ? 'g' : 'ig';
   const filterExpression = filter.regex
      ? filter.filterExpression || ''
      : escapeRegexChars(filter.filterExpression || '');
   const regex = new RegExp(filterExpression, flags);
   return regex.test(cell.content.text);
});

const createCellKey = (axis, itemIndex, otherAxisIndex) => {
   const rowIndex = axis === ROW_AXIS ? itemIndex : otherAxisIndex;
   const colIndex = axis === COLUMN_AXIS ? itemIndex : otherAxisIndex;
   const cellKey = 'cell_' + rowIndex + '_' + colIndex;
   return cellKey; // TODO make createCellKey(rowIndex, colIndex) and put in cellHelpers
};

const getCellFromDataAndCellKey = R.curry((data, cellKey) =>
   R.prop(cellKey, getStateFromData(data))
);

const getCellFromDataAxisAndIndicies = (data, axis, itemIndex) => {
   const otherAxisIndex = isSomething(data.colIndex)
      ? data.colIndex
      : data.rowIndex;
   return R.pipe(createCellKey, getCellFromDataAndCellKey(data))(
      axis,
      itemIndex,
      otherAxisIndex
   );
};

const getVisibilityForCellsInAxisItem = (data, axis, itemIndex) => {
   // if we have no filters that is the same as saying every cell should be visible,
   // so we can return an object  like
   // { 0: true }
   // which says just one column/row is visible,
   // and this will be reduced in getAxisVisibilityValue to a single true value for the whole row or column

   // also note R.mapObjIndexed sends its 1st argument, a function, the parameters (value, key, obj),
   // but we're not using the obj
   // it then returns an object
   const filters = getFilters(getOtherAxis(axis), getSheetFromData(data));
   return R.ifElse(
      (filters) => isNothing(filters) || !arrayContainsSomething(filters),
      () => R.identity({ 0: true }),
      (filters) =>
         R.mapObjIndexed((filter, filterIndex) => {
            return R.pipe(
               getCellFromDataAxisAndIndicies,
               isCellShownByFilter(R.__, filter)
            )(data, axis, itemIndex, filterIndex);
         })(filters) // here, in the onFalse Fn, filters is the object to map over
   )(filters); // filters obj is given to all 3 ifElse Fns - condition, onTrue and onFalse
};

const getAxisVisibilityValue = (data, axis, itemIndex) =>
   R.pipe(
      getVisibilityForCellsInAxisItem,
      R.values,
      R.reduce((accumulator, isVisible) => accumulator && isVisible, true)
   )(data, axis, itemIndex);

const getNewVisibilityForAxisItem = R.curry((data, axis, itemIndex) => ({
   index: itemIndex,
   isVisible: getAxisVisibilityValue(data, axis, itemIndex),
}));

const makeVisibilityAction = (axis, payload) => ({
   type: getVisibilityActionTypeByAxis(axis),
   payload,
});

const filterAllItemsInAxis = R.curry((data, axis) => {
   const axisVisibilityArr = R.times(
      getNewVisibilityForAxisItem(data, axis),
      getTotalForAxis(axis, getSheetFromData(data))
   );
   data.store.dispatch(makeVisibilityAction(axis, axisVisibilityArr));
});

const filterAxes = (data) => {
   // filter all items in both axes
   R.map(filterAllItemsInAxis(data), [getAxis(data), getOppositeAxis(data)]);
   return data;
};
/***** end filterAxes and related functions *****/

const getAxisVisibilityByIndex = (axis, axisIndex, sheet) => {
   const visibilityObj = R.pipe(
      getAxisVisibilityName,
      R.prop(R.__, sheet),
      getObjectFromArrayByKeyValue('index', axisIndex)
   )(axis);
   return visibilityObj ? visibilityObj.isVisible : true; // if there's no visibilityObj then we should show the Axis Item, so return true
};

const getCellVisibilityForAxis = R.curry((cell, axis, sheet) => {
   const otherAxis = getOtherAxis(axis);
   const otherAxisIndex = cell[otherAxis];
   return getAxisVisibilityByIndex(otherAxis, otherAxisIndex, sheet);
});

const getCellVisibilityFnsFromCell = (cell) =>
   R.map(getCellVisibilityForAxis(cell), [ROW_AXIS, COLUMN_AXIS]);

const getCellFromData = R.curry((data, cellKey) =>
   R.pipe(getStateFromData, R.prop(cellKey))(data)
);

// this returns an aray of 2 functions, one for each axis, which take the data as an argument and return something like
// {index: 0, isVisible: true}
// this array is used by the reduce function in setVisibilityForCell() below
const getCellVisibilityFns = R.pipe(
   getCellFromData,
   getCellVisibilityFnsFromCell
);

// every cell is going to be run through this function
const setVisibilityForCell = (data, cellKey) => {
   const sheet = getSheetFromData(data);
   const newCellVisibility = R.reduce(
      (accumulator, visibilityFn) => visibilityFn(sheet) && accumulator,
      true,
      getCellVisibilityFns(data, cellKey)
   );
   const cell = getCellFromData(data, cellKey);
   R.when(
      (newVisibility) => newVisibility !== cell.visible,
      (newVisibility) => updatedCell({ ...cell, visible: newVisibility })
   )(newCellVisibility);
};

const getCellKeysFromData = R.pipe(getStateFromData, R.prop('cellKeys'));

const filterCells = (data) => {
   const cellKeys = getCellKeysFromData(data);
   R.map((cellKey) => {
      return setVisibilityForCell(data, cellKey);
   }, cellKeys);
};
/**** end filterCells and related functions ******/

/**** functions related to addNewFilter *****/
const getFilterIndex = (data) =>
   R.isNil(data.rowIndex) ? data.colIndex : data.rowIndex;

const getNewFilter = (data) =>
   R.mergeAll([
      R.assoc('index', getFilterIndex(data), {}),
      R.pick(['filterExpression', 'caseSensitive', 'regex'])(data),
   ]);

// this was hard to figure out!
// R.ifElse wants to get 3 functions, not 3 values, so R.thunkify takes a function and the parameters, but doesn't
// actually call the function. So ifElse gets a function that, when run, has all the right parameters ready to go.
// Encasing all that is R.useWtih which takes the 3 parameters passed to it, and passes one param to each function
// in the array.
const addNewFilter = (data) => {
   const newFilter = getNewFilter(data);
   R.useWith(R.ifElse, [
      R.thunkify(R.equals(ROW_AXIS)),
      R.thunkify(updatedRowFilters),
      R.thunkify(updatedColumnFilters),
   ])(getAxis(data), newFilter, newFilter)();
   return data;
};
/**** end addNewFilter and related functions ******/

/* getDataFromActionAndStore - creates a data object for passing to subsequent functions in hideFiltered's pipe */
const getDataFromActionAndStore = (actionData, store) =>
   R.mergeAll([actionData, { store }]);

const hideFiltered = R.pipe(
   getDataFromActionAndStore,
   addNewFilter,
   filterAxes,
   filterCells
);

const clearAllFilters = (store) => {
   store.dispatch({ type: RESET_VISIBLITY });
   toggledShowFilterModal();
   const filterDataReset = {
      filterExpression: '',
      caseSensitive: false,
      regex: false,
      showFilterModal: false,
      rowIndex: null,
      colIndex: 0, //doesn't really matter which filter icon that was clicked on, so we pretend it was column A
   };
   R.pipe(
      getDataFromActionAndStore,
      filterAxes,
      filterCells
   )(filterDataReset, store);
};

export default (store) => (next) => (action) => {
   if (!action) {
      return;
   }
   switch (action.type) {
      case HIDE_FILTERED:
         console.log(
            'TODO in filterSheet.js handle case where no sheet data returned from db'
         );
         hideFiltered(action.payload, store);
         updatedHasChanged(true);
         break;
      case CLEAR_ALL_FILTERS:
         clearAllFilters(store);
         updatedHasChanged(true);
         break;
      default:
   }
   return next(action);
};
