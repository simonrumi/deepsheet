const R = require('ramda');

const isNothing = R.either(R.isNil, R.isEmpty);
const isSomething = R.pipe(isNothing, R.not);
const arrayContainsSomething = arr => 
   isSomething(arr) && 
   R.reduce(
      (accumulator, arrItem) => accumulator || isSomething(arrItem), 
      false,
      arr
   );
   
// use like this:
// runIfSomething(myFn, thingToTest, extraParameters)
// if the thingToTest exists and is not empty, myFn will run, having the thingToTest and extraParameters passed to it
const runIfSomething = (fn, thing, ...args) => 
   R.when(
      isSomething, 
      R.thunkify(fn)(thing, ...args), 
      thing
   );

const makeArr = length => new Array(length);
const mapWithIndex = R.addIndex(R.map);

// when you want to map, but you don't have an array, just a number of times to run the function supplied to map
// the function gets the index as a param each time
// returns an array
const forLoopMap = (fn, length) => mapWithIndex((val, index) => fn(index), makeArr(length));

const reduceWithIndex = R.addIndex(R.reduce);

// when you want to reduce, but you don't have an array, just a number of times to run the function supplied to reduce
// the function gets the params (accumulator, index)
// returns the final result collected by the accumulator
const forLoopReduce = (fn, initialVal, length) =>
   reduceWithIndex((accumulator, value, index) => fn(accumulator, index), initialVal, makeArr(length));

module.exports = {
   isNothing,
   isSomething,
   arrayContainsSomething,
   runIfSomething,
   forLoopMap,
   forLoopReduce,
};
