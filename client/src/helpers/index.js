import * as R from 'ramda';

export const nothing = () => null;

export const isString = R.pipe(R.type, R.equals('String'));

export const isObject = R.pipe(R.type, R.equals('Object'));

// like R.hasPath but returns either the thing at the given path or null
export const maybeHasPath = R.curry((path, obj) =>
   R.isNil(obj) ? null : R.hasPath(path, obj) ? R.path(path, obj) : null
);

const makeArr = length => new Array(length);
export const mapWithIndex = R.addIndex(R.map);

// when you want to map, but you don't have an array, just a number of times to run the function supplied to map
// the function gets the index as a param each time
// returns an array
export const forLoopMap = (fn, length) => mapWithIndex((val, index) => fn(index), makeArr(length));

export const reduceWithIndex = R.addIndex(R.reduce);

// when you want to reduce, but you don't have an array, just a number of times to run the function supplied to reduce
// the function gets the params (accumulator, index)
// returns the final result collected by the accumulator
export const forLoopReduce = (fn, initialVal, length) =>
   reduceWithIndex((accumulator, value, index) => fn(accumulator, index), initialVal, makeArr(length));

export const isNothing = R.either(R.isNil, R.isEmpty);
export const isSomething = R.pipe(isNothing, R.not);
export const arrayContainsSomething = arr => 
   isSomething(arr) && 
   R.reduce(
      (accumulator, arrItem) => accumulator || isSomething(arrItem), 
      false,
      arr
   );

// use like this:
// runIfSomething(myFn, thingToTest, extraParameters)
// if the thingToTest exists and is not empty, myFn will run, having the thingToTest and extraParameters passed to it
export const runIfSomething = (fn, thing, ...args) => 
   R.when(
      isSomething, 
      R.thunkify(fn)(thing, ...args), 
      thing
   );

export const concatAll = listOfLists => R.reduce(
      (accumulator, list) => R.concat(accumulator, list), 
      R.head(listOfLists)
   )(R.tail(listOfLists));

export const capitalizeFirst = R.pipe(R.head, R.toUpper);

export const capitalCase = R.converge(R.concat, [capitalizeFirst, R.pipe(R.tail, R.toLower)]);

export const pluralize = R.concat(R.__, 's');

export const getObjectFromArrayByKeyValue = R.curry((key, value, arr) =>
   isSomething(arr) ? R.find(item => isObject(item) && R.propEq(key, value, item), arr) || null : null
);

export const removeObjectFromArrayByKeyValue = R.curry((key, value, arr) =>
   isNothing(arr)
      ? arr
      : R.reduce(
           (accumulator, currObj) =>
              isSomething(currObj[key]) && currObj[key] === value ? accumulator : R.append(currObj, accumulator),
           [],
           arr
        )
);

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
      return accumulator + String.fromCharCode(currentValue + UPPERCASE_CODE_OFFSET);
   }, '');
   return columnLetters;
};

export const indexToRowNumber = index => {
   return parseInt(index, 10) + 1;
};

/**
 * This is like currying except it is for functions that expect one argument, which is an object (same idea as an object containing optional properties)
 * This eliminates the issue of having to supply the arguments to a curried function in a particular order
 * But it requires that you supply a template of the arguments object when you curry the function. Use as follows:
 * const fooFn = ({a, b, c}) => a + b + c;
 * const template = { a: 1, b: 1, c: 1 };
 * const spicyFoo = spicyCurry(fooFn, template);
 * const partOfFoo = spicyFoo({b: 10});
 * partOfFoo({ a: 2, c: 3 }); // returns 15
 */
export const spicyCurry = R.curry((func, templateObj, argObj) => {
   const categorizedArgs = R.reduce(
      (accumulator, key) =>
         argObj[key] === undefined
            ? { ...accumulator, argsPending: R.assoc(key, templateObj[key], accumulator.argsPending) }
            : { ...accumulator, argsSupplied: R.assoc(key, argObj[key], accumulator.argsSupplied) },
      { argsSupplied: {}, argsPending: {} },
      Object.keys(templateObj)
   );
   if (R.isEmpty(categorizedArgs.argsPending)) {
      return func(categorizedArgs.argsSupplied);
   }
   const partialFunc = remainingArgs =>
      func({
         ...categorizedArgs.argsSupplied,
         ...remainingArgs,
      });
   return spicyCurry(partialFunc, categorizedArgs.argsPending);
});