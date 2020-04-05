import * as R from 'ramda';
import axios from 'axios';

/***
Need to have these impure functions for dealing with memoizedItems.
Can't put memoizedItems into the Redux store because then there's a circular dependancy
where this file imports an update action, and actions imports fetchSummaryCellFromSheet
***/
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
// See fetchSummaryCellFromSheet below for how this works
const maybeMemoize = R.curry((fn, groupName, arg1, ...args) => {
   const key = R.reduce(
      (accumulator, value) => R.concat(accumulator, JSON.stringify(value)),
      '',
      [arg1, ...args]
   );

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

// use like this:
// fetchSummaryCellFromSheet(sheetId)
export const fetchSummaryCellFromSheet = maybeMemoize(async sheetId => {
   const subSheet = await axios.get('/api/sheets/' + sheetId);
   const summaryCellRow = subSheet.data.metadata.summaryCell.row;
   const summaryCellColumn = subSheet.data.metadata.summaryCell.column;
   return subSheet.data.rows[summaryCellRow].columns[summaryCellColumn].content;
}, 'summaryCells');

export const fetchSheet = async id => {
   const sheet = await axios.get('/api/sheets/' + id);
   return sheet.data;
};
