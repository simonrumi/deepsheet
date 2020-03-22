import * as R from 'ramda';

/*** need to have these impure functions for dealing with memoizedItems ***/
let memoizedItems = {};

export const updatedMemoizedItems = item => {
   memoizedItems[R.keys(item)[0]] = R.values(item)[0];
};

export const clearMemoizedItems = () => {
   memoizedItems = {};
};
/*** end impure functions ***/

// these args (arg1, ...args) are the args for the fn.
// the first one is split out of the args array so that R.curry is forced to return a function,
// if there is not at least 1 argument supplied to maybeMemoize, (after the 1st argument which is the fn).
// See fetchSummaryCellFromSheet below for how this works
const maybeMemoize = R.curry((fn, arg1, ...args) => {
   const key = R.reduce(
      (accumulator, value) => R.concat(accumulator, JSON.stringify(value)),
      '',
      [arg1, ...args]
   );
   if (R.has(key, memoizedItems)) {
      if (memoizedItems[key].forceUpdate) {
         return fn(arg1, ...args);
      }
      return R.path([key, 'value'], memoizedItems);
   }
   const result = fn(arg1, ...args);

   updatedMemoizedItems(
      R.assoc(key, { value: result, forceUpdate: false }, {})
   );
   return result;
});

// use like this:
// fetchSummaryCellFromSheet(sheetId)
export const fetchSummaryCellFromSheet = maybeMemoize(sheetId => {
   // the idea here is to use the database to look up the sheet with the given sheetId and return the content of the
   // cell designated as the summaryCell
   // however for the moment we'll just return some fake data
   console.log('called fetchSummaryCellFromSheet');
   if (sheetId === 2) {
      return 'summary of sheet with id 2';
   }
   return null;
});
