import * as R from 'ramda';
import { indexToColumnLetter, indexToRowNumber, THIN_COLUMN } from './index';

export const cellBaseClasses = () => 'grid-item text-dark-dark-blue border-t border-l ';
export const createClassNames = classes => R.concat(cellBaseClasses(), classes ? classes : '');

export const getRowNumFromObj = obj => (R.isNil(obj) ? null : R.has('row') ? obj.row : null);

export const getColNumFromObj = obj => (R.isNil(obj) ? null : R.has('column') ? obj.column : null);

// const isLast = R.curry((total, currentIndex) => total - 1 === currentIndex);

//cellId is e.g. "B2"
export const createCellId = (colIndex, rowIndex) =>
	R.concat(
		indexToColumnLetter(colIndex),
		R.pipe(
			indexToRowNumber,
			R.toString
		)(rowIndex)
	);

export const renderWholeRowGridSizingStyle = numCols => {
	const rowsStyle = 'repeat(1, 1.5em)';
	const columnsStyle = THIN_COLUMN + ' repeat(' + numCols + ', 1fr) ' + THIN_COLUMN;
	return {
		gridTemplateRows: rowsStyle,
		gridTemplateColumns: columnsStyle,
	};
};
