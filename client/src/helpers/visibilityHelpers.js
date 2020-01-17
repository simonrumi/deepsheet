import * as R from 'ramda';
import {
   extractRowColFromCellKey,
   capitalizeFirst,
   ROW_AXIS,
   COLUMN_AXIS,
} from './index';
//import * as RWrap from './ramdaWrappers'; // use this for debugging only

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

export const getRequiredNumItemsForAxis = (axis, sheet) =>
   R.converge(R.subtract, [getTotalForAxis, getNumHiddenItemsForAxis])(
      axis,
      sheet
   );

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

export const shouldShowColumn = (colVisibilityObj, colIndex) =>
   R.or(
      R.isEmpty(colVisibilityObj),
      columnIsVisible(colVisibilityObj, colIndex)
   );

/* isFirstColumn for use by QQQ */
export const isFirstColumn = cellKey => /.*_0$/.test(cellKey); //the cellKey should end with _0 indicating the first column
