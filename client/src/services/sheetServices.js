import * as R from 'ramda';
import axios from 'axios';
import managedStore from '../store';
import { updatedSheetId } from '../actions';
import sheetQuery from '../queries/sheetQuery';
import titleMutation from '../queries/titleMutation'; // TODO only need one of these
import { GRAPHQL_URL } from '../constants';

/***
Need to have these impure functions for dealing with memoizedItems.
Can't put memoizedItems into the Redux store because then there's a circular dependancy
where this file imports an update action, and actions imports fetchSummaryCellFromSheet
***/
console.log(
   'TODO might be able to put memoizedItems into the store, now that fetchSummaryCellFromSheet is not being used. See comment in sheetServices.js'
);
const memoizedItems = {};

const updatedMemoizedItems = R.curry((groupName, item) => {
   memoizedItems[groupName] = { ...memoizedItems[groupName], ...item };
   return item; // passing this through
});

export const clearMemoizedItems = () =>
   R.pipe(
      R.keys,
      R.map(key => (memoizedItems[key] = {}))
   )(memoizedItems);
/*** end impure functions ***/

// these args (arg1, ...args) are the args for the fn.
// the first one is split out of the args array so that R.curry is forced to return a function,
// if there is not at least 1 argument supplied to maybeMemoize, (after the 1st argument which is the fn).
//
// make memoized items with functions like this
// export const fetchSummaryCellFromSheet = maybeMemoize(async sheetId => {
// ...then call that function like this
// fetchSummaryCellFromSheet(sheetId)
const maybeMemoize = R.curry((fn, groupName, arg1, ...args) => {
   const key = R.reduce((accumulator, value) => R.concat(accumulator, JSON.stringify(value)), '', [arg1, ...args]);

   if (R.hasPath([groupName, key], memoizedItems)) {
      return R.ifElse(
         () => memoizedItems[groupName][key].forceUpdate,
         fn, //fn is fed the args
         () => R.path([groupName, key, 'value'], memoizedItems)
      )(arg1, ...args);
   }

   return R.pipe(
      fn, // get the result from calling the fn with the args
      R.assoc('value', R.__, { forceUpdate: false }), //create an obj with value: result
      R.assoc(key, R.__, {}), // create a parent obj with key: obj
      updatedMemoizedItems(groupName), // put parent obj into memoizedItems and return the item
      R.path([key, 'value']) // return the result (of calling fn with the args)
   )(arg1, ...args);
});

export const fetchSheet = async id => {
   const sheet = await axios
      .post(
         GRAPHQL_URL,
         {
            query: sheetQuery,
            variables: { id },
         },
         {
            headers: {
               'Content-Type': 'application/json',
            },
         }
      )
      .then(res => res.data.data.sheet)
      .catch(err => console.log('error in sheetServices.fetchSheet', err));
   return sheet;
};

export const updateTitleInDB = async (id, title) => {
   return await titleMutation(id, title);
};

export const loadSheet = async sheetId => {
   // first clear out the cell reducers from any previosly loaded sheet
   const newCombinedReducers = managedStore.store.reducerManager.removeMany(managedStore.state.cellKeys);
   managedStore.store.replaceReducer(newCombinedReducers);
   clearMemoizedItems();
   // then get the new sheet
   updatedSheetId(sheetId);
};
