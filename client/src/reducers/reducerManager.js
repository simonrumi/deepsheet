// see https://redux.js.org/recipes/code-splitting
import { combineReducers } from 'redux';
import { createCellReducers } from '../helpers';
import store from '../store';

export default function(initialReducers) {
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
         return combinedReducer(state, action);
      },

      add: (key, newReducer) => {
         if (!key || reducers[key]) {
            return;
         }
         reducers[key] = newReducer;
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
         const newCombinedReducers = combineReducers(allReducers);
         return newCombinedReducers;
      },

      remove: key => {
         if (!key || !reducers[key]) {
            return;
         }
         delete reducers[key];
         keysToRemove.push(key); // side effect! should do this some other way
         combinedReducer = combineReducers(reducers);
      },
   };
}

export const generateCellReducers = sheetMetadata => {
   const cellReducers = createCellReducers(
      sheetMetadata.totalRows,
      sheetMetadata.totalColumns
   );
   if (!store || !store.reducerManager) {
      console.log(
         'ERROR: generateCellReducers failed as there was no store.reducerManager'
      );
      return;
   }
   const newCombinedReducers = store.reducerManager.addMany(cellReducers);
   store.replaceReducer(newCombinedReducers);
};
