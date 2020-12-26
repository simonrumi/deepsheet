import * as R from 'ramda';
import {
   forLoopMap,
   mapWithIndex,
   reduceWithIndex,
   isNothing,
   arrayContainsSomething,
   getObjectFromArrayByKeyValue,
   concatAll,
   isSomething,
} from '../helpers';
import { stateMetadataProp } from '../helpers/dataStructureHelpers';

/** 
 * a metadata item has this form:
 * [
 *    { index: 0, someKey: 'someValue' },
 *    { index: 1, someKey: 'someOtherValue' }
 * ]
 * so the point of this function is to take some axisUpdateMapping like this
 * [ 0, 4 ]
 * this indicates the object with index 0 should be moved to index 4
 * so the output object should be
 * [
 *    { index: 4, someKey: 'someValue' },
 *    { index: 1, someKey: 'someOtherValue' }
 * ]
*/
export const makeNewMetadataItemFromMap = R.curry((axisUpdateMapping, state, itemName) =>
   R.reduce(
      (accumulator, axisMap) => {
         const movedToIndex = axisMap[0];
         const movedFromIndex = axisMap[1];
         const metadataItem = stateMetadataProp(state, itemName);
         if (isNothing(metadataItem) || !arrayContainsSomething(metadataItem)) {
            return R.reduced([]);
         }
         const oldEntry = getObjectFromArrayByKeyValue('index', movedFromIndex, metadataItem);
         if (isSomething(oldEntry)) {
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

export const reorderIndicies = (axisIndexToMove, insertAtIndex, totalInAxis) => {
   const initialArray = forLoopMap(index => index, totalInAxis);
   // moving down/right
   if (axisIndexToMove < insertAtIndex) {
      const newFirstPart = R.slice(0, axisIndexToMove, initialArray); // less than axisIndexToMove is untouched
      const newSecondPart = R.slice(axisIndexToMove + 1, insertAtIndex + 1, initialArray); // from axisIndexToMove + 1 to insertIndex will be moved 1 closer to start
      // axisIndexToMove goes after the newSecondPart in the final array
      const newEndPart = R.slice(insertAtIndex + 1, totalInAxis, initialArray); // greater than insertIndex is untouched
      return concatAll([newFirstPart, newSecondPart, [axisIndexToMove], newEndPart]);
   }
   // moving up/left
   if (axisIndexToMove > insertAtIndex) {
      const newFirstPart = R.slice(0, insertAtIndex, initialArray); // up to insertAtIndex is untouched
      // axisIndexToMove goes second in the final array
      const newThirdPart = R.slice(insertAtIndex, axisIndexToMove, initialArray); // from insertAtIndex + 1 to axisIndexToMove will be moved 1 closer to end
      const newEndPart = R.slice(axisIndexToMove + 1, totalInAxis, initialArray); // greater than axisIndexToMove is untouched
      return concatAll([newFirstPart, [axisIndexToMove], newThirdPart,  newEndPart]);
   }
};

export const createOptimizedMappingFromArray = reduceWithIndex(
   (accumulator, value, index) => (value === index ? accumulator : R.append([index, value], accumulator)),
   []
);

export const createMappingFromArray = mapWithIndex((value, index) => [index, value]);
