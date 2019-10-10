// see https://redux.js.org/recipes/code-splitting
import { combineReducers } from 'redux';

export function createReducerManager(initialReducers) {
   const reducers = { ...initialReducers };
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

         // original said this
         combinedReducer = combineReducers(reducers);
         return combinedReducer;
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
         combinedReducer = combineReducers(allReducers);
         // note that the original didn't do this, but looks like we do
         // because the calling function will then call store.replaceReducer()
         return combinedReducer;
      },

      remove: key => {
         if (!key || !reducers[key]) {
            return;
         }
         delete reducers[key];
         keysToRemove.push(key); // side effect! should do this some other way

         combinedReducer = combineReducers(reducers);
         return combinedReducer;
      },
   };
}
