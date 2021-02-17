// see https://redux.js.org/recipes/code-splitting
import * as R from 'ramda';
import { combineReducers } from 'redux';
import undoReducer from './undoReducer';

const createReducerManager = initialReducers => {
   // need to maintain a separate list of the unwrapped reducers for removeMany() below
   let _reducers = { ...initialReducers };

   // Note that a reducer expects arguments state & action [state ~= accumulator, action ~= value]
   // and returns an updated state.
   // combineReducers takes all the reducers and returns a function that also expects state & action
   // and that function gives all the reducers a chance to update their slice of the state
   const wrapAndCombineReducers = reducers => R.compose(undoReducer, combineReducers)(reducers);
   let _wrappedReducers = wrapAndCombineReducers(_reducers); // _wrappedReducers is now the root reducer
   const reduce = (state, action) => _wrappedReducers(state, action); // ...so calling reduce operates on _wrappedReducers

   // used by initializeSheet.js
   const addMany = newReducers => {
      if (!(newReducers instanceof Object)) {
         console.warn('WARNING: addMany() did not receive any new reducers');
         return wrapAndCombineReducers(_reducers);
      }
      const allReducers = {
         ..._reducers,
         ...newReducers,
      };
      _reducers = allReducers;
      _wrappedReducers = wrapAndCombineReducers(allReducers);
      return _wrappedReducers;
   };

   // using this when loading a new sheet, to get rid of the cell reducers for the old sheet
   const removeMany = keys => {
      if (!keys || !(keys instanceof Array)) {
         console.warn('WARNING: invalid keys array supplied to reducerManager.removeMany(), so no reducers removed');
         return wrapAndCombineReducers(_reducers);
      }
      const filteredReducerKeys = R.filter(reducerKey => {
         if (R.includes(reducerKey, keys)) {
            return false;
         }
         return true;
      }, Object.keys(_reducers));
      const remainingReducers = R.pick(filteredReducerKeys, _reducers);
      _reducers = remainingReducers;
      _wrappedReducers = wrapAndCombineReducers(remainingReducers);
      return _wrappedReducers;
   };

   return {
      getReducerMap: () => _reducers,
      reduce,
      addMany,
      removeMany,
   };
}

export { createReducerManager };
