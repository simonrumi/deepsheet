import * as R from 'ramda';
import {
   extractRowColFromCellKey,
   capitalizeFirst,
   isNothing,
   isSomething,
   arrayContainsSomething,
   getObjectFromArrayByKeyValue,
} from './index';
import { updatedFilter } from '../actions';
import {
   stateMetadataProp,
   dbRowFilters,
   dbColumnFilters,
   filterFilterExpression,
   filterCaseSensitive,
   filterRegex,
   filterIndex,
} from './dataStructureHelpers';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';
//import * as RWrap from './ramdaWrappers'; // use this for debugging only

// not for use in by any functions here, just for export
export const getAxisFilterName = axis => R.concat(axis, 'Filters');

/***
 * these functions are for use by the reducers for UPDATED_ROW_FILTERS and UPDATED_COLUMN_FILTERS
 ***/
const removeOldFilter = R.curry((payload, filterArr) =>
   R.cond([
      [(payload, filterArr) => (isNothing(filterArr) || isNothing(payload) ? true : false), R.always([])],
      [(payload, filterArr) => !arrayContainsSomething(filterArr), R.always([])],
      [
         R.T,
         (payload, filterArr) =>
            R.reduce(
               (accumulator, filter) =>
                  R.propEq('index', filter.index, payload) ? accumulator : R.concat(accumulator, [filter]),
               []
            )(filterArr),
      ],
   ])(payload, filterArr)
);

export const updatedAxisFilters = (payload, filterName, stateObj, filterArr) =>
   R.pipe(
      removeOldFilter(payload), // remove the existing version of the axis' filter if it exists, from the filters array
      R.concat([payload]), // add the new filter from the payload to the filters array
      R.assoc(filterName, R.__, stateObj) // put the new filters array into the state obj
   )(filterArr);

/****
 * figure out how many rows or columns are hidden due to filtering, for use by Sheet.js & ColumnHeaders.js
 ****/
const confirmAxis = axis => (axis === ROW_AXIS || axis === COLUMN_AXIS ? axis : '');

const getVisibilityForAxis = (axis, state) => stateMetadataProp(state, R.concat(axis, 'Visibility'));

const numHiddenItems = R.reduce(
   (accumulator, visibilityObj) => (!visibilityObj.isVisible ? accumulator + 1 : accumulator),
   0,
   R.__
);

const getNumHiddenItemsForAxis = R.pipe(getVisibilityForAxis, R.values, numHiddenItems);

const pluralizeTail = R.pipe(R.tail, R.toLower, R.concat(R.__, 's'));

const capitalizedPlural = R.converge(R.concat, [capitalizeFirst, pluralizeTail]);

// create either "totalRows" or "totalColumns" from the axis which will be either "row" or "column"
const createTotalsKey = axis => (confirmAxis(axis) ? R.pipe(capitalizedPlural, R.concat('total'))(axis) : null);

export const getTotalForAxis = R.curry(
   (axis, state) => stateMetadataProp(state, createTotalsKey(axis)) || 0 //returning 0 if the totalsKey is bogus)
);

export const getRequiredNumItemsForAxis = (axis, state) => {
   const visibleItems = R.converge(R.subtract, [getTotalForAxis, getNumHiddenItemsForAxis])(axis, state);

   if (typeof visibleItems === 'number') {
      return visibleItems;
   }
   return visibleItems;
};

/****
 * row visibility, for use by Sheet.js
 *****/
export const shouldShowRow = R.curry((rowVisibility, cellKey) => {
   if (isNothing(rowVisibility) || !arrayContainsSomething(rowVisibility)) {
      return true;
   }
   const rowColObj = extractRowColFromCellKey(cellKey);
   const rowVisibilityObj = getObjectFromArrayByKeyValue('index', rowColObj.row, rowVisibility);
   return isSomething(rowVisibilityObj) ? rowVisibilityObj.isVisible : true;
});

/*****
 * column visibility, for use by ColumnHeaders.js.
 * These functions are similar to the row filtering ones above, but different due to the
 * different structure of data available to ColumnHeaders.js compared with Sheet.js,
 * consequently it doesn't seem worthwhile trying to generalize any of these functions
 ****/
export const shouldShowColumn = R.curry((colVisibilityArr, colIndex) => {
   if (isNothing(colVisibilityArr) || !arrayContainsSomething(colVisibilityArr)) {
      return true;
   }
   const colVisibilityObj = getObjectFromArrayByKeyValue('index', colIndex, colVisibilityArr);
   return isSomething(colVisibilityObj) ? colVisibilityObj.isVisible : true;
});

/* isFirstColumn for use by Sheet.js */
export const isFirstColumn = cellKey => /.*_0$/.test(cellKey); //the cellKey should end with _0 indicating the first column

export const isLastColumn = R.curry((totalColumns, cellKey) => {
   const { column } = extractRowColFromCellKey(cellKey);
   return column === totalColumns - 1;
});

export const getAxisVisibilityName = axis => R.concat(axis, 'Visibility'); // will be "rowVisibility" or "columnVisibility"

/**** isLastVisibleItemInAxis and related functions ****/
const findHighestVisibleItem = R.curry((currentIndex, visibilityArr) => {
   const isVisibleAtCurrentIndex = getObjectFromArrayByKeyValue('index', currentIndex, visibilityArr).isVisible;
   if (currentIndex === 0 || isVisibleAtCurrentIndex) {
      return currentIndex;
   }
   return findHighestVisibleItem(currentIndex - 1, visibilityArr);
});

const getAxisIndex = R.curry((axis, cellKey) => R.prop(axis, extractRowColFromCellKey(cellKey)));

const arrayIsNothing = array => isNothing(array) || !arrayContainsSomething(array);

const getVisibilityArr = R.curry((axis, state) => R.pipe(getAxisVisibilityName, stateMetadataProp(state))(axis));

export const isLastVisibleItemInAxis = R.curry((axis, totalInAxis, state, cellKey) => {
   const endIndex = totalInAxis - 1;
   return R.ifElse(
      // if the visiblity object is empty
      R.pipe(
         getVisibilityArr(axis), //receives state
         arrayIsNothing
      ),
      // then compare the index of the last item to the current index
      R.pipe(
         R.thunkify(getAxisIndex)(axis, cellKey), // ignores sheet parameter sent to it
         R.equals(endIndex) // receives axis index
      ),
      // else find the index of the highest visible item and compare that to the current index
      R.pipe(
         getVisibilityArr(axis), //receives state
         findHighestVisibleItem(endIndex), // receives visibilityArr
         R.equals(getAxisIndex(axis, cellKey)) // receives highest visible's index
      )
   )(state);
});

// TOOD  consolidatethe 2 maps into 1 function
const mapWithUpdatedFilter = axis =>
   R.map(filter => {
      return updatedFilter({
         filterExpression: filterFilterExpression(filter),
         caseSensitive: filterCaseSensitive(filter),
         regex: filterRegex(filter),
         showFilterModal: false,
         rowIndex: axis === ROW_AXIS ? filterIndex(filter) : null,
         colIndex: axis === COLUMN_AXIS ? filterIndex(filter) : null,
      });
   });

export const applyFilters = sheet => {
   R.pipe(dbRowFilters, mapWithUpdatedFilter(ROW_AXIS))(sheet);
   R.pipe(dbColumnFilters, mapWithUpdatedFilter(COLUMN_AXIS))(sheet);
};
