import * as R from 'ramda';
import { extractRowColFromCellKey } from './index';
import * as RWrap from './ramdaWrappers';

const isRowVisibilityInSheet = R.curry((sheet, rowColObj) => R.hasPath(['rowVisibility', rowColObj.row], sheet));

const getRowVisibilityFromSheet = R.curry((sheet, rowColObj) => sheet.rowVisibility[rowColObj.row]);

const rowIsVisible = sheet =>
	R.pipe(
		extractRowColFromCellKey,
		R.both(isRowVisibilityInSheet(sheet), getRowVisibilityFromSheet(sheet))
	);

export const shouldShowRow = RWrap.curry(
	(sheet, cellKey) =>
		RWrap.or(
			RWrap.isEmpty(sheet.rowVisibility, 'isEmpty(sheet.rowVisibility)'),
			rowIsVisible(sheet)(cellKey),
			'shouldShowRow',
			false
		),
	'shouldShowRow'
);

export const nothing = () => null;

export const isFirstColumn = cellKey => /.*_0$/.test(cellKey);
