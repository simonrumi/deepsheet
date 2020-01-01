import * as R from 'ramda';
import { extractRowColFromCellKey } from './index';
//import * as RWrap from './ramdaWrappers'; // use this for debugging only

const isRowVisibilityInSheet = R.curry((sheet, rowColObj) => R.hasPath(['rowVisibility', rowColObj.row], sheet));

const getRowVisibilityFromSheet = R.curry((sheet, rowColObj) => sheet.rowVisibility[rowColObj.row]);

const rowIsVisible = sheet =>
	R.pipe(
		extractRowColFromCellKey,
		R.both(isRowVisibilityInSheet(sheet), getRowVisibilityFromSheet(sheet)),
		R.tap(console.log)
	);

export const shouldShowRow = R.curry((sheet, cellKey) =>
	R.or(R.isEmpty(sheet.rowVisibility), rowIsVisible(sheet)(cellKey))
);

export const nothing = () => null;

export const isFirstColumn = cellKey => /.*_0$/.test(cellKey); //the cellKey should end with _0 indicating the first column
