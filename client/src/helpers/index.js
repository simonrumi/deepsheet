import * as R from 'ramda';
import * as Sanct from 'sanctuary';

const SANCTUARY_TYPE_CHECKING_ON = false;

export const S = SANCTUARY_TYPE_CHECKING_ON ? Sanct : Sanct.unchecked;

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

// Not using this as of 5/10/21 but might be useful
// example: given start and end points (6,9) this makes an array [6,7,8]
export const makeArrOfIndices = (startingIndex, endingIndex) => forLoopMap(
   index => startingIndex + index, 
   endingIndex - startingIndex
);

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
   R.length(arr) > 0 &&
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

// each object is expected to have a key called 'index'
// this is designed for use with R.sort()
export const compareIndexValues = (obj1, obj2) => obj1.index < obj2.index
   ? -1
   : obj1.index > obj2.index
      ? 1
      : 0;

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
   return R.isEmpty(categorizedArgs.argsPending)
      ? func(categorizedArgs.argsSupplied)
      : spicyCurry(
         remainingArgs =>
         func({
            ...categorizedArgs.argsSupplied,
            ...remainingArgs,
         }),
      categorizedArgs.argsPending
      );
   /*if (R.isEmpty(categorizedArgs.argsPending)) {
      return func(categorizedArgs.argsSupplied);
   }
   const partialFunc = remainingArgs =>
      func({
         ...categorizedArgs.argsSupplied,
         ...remainingArgs,
      });
   return spicyCurry(partialFunc, categorizedArgs.argsPending);
   */
});

const maybeConvertBoolToFunction = (maybeFunc, params) => R.cond([
   // if already a function, return a function which executes maybeFn with the params 
   [
      funcOrBool => typeof funcOrBool === 'function', 
      funcOrBool => () => Array.isArray(params) ? funcOrBool(...params) : funcOrBool(params), // note: if there are more than one param then params is an array
   ],
   // if a boolean, return a function that returns the boolean
   [funcOrBool => typeof funcOrBool === 'boolean', funcOrBool => () => funcOrBool],
   // if neither a function nor a boolean, throw an error
   [R.T, () => { throw new Error('must supply a boolean or a function') }] 
])(maybeFunc); // note that maybeFn becomes funcOrBool above

const maybeConvertArrToFunction = (maybeArr, params) => R.cond([
   // if it is an array (of functions) then return a function that pipes the functions, seeded with the params
   [
      arrOrFunc => Array.isArray(arrOrFunc), 
      arrOrFunc => () => Array.isArray(params) ? R.pipe(...arrOrFunc)(...params) : R.pipe(...arrOrFunc)(params), // note: if there are more than one param then params is an array 
   ],
   // if it is a function return a function that executes maybeArr with the params
   [
      arrOrFunc => typeof arrOrFunc ==='function', 
      arrOrFunc => () => Array.isArray(params) ? arrOrFunc(...params) : arrOrFunc(params)
   ],
   // if neither an array nor a function, throw an error
   [R.T, () => { throw new Error('must be a function or an array'); }] 
])(maybeArr); // note that maybeArr becomes arrOrFunc above

/**
 * if-then functionality where
 * ifCond - can be either a boolean or a function returning a boolean
 * thenDo - can be either a function or an array of functions to be piped
 * params - an object: { ifParams, thenParams } where ifParams are passed to ifCond and thenParams to thenDo 
 * All the above a required - if any are missing you get a function that expects the remaining key-value pairs
 * example of use:
 * ifThen({
 *    ifCond: (a, b) => a === b,
 *    thenDo: [
 *       paramValue => 'value is ' + paramValue, 
 *       outputOfFn1 => '2nd func got output from the first function: ' + outputOfFn1
 *    ],
 *    params: { ifParams: [2,3], thenParams: 42 }
 * });
 */
export const ifThen = spicyCurry(
   ({ ifCond, thenDo, params }) => {
      const ifFn = maybeConvertBoolToFunction(ifCond, params.ifParams);
      const thenFn = maybeConvertArrToFunction(thenDo, params.thenParams);
      return R.ifElse(
         ifFn, 
         thenFn, 
         () => null
      )(params);
   }, 
   { ifCond: true, thenDo: [], params: {} } // template
);

/**
 * if-then-else functionality where
 * @param ifCond - can be either a boolean or a function returning a boolean
 * @param thenDo - can be either a function or an array of functions to be piped
 * @param elseDo - can be either a function or an array of functions to be piped 
 * @param params - an object: { ifParams, thenParams, elseParams } where ifParams are passed to ifCond, thenParams to thenDo, and elseParams to elseDo 
 * All of these are required - when any are missing you get a function that expects the missing key-value pairs
 * example of use:
 * ifThenElse({
 *    ifCond: (a, b) => a === b,
 *    thenDo: [
 *       paramValue => 'value is ' + paramValue, 
 *       outputOfFn1 => '2nd func got output from the first function: ' + outputOfFn1
 *    ],
 *    elseDo: ({ failMessage }) => 'Error: ' + failMessage,
 *    params: { ifParams: [2, 3], thenParams: 42, elseParams: 'was not equal to the ifValue' }
 * });
 */
export const ifThenElse = spicyCurry(
   ({ ifCond, thenDo, elseDo, params }) => {
      const ifFn = maybeConvertBoolToFunction(ifCond, params.ifParams);
      const thenFn = maybeConvertArrToFunction(thenDo, params.thenParams);
      const elseFn = maybeConvertArrToFunction(elseDo, params.elseParams);
      return R.ifElse(
         ifFn, 
         thenFn, 
         elseFn
      )(params);
   }, 
   { ifCond: true, thenDo: [], elseDo: [], params: {} } // template
);

/***** Sanctuary stuff ****/
export const getEitherValue = myEither => S.either 
   (S.I) // return the value if we have S.Left
   (S.I) // return the value if we have S.Right
   (myEither);

export const toLeft = conditionFn => right => R.pipe(R.map, getEitherValue)(conditionFn, right)
   ? R.pipe(getEitherValue, S.Left)(right) 
   : right;

export const eitherIsSomething = either => S.isLeft(either) 
   ? either
   : R.pipe(
      R.map(value => isSomething(value) ? value : S.Nothing),
      toLeft(R.equals(S.Nothing))
   )(either);
