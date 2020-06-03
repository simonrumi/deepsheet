import * as R from 'ramda';
import { isNothing } from './index';

// tuples is an array of [sourceIndex, destinationIndex], e.g. [[0,2], [1,0], etc]
const findBySourceIndexInTuples = (id, tuples) =>
   R.reduce(
      (accumulator, pair) => (pair[0] === id ? R.reduced(pair) : null),
      null,
      tuples
   );

export const createNewAxisVisibility = (
   axisVisibility,
   mapOfChangedIndicies
) => {
   const returnVal = isNothing(axisVisibility)
      ? {}
      : R.map((item) => {
           const indexMap = findBySourceIndexInTuples(
              item.index,
              mapOfChangedIndicies
           );
           if (isNothing(indexMap)) {
              return item;
           }
           const returnVal = { ...item, index: indexMap[1] };
           return returnVal;
        })(axisVisibility);
   return returnVal;
};
