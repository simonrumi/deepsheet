import * as R from 'ramda';
import { extractRowColFromCellKey } from './index';
//import * as RWrap from './ramdaWrappers'; // use this for debugging only

/**** figure out how many rows and columns are hidden due to filtering, for use by Sheet.js ****/
// TODO this should be numHiddenByAxis(sheet, axis)
const numOfHiddenRows = sheet =>
   R.reduce(
      (accumulator, value) => (value ? accumulator + 1 : accumulator),
      0,
      sheet.rowVisibilty
   );

/**** row filtering, for use by Sheet.js, *****/
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

export const isFirstColumn = cellKey => /.*_0$/.test(cellKey); //the cellKey should end with _0 indicating the first column

/***** column filtering, for use by ColumnHeaders.js ****
 * these functions are similar to the row filtering ones above, but different due to the
 * different structure of data available to ColumnHeaders.js compared with Sheet.js,
 * consequently it doesn't seem worthwhile trying to generalize any of these functions
 */
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
