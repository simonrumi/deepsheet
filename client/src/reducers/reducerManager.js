// see https://redux.js.org/recipes/code-splitting
import { filter, concat, includes, pick } from 'ramda';
import { combineReducers } from 'redux';

export function createReducerManager(initialReducers) {
	const reducers = { ...initialReducers };
	let combinedReducer = combineReducers(reducers);
	let keysToRemove = []; // a list of keys for reducers that have been removed

	// note that the functions below were taken out of the return{} block because removeMany was not able to access
	// keysToRemove[]

	// the root reducer
	const reduce = (state, action) => {
		const cleanedState = { ...state };
		if (keysToRemove.length > 0) {
			for (let key of keysToRemove) {
				delete cleanedState[key];
			}
			keysToRemove = [];
		}
		// this delegates the store.reduce() function to the
		// combinedReducer. Presumably the store calls reduce() for all actions
		console.log('reducerManager.reduce() about to return cleanedState', cleanedState);
		return combinedReducer(cleanedState, action);
	};

	const add = (key, newReducer) => {
		if (!key || reducers[key]) {
			return;
		}
		reducers[key] = newReducer;
		combinedReducer = combineReducers(reducers);
		return combinedReducer;
	};

	const addMany = newReducers => {
		if (!(newReducers instanceof Object)) {
			console.log('WARNING: addMany() did not receive any new reducers');
			return;
		}
		const allReducers = {
			...reducers,
			...newReducers,
		};
		combinedReducer = combineReducers(allReducers);
		// note that the original didn't do this, but looks like we do
		// because the calling function will then call store.replaceReducer()
		return combinedReducer;
	};

	const remove = key => {
		if (!key || !reducers[key]) {
			return;
		}
		delete reducers[key];
		keysToRemove.push(key); // side effect! should do this some other way

		combinedReducer = combineReducers(reducers);
		return combinedReducer;
	};

	const removeMany = keys => {
		if (!keys || !(keys instanceof Array)) {
			console.log('WARNING: invalid keys array supplied to reducerManager.removeMany(), so no reducers removed');
			return;
		}
		keysToRemove = concat(keysToRemove, keys);

		const filteredReducerKeys = filter(reducerKey => {
			if (includes(reducerKey, keys)) {
				return false;
			}
			return true;
		}, Object.keys(reducers));
		const remainingReducers = pick(filteredReducerKeys, reducers);
		combinedReducer = combineReducers(remainingReducers);
		return combinedReducer; // see note in addMany
	};

	return {
		getReducerMap: () => reducers,
		reduce,
		add,
		addMany,
		remove,
		removeMany,
	};
}
