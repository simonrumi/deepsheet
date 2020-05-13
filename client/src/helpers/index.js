import * as R from 'ramda';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';

export const nothing = () => null;

export const isString = R.pipe(
   R.type,
   R.equals('String')
);

export const isObject = R.pipe(
   R.type,
   R.equals('Object')
);

// like R.hasPath but returns either the thing at the given path or null
export const maybeHasPath = (path, obj) =>
   R.isNil(obj) ? null : R.hasPath(path, obj) ? R.path(path, obj) : null;

const makeArr = length => new Array(length);
export const mapWithIndex = R.addIndex(R.map);

// when you want to map, but you don't have an array, just a number of times to run the function supplied to map
// the function gets the index as a param each time
// returns an array
export const forLoopMap = (fn, length) =>
   mapWithIndex((val, index) => fn(index), makeArr(length));

export const reduceWithIndex = R.addIndex(R.reduce);

// when you want to reduce, but you don't have an array, just a number of times to run the function supplied to reduce
// the function gets the params (accumulator, index)
// returns the final result collected by the accumulator
export const forLoopReduce = (fn, initialVal, length) =>
   reduceWithIndex(
      (accumulator, value, index) => fn(accumulator, index),
      initialVal,
      makeArr(length)
   );

export const isNothing = R.either(R.isNil, R.isEmpty);
export const isSomething = R.pipe(
   isNothing,
   R.not
);

// use like this:
// runIfSomething(myFn, thingToTest, extraParameters)
// if the thingToTest exists and is not empty, myFn will run, having the thingToTest and extraParameters passed to it
export const runIfSomething = (fn, thing, ...args) =>
   R.when(
      R.both(
         R.pipe(
            R.isNil,
            R.not
         ),
         R.pipe(
            R.isEmpty,
            R.not
         )
      ),
      R.thunkify(fn)(thing, ...args),
      thing
   );

export const capitalizeFirst = R.pipe(
   R.head,
   R.toUpper
);

export const capitalCase = R.converge(R.concat, [
   capitalizeFirst,
   R.pipe(
      R.tail,
      R.toLower
   ),
]);

// this was used byt the old Editor.js ...shouldn't be needed now
// export const removePTags = str => {
//    return str.replace(/<p>|<\/p>/gi, '');
// };

export const indexToColumnLetter = index => {
   let num = index + 1; // counting from 1, A = 1, Z = 26
   const getPlaceValue = (num, placeValues = []) => {
      const BASE = 26;
      let remainder = num % BASE;
      let quotient = Math.floor(num / BASE);
      if (remainder === 0) {
         // quirk of the lettering system is that there is no equivalent of zero
         // ie there is no equivalent of  the decimal "10" because we have "AA"
         // instead of "A0". So these 2 lines do the equivalent of skipping from
         // "9" to "11"
         remainder = BASE;
         quotient = quotient - 1;
      }
      if (quotient === 0) {
         return [remainder, ...placeValues];
      }
      return getPlaceValue(quotient, [remainder, ...placeValues]);
   };
   const placeValues = getPlaceValue(num);

   const UPPERCASE_CODE_OFFSET = 64; // 65 is "A" but we want to add to map to "A"
   const columnLetters = placeValues.reduce((accumulator, currentValue) => {
      return (
         accumulator + String.fromCharCode(currentValue + UPPERCASE_CODE_OFFSET)
      );
   }, '');
   return columnLetters;
};

export const indexToRowNumber = index => {
   return parseInt(index, 10) + 1;
};

export const extractRowColFromCellKey = str => {
   // expecting a string like some_prefix_2_3
   //where 2 & 3 are the row and column numbers respectively
   const regex = new RegExp(/.*_(\d+)_(\d+)$/);
   const matchArr = regex.exec(str);
   if (!matchArr || matchArr.length < 3) {
      return;
   }
   const row = parseInt(matchArr[1]);
   const column = parseInt(matchArr[2]);
   const rowColObj = {};
   rowColObj[ROW_AXIS] = row;
   rowColObj[COLUMN_AXIS] = column;
   return rowColObj;
};

// impure function to help with debugging
export const trace = R.curry((tag, x) => {
   console.log(tag, x);
   return x;
});
