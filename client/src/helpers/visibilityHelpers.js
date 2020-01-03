import * as R from 'ramda';
import { extractRowColFromCellKey, ROW_AXIS, COLUMN_AXIS } from './index';
//import * as RWrap from './ramdaWrappers'; // use this for debugging only

/**** figure out how many rows or columns are hidden due to filtering, for use by Sheet.js & ColumnHeaders.js ****/
const confirmAxis = axis => (axis === ROW_AXIS || axis === COLUMN_AXIS ? axis : '');

const getVisibilityForAxis = (axis, sheet) =>
	R.pipe(
		confirmAxis,
		R.concat(R.__, 'Visibility'),
		R.prop(R.__, sheet)
	)(axis);

const numHiddenItems = R.reduce((accumulator, value) => (!value ? accumulator + 1 : accumulator), 0, R.__);

const getNumHiddenItemsForAxis = R.pipe(
	getVisibilityForAxis,
	R.values,
	numHiddenItems
);

const capitalizeFirst = R.pipe(
	R.head,
	R.toUpper
);

const pluralizeTail = R.pipe(
	R.tail,
	R.toLower,
	R.concat(R.__, 's')
);

const capitalizedPlural = R.converge(R.concat, [capitalizeFirst, pluralizeTail]);

const createTotalsKey = axis =>
	confirmAxis(axis)
		? R.pipe(
				capitalizedPlural,
				R.concat('total')
		  )(axis)
		: null;

const totalForAxis = (axis, sheet) => sheet[createTotalsKey(axis)] || 0; //returning 0 if the totalsKey is bogus

export const getRequiredNumItemsForAxis = (axis, sheet) =>
	R.converge(R.subtract, [totalForAxis, getNumHiddenItemsForAxis])(axis, sheet);

/**** row filtering, for use by Sheet.js, *****/
const isRowVisibilityInSheet = R.curry((sheet, rowColObj) => R.hasPath(['rowVisibility', rowColObj.row], sheet));

const getRowVisibilityFromSheet = R.curry((sheet, rowColObj) => sheet.rowVisibility[rowColObj.row]);

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
const getColumnVisibility = (colVisibilityObj, colIndex) => colVisibilityObj[colIndex];

const isColumnVisibilityInObject = (colVisibilityObj, colIndex) => R.has(colIndex, colVisibilityObj);

const columnIsVisible = R.both(isColumnVisibilityInObject, getColumnVisibility);

export const shouldShowColumn = (colVisibilityObj, colIndex) =>
	R.or(R.isEmpty(colVisibilityObj), columnIsVisible(colVisibilityObj, colIndex));
