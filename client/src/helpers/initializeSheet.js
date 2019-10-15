import { map, reduce, concat } from 'ramda';
import { UPDATED_SHEET_ID, FETCHED_SHEET } from '../actions/types';
import { fetchSheet } from './index';
import { fetchedSheet, updatedCellKeys, populateCellsInStore } from '../actions';
import { createCellReducers } from '../reducers/cellReducers';

// QQQQQ problem is that the store doesn't seem to realize that we called fetchedSheet & updatedCellKeys
// the cellKeys are not updated in the store, neither are the title and the sheet

export default store => next => async action => {
	switch (action.type) {
		case UPDATED_SHEET_ID:
			const newSheetId = action.payload;
			if (newSheetId !== store.getState().sheetId) {
				// console.log('updated_sheet_id action', action);
				// console.log('...and store.getState() is:', store.getState());
				const sheet = await fetchSheet(newSheetId);
				fetchedSheet(sheet);
				initializeCells(sheet);
			}
			break;
		case FETCHED_SHEET:
			console.log('fetched_sheet action:', action);
			break;
	}

	let result = next(action);
	console.log('next state', store.getState());
	return result;
};

const initializeCells = sheet => {
	if (sheet.metadata) {
		createCellReducers(sheet.metadata);
		populateCellsInStore(sheet);
		updatedCellKeys(createCellKeys(sheet.rows));
	} else {
		console.log('WARNING: App.render.initializeCells had no data to operate on');
	}
};

// generates a flat array of all the key names to identify cells in the sheet
const createCellKeys = rows => {
	return reduce(
		(accumulator, row) => {
			const rowOfCells = map(cell => 'cell_' + cell.row + '_' + cell.column, row.columns);
			return concat(accumulator, rowOfCells);
		},
		[], // starting value for accumulator
		rows
	);
};
