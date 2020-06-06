import * as R from 'ramda';
import {
   forLoopMap,
   mapWithIndex,
   reduceWithIndex,
   isNothing,
   arrayContainsSomething,
   getObjectFromArrayByKeyValue,
} from '../helpers';

export const makeNewSheetItemFromMap = R.curry(
   (axisUpdateMapping, sheet, itemName) =>
      R.reduce(
         (accumulator, axisMap) => {
            const movedToIndex = axisMap[0];
            const movedFromIndex = axisMap[1];
            if (
               isNothing(sheet[itemName]) ||
               !arrayContainsSomething(sheet[itemName])
            ) {
               return R.reduced([]);
            }

            if (R.has(movedFromIndex, sheet[itemName])) {
               const oldEntry = getObjectFromArrayByKeyValue(
                  'index',
                  movedFromIndex,
                  sheet[itemName]
               );
               const newEntry = { ...oldEntry, index: movedToIndex };
               return R.append(newEntry, accumulator);
            }
            return accumulator;
         },
         [],
         axisUpdateMapping
      )
);

export const createArray = (...args) => [...args];

export const buildObject = R.pipe(createArray, R.mergeAll);

export const reorderIndicies = (
   axisIndexToMove,
   insertAfterIndex,
   totalColumns
) => {
   const initialArray = forLoopMap((index) => index, totalColumns);
   if (axisIndexToMove < insertAfterIndex) {
      const newFirstPart = R.slice(0, axisIndexToMove, initialArray); // less than axisIndexToMove is untouched
      const newSecondPart = R.slice(
         axisIndexToMove + 1,
         insertAfterIndex + 1,
         initialArray
      ); // from axisIndexToMove to insertIndex will be moved 1 closer to start
      // axisIndexToMove goes after the newSecondPart in the final array
      const newEndPart = R.slice(
         insertAfterIndex + 1,
         totalColumns,
         initialArray
      ); // greater than insertIndex is untouched
      return R.pipe(
         R.concat,
         R.concat(R.__, [axisIndexToMove]),
         R.concat(R.__, newEndPart)
      )(newFirstPart, newSecondPart);
   }

   if (axisIndexToMove > insertAfterIndex) {
      const newFirstPart = R.slice(0, insertAfterIndex + 1, initialArray); // up to insertAfterIndex is untouched
      // axisIndexToMove goes here
      const newThirdPart = R.slice(
         insertAfterIndex + 1,
         axisIndexToMove,
         initialArray
      ); // from insertAfterIndex + 1 to axisIndexToMove - 1 will be moved 1 closer to end
      const newEndPart = R.slice(
         axisIndexToMove + 1,
         totalColumns,
         initialArray
      ); // greater than axisIndexToMove is untouched
      return R.pipe(
         R.concat,
         R.concat(R.__, newThirdPart),
         R.concat(R.__, newEndPart)
      )(newFirstPart, [axisIndexToMove]);
   }
};

export const createOptimizedMappingFromArray = reduceWithIndex(
   (accumulator, value, index) =>
      value === index ? accumulator : R.append([index, value], accumulator),
   []
);

export const createMappingFromArray = mapWithIndex((value, index) => [
   index,
   value,
]);
