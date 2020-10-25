import * as R from 'ramda';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';
import {
   REPLACED_COLUMN_VISIBILITY,
   REPLACED_ROW_VISIBILITY,
   RESET_VISIBLITY,
   HIDE_FILTERED,
   CLEAR_ALL_FILTERS,
} from '../actions/types';
import { updatedColumnFilters, updatedRowFilters, hasChangedMetadata, toggledShowFilterModal } from '../actions';
import { updatedCell } from '../actions/cellActions';
import { getObjectFromArrayByKeyValue, isNothing, arrayContainsSomething, forLoopMap } from '../helpers';
import { getTotalForAxis, getAxisVisibilityName } from '../helpers/visibilityHelpers';
import { stateMetadataProp } from '../helpers/dataStructureHelpers';

/* these are used by multiple functions below */
const getAxis = data =>
   R.ifElse(
      R.isNil,
      () => COLUMN_AXIS,
      () => ROW_AXIS
   )(data.rowIndex);

const getOtherAxis = axis => (axis === ROW_AXIS ? COLUMN_AXIS : ROW_AXIS);

const getVisibilityActionTypeByAxis = axis =>
   axis === ROW_AXIS ? REPLACED_ROW_VISIBILITY : REPLACED_COLUMN_VISIBILITY;

const getStateFromData = data => R.path(['store', 'getState'], data)();

const getFilters = (axisName, state) => R.pipe(R.concat(R.__, 'Filters'), stateMetadataProp(state))(axisName);

/**** filterAxes and related functions *****/
const makeVisibilityAction = (axis, payload) => ({
   type: getVisibilityActionTypeByAxis(axis),
   payload,
});

const dispatchVisibilityActions = R.curry((data, newAxesVisibility) =>
   R.map(
      axis => {
         const axisVisibilityName = getAxisVisibilityName(axis);
         const visibilityPayload = R.prop(axisVisibilityName, newAxesVisibility);
         data.store.dispatch(makeVisibilityAction(axis, visibilityPayload));
         return true; // just to stop console complaining about not returning a value
      },
      [ROW_AXIS, COLUMN_AXIS]
   )
);

// note that the 3rd parameter to R.reduce is the string to operate on - it will be passed as a parameter to escapeRegexChars
const escapeRegexChars = R.memoizeWith(
   R.identity,
   R.reduce((processedString, char) => {
      const charNums = [91, 94, 36, 46, 124, 63, 42, 43, 40, 41, 92]; // nums for the chars [^$.|?*+()\
      const charCode = char.charCodeAt(0);
      const needsEscaping = R.includes(charCode, charNums);
      const maybeEscapedChar = needsEscaping ? String.fromCharCode(92, charCode) : char;
      return R.concat(processedString, maybeEscapedChar);
   }, '')
);

const isCellShownByFilter = R.curry((cell, filter, axisOfFilter) => {
   if (cell[axisOfFilter] !== filter.index) {
      return true; // because this filter does not apply to this cell
   }
   const flags = filter.caseSensitive ? '' : 'i';
   const filterExpression = filter.regex
      ? filter.filterExpression || ''
      : escapeRegexChars(filter.filterExpression || '');
   const regex = new RegExp(filterExpression, flags);
   return regex.test(cell.content.text);
});

const createCellKey = (axis, itemIndex, otherAxisIndex) => {
   const rowIndex = axis === ROW_AXIS ? itemIndex : otherAxisIndex;
   const colIndex = axis === COLUMN_AXIS ? itemIndex : otherAxisIndex;
   return 'cell_' + rowIndex + '_' + colIndex;
};

const getCellFromDataAndCellKey = R.curry((data, cellKey) => R.prop(cellKey, getStateFromData(data)));

const getCellsInAxisItem = R.curry((data, axis, itemIndex, filters) => {
   const totalInOtherAxis = getTotalForAxis(getOtherAxis(axis), getStateFromData(data));
   return forLoopMap(otherAxisIndex => {
      const cellKey = createCellKey(axis, itemIndex, otherAxisIndex);
      return getCellFromDataAndCellKey(data, cellKey);
   }, totalInOtherAxis);
});

const checkCellsAgainstFilters = R.curry((axis, otherAxisFilters, cellsInAxisItem) => {
   return R.reduce((cellAccumulator, cell) => {
      return (
         cellAccumulator &&
         R.reduce(
            (filterAccumulator, otherAxisFilter) =>
               filterAccumulator && isCellShownByFilter(cell, otherAxisFilter, getOtherAxis(axis)),
            true
         )(otherAxisFilters)
      );
   }, true)(cellsInAxisItem);
});

const getVisibilityForCellsInAxisItem = (data, axis, itemIndex) => {
   const otherAxisFilters = getFilters(getOtherAxis(axis), getStateFromData(data));
   return R.ifElse(
      // if there are no filters
      otherAxisFilters => isNothing(otherAxisFilters) || !arrayContainsSomething(otherAxisFilters),
      // return true
      R.T,
      // else check the cells in the axis item (e.g. cells in row 1) against the filters in the opposite axis (e.g. all columnFilters)
      otherAxisFilters =>
         R.pipe(getCellsInAxisItem, checkCellsAgainstFilters(axis, otherAxisFilters))(
            data,
            axis,
            itemIndex,
            otherAxisFilters
         )
   )(otherAxisFilters); // note otherAxisFilters obj is given to all 3 ifElse Fns - condition, onTrue and onFalse
};

const getNewVisibilityForAxisItem = R.curry((data, axis, itemIndex) => ({
   index: itemIndex,
   isVisible: getVisibilityForCellsInAxisItem(data, axis, itemIndex),
}));

const filterAllItemsInAxis = R.curry((data, axis) => {
   const axisVisibilityArr = R.times(
      getNewVisibilityForAxisItem(data, axis),
      getTotalForAxis(axis, getStateFromData(data))
   );
   return R.pipe(getAxisVisibilityName, R.assoc(R.__, axisVisibilityArr, {}))(axis);
});

const filterAxes = data => {
   const newVisibility = R.pipe(
      R.map(filterAllItemsInAxis(data)),
      R.mergeAll //converts the array to an object like {rowVisibility: {...}, columnVisibility: {...}}
   )([ROW_AXIS, COLUMN_AXIS]);
   dispatchVisibilityActions(data, newVisibility);
   return data;
};
/***** end filterAxes and related functions *****/

// const getAxisVisibilityByIndex = (axis, axisIndex, sheet) => {
const getAxisVisibilityByIndex = (axis, axisIndex, state) => {
   const visibilityObj = R.pipe(
      getAxisVisibilityName,
      stateMetadataProp(state),
      getObjectFromArrayByKeyValue('index', axisIndex)
   )(axis);
   return visibilityObj ? visibilityObj.isVisible : true; // if there's no visibilityObj then we should show the Axis Item, so return true
};

// const getCellVisibilityForAxis = R.curry((cell, axis, sheet) => {
const getCellVisibilityForAxis = R.curry((cell, axis, state) => {
   const otherAxis = getOtherAxis(axis);
   const otherAxisIndex = cell[otherAxis];
   // return getAxisVisibilityByIndex(otherAxis, otherAxisIndex, sheet);
   return getAxisVisibilityByIndex(otherAxis, otherAxisIndex, state);
});

const getCellVisibilityFnsFromCell = cell => R.map(getCellVisibilityForAxis(cell), [ROW_AXIS, COLUMN_AXIS]);

const getCellFromData = R.curry((data, cellKey) => R.pipe(getStateFromData, R.prop(cellKey))(data));

// this returns an aray of 2 functions, one for each axis, which take the data as an argument and return something like
// {index: 0, isVisible: true}
// this array is used by the reduce function in setVisibilityForCell() below
const getCellVisibilityFns = R.pipe(getCellFromData, getCellVisibilityFnsFromCell);

// every cell is going to be run through this function
const setVisibilityForCell = (data, cellKey) => {
   // const sheet = getSheetFromData(data);
   const state = getStateFromData(data);
   const newCellVisibility = R.reduce(
      // (accumulator, visibilityFn) => visibilityFn(sheet) && accumulator,
      (accumulator, visibilityFn) => visibilityFn(state) && accumulator,
      true,
      getCellVisibilityFns(data, cellKey)
   );
   const cell = getCellFromData(data, cellKey);
   R.when(
      newVisibility => newVisibility !== cell.visible,
      newVisibility => updatedCell({ ...cell, visible: newVisibility })
   )(newCellVisibility);
};

const getCellKeysFromData = R.pipe(getStateFromData, R.prop('cellKeys'));

const filterCells = data => {
   const cellKeys = getCellKeysFromData(data);
   R.map(cellKey => {
      return setVisibilityForCell(data, cellKey);
   }, cellKeys);
};
/**** end filterCells and related functions ******/

/**** functions related to addNewFilter *****/
const getFilterIndex = data => (R.isNil(data.rowIndex) ? data.colIndex : data.rowIndex);

const getNewFilter = data =>
   R.mergeAll([
      R.assoc('index', getFilterIndex(data), {}),
      R.pick(['filterExpression', 'caseSensitive', 'regex'])(data),
   ]);

// this was hard to figure out!
// R.ifElse wants to get 3 functions, not 3 values, so R.thunkify takes a function and the parameters, but doesn't
// actually call the function. So ifElse gets a function that, when run, has all the right parameters ready to go.
// Encasing all that is R.useWtih which takes the 3 parameters passed to it, and passes one param to each function
// in the array, then each of the 3 functions in the array are used by R.ifElse
const addNewFilter = data => {
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
const getDataFromActionAndStore = (actionData, store) => R.mergeAll([actionData, { store }]);

const hideFiltered = R.pipe(getDataFromActionAndStore, addNewFilter, filterAxes, filterCells);

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
   R.pipe(getDataFromActionAndStore, filterAxes, filterCells)(filterDataReset, store);
};

export default store => next => async action => {
   switch (action.type) {
      case HIDE_FILTERED:
         const { filterOptions, isInitializingSheet } = action.payload;
         // TODO handle case where no sheet data returned from db
         hideFiltered(filterOptions, store);
         if (!isInitializingSheet) {
            hasChangedMetadata();
         }
         break;
      case CLEAR_ALL_FILTERS:
         clearAllFilters(store);
         hasChangedMetadata();
         break;
      default:
   }
   return next(action);
};
