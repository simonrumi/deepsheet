// reminder: thunk is used when reducers need to make async calls, because redux normally dispatches actions
// immediately. with thunk you can do the dispatch when you're ready
import reduxThunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { createReducerManager } from '../reducers/reducerManager';
import { staticReducers } from '../reducers';
import preprocess from '../middleware/preprocess';
import authorize from '../middleware/authorize';
import dbOperations from '../middleware/dbOperations';
import initializeSheet from '../middleware/initializeSheet';
import postProcess from '../middleware/postProcess';
import filterSheet from '../middleware/filterSheet';
import orderSheet from '../middleware/orderSheet';
import buildAxisSizing from '../middleware/buildAxisSizing';

class ManagedStore {
   constructor() {
      this._store = {};
   }

   get store() {
      return this._store;
   }

   get state() {
      return this._store.getState();
   }

   init() {
      const reducerManager = createReducerManager(staticReducers);
      this._store = createStore(
         reducerManager.reduce,
         applyMiddleware(
            reduxThunk, 
            preprocess, 
            authorize, 
            dbOperations, 
            initializeSheet,
            postProcess,
            orderSheet, 
            filterSheet,
            buildAxisSizing,
         ) //tried reduxThunk at the end, and at the start, unsure which is best
      );
      this._store.reducerManager = reducerManager;
   }
}

const managedStore = new ManagedStore();

export default managedStore;

// FYI: original version, without using redux dev tools or reducerManager:
// const store = createStore(reducers, {}, applyMiddleware(reduxThunk));
// (the middle object is an intial state)
