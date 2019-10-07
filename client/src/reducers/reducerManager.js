// see https://redux.js.org/recipes/code-splitting
import { combineReducers } from 'redux';
import { createCellReducers } from './cellReducers';
import managedStore from '../store';

export function createReducerManager(initialReducers) {
	const reducers = { ...initialReducers };
	debugger;
	//const store = managedStore.store;
	let combinedReducer = combineReducers(reducers);

	// a list of keys for reducers that have been removed
	let keysToRemove = [];

	return {
		getReducerMap: () => reducers,

		// the root reducer
		reduce: (state, action) => {
			const cleanedState = { ...state };
			if (keysToRemove.length > 0) {
				for (let key of keysToRemove) {
					delete cleanedState[key];
				}
				keysToRemove = [];
			}
			// this delegates the store.reduce() function to the
			// combinedReducer. Presumably the store calls reduce() for all actions
			return combinedReducer(cleanedState, action);
		},

		add: (key, newReducer) => {
			if (!key || reducers[key]) {
				return;
			}
			reducers[key] = newReducer;
			// if (store.replaceReducer) {
			// 	store.replaceReducer(combineReducers(reducers));
			// }

			// original said this
			combinedReducer = combineReducers(reducers);
		},

		addMany: newReducers => {
			if (!(newReducers instanceof Object)) {
				console.log('WARNING: addMany() did not receive any new reducers');
				return;
			}
			const allReducers = {
				...reducers,
				...newReducers,
			};
			// if (store.replaceReducer) {
			// 	store.replaceReducer(combineReducers(allReducers));
			// }
			combinedReducer = combineReducers(allReducers);
		},

		remove: key => {
			if (!key || !reducers[key]) {
				return;
			}
			delete reducers[key];
			keysToRemove.push(key); // side effect! should do this some other way
			// store.replaceReducer(combineReducers(reducers));

			// this is what is in the original, but the version above seems to work for addMany
			combinedReducer = combineReducers(reducers);
		},
	};
}

export const generateCellReducers = sheetMetadata => {
	const store = managedStore.store;
	const cellReducers = createCellReducers(sheetMetadata.totalRows, sheetMetadata.totalColumns);
	if (!store || !store.reducerManager) {
		console.log('ERROR: generateCellReducers failed as there was no store.reducerManager');
		return;
	}
	store.reducerManager.addMany(cellReducers);
};
