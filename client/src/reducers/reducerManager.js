// see https://redux.js.org/recipes/code-splitting
import * as R from 'ramda';
import { combineReducers } from 'redux';
import undoReducer from './undoReducer';

/// TODO a bunch of redundant/unnecessary updating of reducers going on here....clean up

export function createReducerManager(initialReducers) {
   let _reducers = { ...initialReducers };

   // Note that a reducer expects arguments state & action [state ~= accumulator, action ~= value]
   // and returns an updated state.
   // combineReducers takes all the reducers and returns a function that also expects state & action
   // and that function gives all the reducers a chance to update their slice of the state
   // so here the _reducersCombined function, returned from combineReducers, acts like a reducer itself - in fact it is the root reducer
   
   const wrapAndCombineReducers = reducers => R.compose(undoReducer, combineReducers)(reducers);

   // let _reducersCombined = combineReducers(_reducers);
   let _reducersCombined = wrapAndCombineReducers(_reducers);
   let keysToRemove = []; // a list of keys for reducers that have been removed

   // this now becomes the root reducer
   // it returns the combined (ie root) reducer after having added/removed any new sub-reducers
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
      // _reducersCombined. Presumably the store calls reduce() for all actions
      return _reducersCombined(cleanedState, action);
   };

   const add = (key, newReducer) => {
      if (!key || _reducers[key]) {
         return;
      }
      _reducers[key] = newReducer;
      // _reducersCombined = combineReducers(_reducers);
      _reducersCombined = wrapAndCombineReducers(_reducers);
      return _reducersCombined;
   };

   const addMany = newReducers => {
      if (!(newReducers instanceof Object)) {
         console.log('WARNING: addMany() did not receive any new reducers');
         // return combineReducers(_reducers);
         return wrapAndCombineReducers(_reducers);
      }
      const allReducers = {
         ..._reducers,
         ...newReducers,
      };
      // _reducersCombined = combineReducers(allReducers);
      _reducersCombined = wrapAndCombineReducers(allReducers);
      _reducers = allReducers;
      // return combineReducers(allReducers);
      return wrapAndCombineReducers(allReducers);
   };

   const remove = key => {
      if (!key || !_reducers[key]) {
         return;
      }
      delete _reducers[key];
      keysToRemove.push(key);

      _reducersCombined = wrapAndCombineReducers(_reducers);
      return _reducersCombined;
   };

   const removeMany = keys => {
      if (!keys || !(keys instanceof Array)) {
         console.log('WARNING: invalid keys array supplied to reducerManager.removeMany(), so no reducers removed');
         return wrapAndCombineReducers(_reducers);
      }
      keysToRemove = R.concat(keysToRemove, keys);

      const filteredReducerKeys = R.filter(reducerKey => {
         if (R.includes(reducerKey, keys)) {
            return false;
         }
         return true;
      }, Object.keys(_reducers));
      const remainingReducers = R.pick(filteredReducerKeys, _reducers);
      _reducersCombined = wrapAndCombineReducers(remainingReducers);
      _reducers = remainingReducers;
      return _reducersCombined;
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
