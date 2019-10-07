import { map } from 'ramda';
import { updatedCell } from '../actions';

export const createCellReducers = (totalRows, totalCols) => {
	const cellReducers = {};
	for (let row = 0; row < totalRows; row++) {
		for (let col = 0; col < totalCols; col++) {
			cellReducers['cell_' + row + '_' + col] = cellReducerFactory(row, col);
		}
	}
	return cellReducers;
};

export const cellReducerFactory = (rowNum, colNum) => {
	return (state = {}, action) => {
		console.log('called cellReducer, rowNum:' + rowNum + ', colNum:' + colNum);
		console.log('...state:', state);
		console.log('...action:', action);
		if (!action || !action.type) {
			return state;
		}
		// action.type will be something like UPDATE_CELL_r_c where r = row num, c = col num
		const typeRegex = new RegExp(/.*_(\d+)_(\d+)$/);
		const matchArr = typeRegex.exec(action.type);
		if (!matchArr || matchArr.length < 3) {
			return state;
		}
		const typeRowNum = parseInt(matchArr[1]);
		const typeColNum = parseInt(matchArr[2]);
		if (typeRowNum === rowNum && typeColNum === colNum) {
			return action.payload;
		}
		return state;
	};
};

export const populateCellsInStore = sheet => {
	const getCellsFromRow = row => {
		for (let index in row.columns) {
			updatedCell(row.columns[index]);
		}
	};
	map(getCellsFromRow, sheet.rows);
};
