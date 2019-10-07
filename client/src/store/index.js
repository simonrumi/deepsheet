// thunk is used when reducers need to make async calls, because redux normally dispatches actions
// immediately. with thunk you can do the dispatch when you're ready
import reduxThunk from 'redux-thunk';

import { createStore, applyMiddleware, compose } from 'redux';
import { createReducerManager } from '../reducers/reducerManager';
import { staticReducers } from '../reducers';

class ManagedStore {
	constructor() {
		this._store = {};
		this._timestamp = new Date();
	}

	get store() {
		return this._store;
	}

	get timestame() {
		return this._timestamp;
	}

	init() {
		// this makes use of Redux Dev Tools extension for Chrome
		// https://github.com/zalmoxisus/redux-devtools-extension
		const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

		const reducerManager = createReducerManager(staticReducers);
		this._store = createStore(reducerManager.reduce, composeEnhancers(applyMiddleware(reduxThunk)));
		this._store.reducerManager = reducerManager;
	}
}

const managedStore = new ManagedStore();

export default managedStore;

// FYI: original version, without using redux dev tools or reducerManager:
// const store = createStore(reducers, {}, applyMiddleware(reduxThunk));
// (the middle object is an intial state)
