import * as R from 'ramda';
import {
   UPDATED_COLUMN_VISIBILITY,
   UPDATED_ROW_VISIBILITY,
   RESET_VISIBLITY,
   HIDE_FILTERED,
   CLEAR_ALL_FILTERS,
} from '../actions/types';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';
import {
   updatedColumnFilters,
   updatedRowFilters,
   updatedHasChanged,
} from '../actions';
import {
   getTotalForAxis,
   getAxisVisibilityName,
} from '../helpers/visibilityHelpers';
import { updatedCell, toggledShowFilterModal } from '../actions';

/* these are used by multiple functions below */
const getAxis = data =>
   R.ifElse(R.isNil, () => COLUMN_AXIS, () => ROW_AXIS)(data.rowIndex);

const getOppositeAxis = data =>
   R.ifElse(R.isNil, () => ROW_AXIS, () => COLUMN_AXIS)(data.rowIndex);

const getOtherAxis = axis => (axis === ROW_AXIS ? COLUMN_AXIS : ROW_AXIS);

const getActionTypeByAxis = axis =>
   axis === ROW_AXIS ? UPDATED_ROW_VISIBILITY : UPDATED_COLUMN_VISIBILITY;

const getStateFromData = data => R.path(['store', 'getState'], data)();

const getSheetFromData = R.pipe(
   getStateFromData,
   R.prop('sheet')
);

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
      console.log('calculated escapeRegexChars');
      return R.concat(processedString, maybeEscapedChar);
   }, '')
);

const isCellShownByFilter = R.curry((cell, filter) => {
   const flags = filter.caseSensitive ? 'g' : 'ig';
   const filterExpression = filter.regex
      ? filter.filterExpression || ''
      : escapeRegexChars(filter.filterExpression || '');
   const regex = new RegExp(filterExpression, flags);
   return regex.test(cell.content);
});

const createCellKey = (data, axis, itemIndex, otherAxisIndex) => {
   const rowIndex = axis === ROW_AXIS ? itemIndex : otherAxisIndex;
   const colIndex = axis === COLUMN_AXIS ? itemIndex : otherAxisIndex;
   const cellKey = 'cell_' + rowIndex + '_' + colIndex;
   return cellKey; // TODO make createCellKey(rowIndex, colIndex) and put in cellHelpers
};

const getCellFromDataAndCellKey = R.curry((data, cellKey) =>
   R.prop(cellKey, getStateFromData(data))
);

const getCellFromDataAxisAndIndicies = (
   data,
   axis,
   itemIndex,
   otherAxisIndex
) =>
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
         R.mapObjIndexed((filter, filterIndex) => {
            return R.pipe(
               getCellFromDataAxisAndIndicies,
               isCellShownByFilter(R.__, filter)
            )(data, axis, itemIndex, filterIndex);
         })(filters) // here, in the onFalse Fn, filters is the object to map over
   )(filters); // filters obj is given to all 3 ifElse Fns - condition, onTrue and onFalse
};

// receives (data, axis, itemIndex)
const getAxisVisibilityValue = R.pipe(
   getVisibilityForCellsInAxisItem,
   R.values,
   R.reduce((accumulator, isVisible) => accumulator && isVisible, true)
);

const getAxisVisibilityObj = R.converge(R.prop, [
   R.flip(getAxisVisibilityName),
   getSheetFromData,
]); // receives (data, axis, itemIndex)

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
   R.times(
      setVisibilityForAxisItem(data, otherAxis),
      getTotalForAxis(otherAxis, getSheetFromData(data))
   );
});

const filterAxes = data => {
   R.map(filterAllItemsInOtherAxis(data), [
      getAxis(data),
      getOppositeAxis(data),
   ]);
   return data;
};
/***** end filterAxes and related functions *****/

const getCellVisibilityForAxis = R.curry((cell, axis) =>
   R.pipe(
      getSheetFromData,
      R.path([getAxisVisibilityName(axis), R.prop(axis, cell)])
   )
);

const getCellVisibilityFnsFromCell = cell =>
   R.map(getCellVisibilityForAxis(cell), [ROW_AXIS, COLUMN_AXIS]);

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
/**** end filterCells and related functions ******/

/**** functions related to addNewFilter *****/
const getFilterIndex = data =>
   R.isNil(data.rowIndex) ? data.colIndex : data.rowIndex;

const getNewFilters = R.converge(R.assoc, [
   getFilterIndex,
   R.pick(['filterExpression', 'caseSensitive', 'regex']),
   R.empty,
]);

// this was hard to figure out!
// R.ifElse wants to get 3 functions, not 3 values, so R.thunkify takes a function and the parameters, but doesn't
// actually call the function. So ifElse gets a function that, when run, has all the right parameters ready to go.
// Encasing all that is R.useWtih which takes the 3 parameters passed to it, and passes one param to each function
// in the array.
const addNewFilter = data => {
   R.useWith(R.ifElse, [
      R.thunkify(R.equals(ROW_AXIS)),
      R.thunkify(updatedRowFilters),
      R.thunkify(updatedColumnFilters),
   ])(getAxis(data), getNewFilters(data), getNewFilters(data))();
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

const clearAllFilters = store => {
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

export default store => next => action => {
   if (!action) {
      return;
   }
   switch (action.type) {
      case HIDE_FILTERED:
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
