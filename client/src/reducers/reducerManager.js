// see https://redux.js.org/recipes/code-splitting
import { filter, concat, includes, pick } from 'ramda';
import { combineReducers } from 'redux';

export function createReducerManager(initialReducers) {
	console.log('createReducerManager started');
	let _reducers = { ...initialReducers };

	// Note that a reducer expects arguments state & action [state ~= accumulator, action ~= value]
	// and returns an updated state.
	// combineReducers takes all the reducers and returns a function that also expects state & action
	// and that function gives all the reducers a chance to update the state
	// so here the _reducerCombiner function returned from combineReducers acts like a reducer itself
	let _reducerCombiner = combineReducers(_reducers);
	let keysToRemove = []; // a list of keys for reducers that have been removed

	// note that the functions below were taken out of the return{} block because removeMany was not able to access
	// keysToRemove[]

	// the root reducer
	const reduce = (state, action) => {
		// make sure there are no reducers to be removed first
		let cleanedState = { ...state };
		if (keysToRemove.length > 0) {
			for (let key of keysToRemove) {
				delete cleanedState[key];
			}
			keysToRemove = [];
		}
		// this delegates the store.reduce() function to the
		// _reducerCombiner. Presumably the store calls reduce() for all actions
		return _reducerCombiner(cleanedState, action);
	};

	const add = (key, newReducer) => {
		if (!key || _reducers[key]) {
			return;
		}
		_reducers[key] = newReducer;
		_reducerCombiner = combineReducers(_reducers);
		return _reducerCombiner;
	};

	const addMany = newReducers => {
		if (!(newReducers instanceof Object)) {
			console.log('WARNING: addMany() did not receive any new reducers');
			return combineReducers(_reducers);
		}
		const allReducers = {
			..._reducers,
			...newReducers,
		};
		// const combineGivenReducers = combineReducers(allReducers);
		// // note that the original didn't do this, but looks like we do
		// // because the calling function will then call store.replaceReducer()
		// return combineGivenReducers;
		_reducerCombiner = combineReducers(allReducers);
		_reducers = allReducers;
		return combineReducers(allReducers);
	};

	const remove = key => {
		if (!key || !_reducers[key]) {
			return;
		}
		delete _reducers[key];
		keysToRemove.push(key);

		_reducerCombiner = combineReducers(_reducers);
		return _reducerCombiner;
	};

	const removeMany = keys => {
		if (!keys || !(keys instanceof Array)) {
			console.log('WARNING: invalid keys array supplied to reducerManager.removeMany(), so no reducers removed');
			return combineReducers(_reducers);
		}
		keysToRemove = concat(keysToRemove, keys);

		const filteredReducerKeys = filter(reducerKey => {
			if (includes(reducerKey, keys)) {
				return false;
			}
			return true;
		}, Object.keys(_reducers));
		const remainingReducers = pick(filteredReducerKeys, _reducers);
		_reducerCombiner = combineReducers(remainingReducers);
		_reducers = remainingReducers;
		return _reducerCombiner; // see note in addMany
	};

	return {
		getReducerMap: () => _reducers,
		reduce,
		add,
		addMany,
		remove,
		removeMany,
	};
}
