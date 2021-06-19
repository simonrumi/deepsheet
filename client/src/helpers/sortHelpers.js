import * as R from 'ramda';
import { isNothing, arrayContainsSomething } from './index';

// tuples is an array of [sourceIndex, destinationIndex], e.g. [[0,2], [1,0], etc]
const findBySourceIndexInTuples = (id, tuples) =>
   R.reduce((accumulator, pair) => (pair[0] === id ? R.reduced(pair) : null), null, tuples);

const updateIndiciesOfSheetItem = (originalArr, mapOfChangedIndicies) =>
   isNothing(originalArr) || !arrayContainsSomething(originalArr)
      ? []
      : R.map(item => {
           const indexMap = findBySourceIndexInTuples(item.index, mapOfChangedIndicies);
           if (isNothing(indexMap)) {
              return item;
           }
           return { ...item, index: indexMap[1] };
        })(originalArr);

// these 3 functions are just aliases for updateIndiciesOfSheetItem. The names of the aliases make their function clearer
export const createNewAxisVisibility = (axisVisibility, mapOfChangedIndicies) => 
   updateIndiciesOfSheetItem(axisVisibility, mapOfChangedIndicies);

export const createNewAxisFilters = (axisFilters, mapOfChangedIndicies) =>
   updateIndiciesOfSheetItem(axisFilters, mapOfChangedIndicies);

export const createNewAxisSizing = (axisSizing, mapOfChangedIndicies) => 
   updateIndiciesOfSheetItem(axisSizing, mapOfChangedIndicies);