import * as R from 'ramda';
import {
   forLoopMap,
   forLoopReduce,
   mapWithIndex,
   reduceWithIndex,
} from '../helpers';
import { createCellKey } from '../helpers/cellHelpers';

// TODO // BUG:
// filter col C by "t" (row 2 hidden)
// drag row 1 below 3 (or row 3 below 1)
// result totally messed up

const makeNewSheetObjectFromMap = (rowUpdateMapping, objectName, sheet) =>
   R.reduce(
      (accumulator, rowMap) => {
         const movedToIndex = rowMap[0];
         const movedFromIndex = rowMap[1];
         if (R.has(movedFromIndex, sheet[objectName])) {
            return R.assoc(
               movedToIndex,
               sheet[objectName][movedFromIndex],
               accumulator
            );
         }
         return accumulator;
      },
      {},
      rowUpdateMapping
   );

const createArray = (...args) => [...args];

const buildObject = R.pipe(
   createArray,
   R.mergeAll
);

const makeNewCellsFromMap = (rowUpdateMapping, state) => {
   const getCellFromState = R.pipe(
      createCellKey,
      R.prop(R.__, state)
   );

   const createCells = R.reduce((newCells, rowMapping) => {
      const rowIndex = rowMapping[0]; // this is the row that we are going to reconstruct
      const movedRowIndex = rowMapping[1]; // this is the row that we are getting the content (and other stuff) from
      newCells = forLoopReduce(
         (accumulator, columnIndex) =>
            R.pipe(
               buildObject, // builds a cell based on the cell in the row being moved, but with the index of the destination row
               R.assoc(createCellKey(rowIndex, columnIndex), R.__, accumulator) // puts the cell in the newCells object (the accumulator)
            )(
               getCellFromState(movedRowIndex, columnIndex),
               R.assoc('row', rowIndex, {})
            ), // params for buildObject
         newCells,
         state.sheet.totalColumns
      );
      return newCells;
   }, {});
   return createCells(rowUpdateMapping);
};

const reorderIndicies = (rowIndexToMove, insertAfterIndex, totalRows) => {
   const initialArray = forLoopMap(index => index, totalRows);
   if (rowIndexToMove < insertAfterIndex) {
      const newFirstPart = R.slice(0, rowIndexToMove, initialArray); // less than rowIndexToMove is untouched
      const newSecondPart = R.slice(
         rowIndexToMove + 1,
         insertAfterIndex + 1,
         initialArray
      ); // from rowIndexToMove to insertIndex will be moved 1 closer to start
      // rowIndexToMove goes after the newSecondPart in the final array
      const newEndPart = R.slice(insertAfterIndex + 1, totalRows, initialArray); // greater than insertIndex is untouched
      return R.pipe(
         R.concat,
         R.concat(R.__, [rowIndexToMove]),
         R.concat(R.__, newEndPart)
      )(newFirstPart, newSecondPart);
   }

   if (rowIndexToMove > insertAfterIndex) {
      const newFirstPart = R.slice(0, insertAfterIndex + 1, initialArray); // up to insertAfterIndex is untouched
      // rowIndexToMove goes here
      const newThirdPart = R.slice(
         insertAfterIndex + 1,
         rowIndexToMove,
         initialArray
      ); // from insertAfterIndex + 1 to rowIndexToMove - 1 will be moved 1 closer to end
      const newEndPart = R.slice(rowIndexToMove + 1, totalRows, initialArray); // greater than rowIndexToMove is untouched
      return R.pipe(
         R.concat,
         R.concat(R.__, newThirdPart),
         R.concat(R.__, newEndPart)
      )(newFirstPart, [rowIndexToMove]);
   }
};

const createOptimizedMappingFromArray = reduceWithIndex(
   (accumulator, value, index) =>
      value === index ? accumulator : R.append([index, value], accumulator),
   []
);

const createMappingFromArray = mapWithIndex((value, index) => [index, value]);

// TODO this has a lot of functions in it....can it be more declarative?
const moveRowContent = (rowIndexToMove, insertBelowIndex, totalRows, state) => {
   const reorderedIndicies = reorderIndicies(
      rowIndexToMove,
      insertBelowIndex,
      totalRows
   );
   const optimizedRowUpdateArr = createOptimizedMappingFromArray(
      reorderedIndicies
   );
   const newCells = makeNewCellsFromMap(optimizedRowUpdateArr, state);
   const rowUpdateArr = createMappingFromArray(reorderedIndicies);
   const newRowFilters = makeNewSheetObjectFromMap(
      rowUpdateArr,
      'rowFilters',
      state.sheet
   );
   const newRowVisibility = makeNewSheetObjectFromMap(
      rowUpdateArr,
      'rowVisibility',
      state.sheet
   );
   return [newCells, newRowFilters, newRowVisibility];
};

export default state =>
   moveRowContent(
      state.sheet.rowMoved,
      state.sheet.rowMovedTo,
      state.sheet.totalRows,
      state
   );
