import * as R from 'ramda';
import { extractRowColFromCellKey, capitalizeFirst } from './index';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';
//import * as RWrap from './ramdaWrappers'; // use this for debugging only

// not for use in by any functions here, just for export
export const getAxisFilterName = axis => R.concat(axis, 'Filters');

/****
 * create values to populate sheet.rowFilters and sheet.columnFilters, for use by reducers/index.js
 ****/
const createFilterObjKey = filterData =>
   filterData.rowIndex || filterData.colIndex;

const createFilterObj = filterData =>
   R.omit(['showFilterModal', 'colIndex', 'rowIndex'], filterData);

const checkFilterData = R.converge(R.and, [
   R.has('rowIndex'),
   R.has('colIndex'),
]);

const checkedFilterObj = R.ifElse(checkFilterData, createFilterObj, () => null);

export const getFilterName = filterData =>
   R.prop('rowIndex', filterData) ? 'rowFilters' : 'columnFilters';

const updateFilterValue = (filterData, sheet) =>
   R.assoc(
      createFilterObjKey(filterData),
      checkedFilterObj(filterData),
      sheet[getFilterName(filterData)]
   );

export const replaceFilterEntry = (filterData, sheet) =>
   R.assoc(
      getFilterName(filterData),
      updateFilterValue(filterData, sheet),
      sheet
   );

/****
 * figure out how many rows or columns are hidden due to filtering, for use by Sheet.js & ColumnHeaders.js
 ****/
const confirmAxis = axis =>
   axis === ROW_AXIS || axis === COLUMN_AXIS ? axis : '';

export const getVisibilityForAxis = (axis, sheet) =>
   R.pipe(
      confirmAxis,
      R.concat(R.__, 'Visibility'),
      R.prop(R.__, sheet)
   )(axis);

const numHiddenItems = R.reduce(
   (accumulator, value) => (!value ? accumulator + 1 : accumulator),
   0,
   R.__
);

const getNumHiddenItemsForAxis = R.pipe(
   getVisibilityForAxis,
   R.values,
   numHiddenItems
);

const pluralizeTail = R.pipe(
   R.tail,
   R.toLower,
   R.concat(R.__, 's')
);

const capitalizedPlural = R.converge(R.concat, [
   capitalizeFirst,
   pluralizeTail,
]);

// create either "totalRows" or "totalColumns" from the axis which will be either "row" or "column"
const createTotalsKey = axis =>
   confirmAxis(axis)
      ? R.pipe(
           capitalizedPlural,
           R.concat('total')
        )(axis)
      : null;

export const getTotalForAxis = R.curry(
   (axis, sheet) => sheet[createTotalsKey(axis)] || 0
); //returning 0 if the totalsKey is bogus)

export const getRequiredNumItemsForAxis = (axis, sheet) => {
   const visibleItems = R.converge(R.subtract, [
      getTotalForAxis,
      getNumHiddenItemsForAxis,
   ])(axis, sheet);
   if (typeof visibleItems === 'number') {
      return visibleItems;
   }
   return visibleItems;
};

/****
 * row visibility, for use by Sheet.js
 *****/
const isRowVisibilityInSheet = R.curry((sheet, rowColObj) =>
   R.hasPath(['rowVisibility', rowColObj.row], sheet)
);

const getRowVisibilityFromSheet = R.curry(
   (sheet, rowColObj) => sheet.rowVisibility[rowColObj.row]
);

const rowIsVisible = sheet =>
   R.pipe(
      extractRowColFromCellKey,
      R.both(isRowVisibilityInSheet(sheet), getRowVisibilityFromSheet(sheet))
   );

export const shouldShowRow = R.curry((sheet, cellKey) =>
   R.or(R.isEmpty(sheet.rowVisibility), rowIsVisible(sheet)(cellKey))
);

/*****
 * column visibility, for use by ColumnHeaders.js.
 * These functions are similar to the row filtering ones above, but different due to the
 * different structure of data available to ColumnHeaders.js compared with Sheet.js,
 * consequently it doesn't seem worthwhile trying to generalize any of these functions
 ****/
const getColumnVisibility = (colVisibilityObj, colIndex) =>
   colVisibilityObj[colIndex];

const isColumnVisibilityInObject = (colVisibilityObj, colIndex) =>
   R.has(colIndex, colVisibilityObj);

const columnIsVisible = R.both(isColumnVisibilityInObject, getColumnVisibility);

export const shouldShowColumn = R.curry((colVisibilityObj, colIndex) =>
   R.or(
      R.isEmpty(colVisibilityObj),
      columnIsVisible(colVisibilityObj, colIndex)
   )
);

/* isFirstColumn for use by Sheet.js */
export const isFirstColumn = cellKey => /.*_0$/.test(cellKey); //the cellKey should end with _0 indicating the first column

export const isLastColumn = R.curry((totalColumns, cellKey) => {
   const { column } = extractRowColFromCellKey(cellKey);
   return column === totalColumns - 1;
});

export const getAxisVisibilityName = axis => R.concat(axis, 'Visibility'); // will be "rowVisibility" or "columnVisibility"

/**** isLastVisibleItemInAxis and related functions ****/
const findHighestVisibleItem = R.curry((currentIndex, visibilityObj) => {
   if (currentIndex === 0 || visibilityObj[currentIndex]) {
      return currentIndex;
   }
   return findHighestVisibleItem(currentIndex - 1, visibilityObj);
});

const getAxisIndex = R.curry((axis, cellKey) =>
   R.prop(axis, extractRowColFromCellKey(cellKey))
);

const getVisibilityObjFromSheet = R.curry((axis, sheet) =>
   R.pipe(
      getAxisVisibilityName,
      R.prop(R.__, sheet)
   )(axis)
);

export const isLastVisibleItemInAxis = R.curry(
   (axis, totalInAxis, sheet, cellKey) => {
      const endIndex = totalInAxis - 1;
      return R.ifElse(
         // if the visiblity object is empty
         R.pipe(
            getVisibilityObjFromSheet(axis), //receives sheet
            R.isEmpty
         ),
         // then compare the index of the last item to the current index
         R.pipe(
            R.thunkify(getAxisIndex)(axis, cellKey), // ignores sheet parameter sent to it
            R.equals(endIndex) // receives axis index
         ),
         // else find the index of the highest visible item and compare that to the current index
         R.pipe(
            getVisibilityObjFromSheet(axis), // receives sheet
            findHighestVisibleItem(endIndex), // receives visibilityObj
            R.equals(getAxisIndex(axis, cellKey)) // receives highest visible's index
         )
      )(sheet);
   }
);
