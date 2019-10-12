import managedStore from '../store';
import { extractRowColFromString } from '../helpers';

// temp for testing
import { UPDATED_CELL_KEYS } from '../actions/types';

export const createCellReducers = sheetMetadata => {
	const store = managedStore.store;
	const cellReducers = {};
	for (let row = 0; row < sheetMetadata.totalRows; row++) {
		for (let col = 0; col < sheetMetadata.totalColumns; col++) {
			cellReducers['cell_' + row + '_' + col] = cellReducerFactory(row, col);
		}
	}
	if (!store || !store.reducerManager) {
		console.log('ERROR: generateCellReducers failed as there was no store.reducerManager');
		return;
	}
	const newCombinedReducer = store.reducerManager.addMany(cellReducers);
	return newCombinedReducer;
};

export const cellReducerFactory = (rowNum, colNum) => {
	return (state = {}, action) => {
		if (!action || !action.type) {
			return state;
		}
		const numsFromType = extractRowColFromString(action.type);
		if (numsFromType && numsFromType.row === rowNum && numsFromType.col === colNum) {
			return action.payload;
		}
		return state;
	};
};

export const cellKeyReducer = (state = {}, action) => {
	switch (action.type) {
		case UPDATED_CELL_KEYS:
			return action.payload;
		default:
			return state;
	}
};
