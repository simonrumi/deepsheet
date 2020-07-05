const R = require('ramda');

const isNothing = R.either(R.isNil, R.isEmpty);
const isSomething = R.pipe(isNothing, R.not);
const arrayContainsSomething = R.reduce((accumulator, arrItem) => accumulator && isSomething(arrItem), true);

module.exports = {
   isNothing,
   isSomething,
   arrayContainsSomething,
};
