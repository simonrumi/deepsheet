import * as R from 'ramda';
import { UPDATED_SHEET_ID } from '../actions/types';
import { fetchSheet } from '../services/sheetServices';
import { fetchedSheet, updatedCellKeys } from '../actions';
import { createCellReducers, populateCellsInStore } from '../reducers/cellReducers';

export default store => next => async action => {
	if (!action) {
		//console.log('WARNING: initializeSheet received action', action);
		return;
	}
	switch (action.type) {
		case UPDATED_SHEET_ID:
			console.log('UPDATED_SHEET_ID, got id ', action.payload);
			const newSheetId = action.payload;
			try {
				const sheet = await fetchSheet(newSheetId);
				// if sheet has some data then dispatch the fetchedSheet action
				// note that R.juxt applies the argument sheet to both fns in its array
				R.when(
					R.pipe(
						R.isNil,
						R.not
					),
					R.juxt([
						R.pipe(
							fetchedSheet,
							store.dispatch
						),
						initializeCells,
					])
				)(sheet);
			} catch (err) {
				console.log('failed to fetchSheet', err);
				return {};
			}
			// const sheet = await fetchSheet(newSheetId).catch(err => {
			// 	console.log('failed to fetchSheet', err);
			// 	return {};
			// });
			// console.log('initializeSheet, called fetchSheet, received sheet', sheet);
			// store.dispatch(fetchedSheet(sheet));
			// console.log('after fetchSheet state =', store.getState());
			// initializeCells(sheet);
			break;
		default:
	}
	return next(action);
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
	return R.reduce(
		(accumulator, row) => {
			const rowOfCells = R.map(cell => 'cell_' + cell.row + '_' + cell.column, row.columns);
			return R.concat(accumulator, rowOfCells);
		},
		[], // starting value for accumulator
		rows
	);
};
