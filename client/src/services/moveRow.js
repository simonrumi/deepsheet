// Note that this is very similar to moveColumn.js but not generalizing (into moveAxis.js) because it becomes too hard to follow

import * as R from 'ramda';
import { forLoopReduce } from '../helpers';
import { createCellKey } from '../helpers/cellHelpers';
import { getAxisVisibilityName, getAxisFilterName } from '../helpers/visibilityHelpers';
import { getAxisSizingName } from '../helpers/axisSizingHelpers';
import { getFrozenAxisName } from '../helpers/frozenAxisHelpers';
import {
   stateTotalRows,
   stateTotalColumns,
   stateRowMoved,
   stateRowMovedTo,
   stateCell,
} from '../helpers/dataStructureHelpers';
import {
   makeNewMetadataItemFromMap,
   buildObject,
   reorderIndicies,
   createOptimizedMappingFromArray,
   createMappingFromArray,
} from './moveAxis';
import { ROW_AXIS } from '../constants';

const makeNewCellsFromMap = (rowUpdateMapping, state) => {
   const getCellFromState = R.pipe(createCellKey, stateCell(state));

   const createCells = R.reduce((newCells, rowMapping) => {
      const rowIndex = rowMapping[0]; // this is the row that we are going to reconstruct
      const movedRowIndex = rowMapping[1]; // this is the row that we are getting the content (and other stuff) from
      newCells = forLoopReduce(
         (accumulator, columnIndex) =>
            R.pipe(
               buildObject, // builds a cell based on the cell in the row being moved, but with the index of the destination row
               R.assoc(createCellKey(rowIndex, columnIndex), R.__, accumulator) // puts the cell in the newCells object (the accumulator)
            )(getCellFromState(movedRowIndex, columnIndex), R.assoc('row', rowIndex, {})), // params for buildObject
         newCells,
         stateTotalColumns(state)
      );
      return newCells;
   }, {});
   return createCells(rowUpdateMapping);
};

const moveRow = state => {
   const rowIndexToMove = stateRowMoved(state);
   const insertAtIndex = stateRowMovedTo(state);
   const totalRows = stateTotalRows(state);
   const reorderedIndicies = reorderIndicies(rowIndexToMove, insertAtIndex, totalRows);

   const newCells = R.pipe(
      createOptimizedMappingFromArray, 
      makeNewCellsFromMap(R.__, state)
   )(reorderedIndicies);

   const rowUpdateArr = createMappingFromArray(reorderedIndicies);
   const makeNewMetadatatItem = itemNameFn => 
      R.pipe(
         itemNameFn,
         makeNewMetadataItemFromMap(rowUpdateArr, state),
      )(ROW_AXIS);

   const newRowFilters = makeNewMetadatatItem(getAxisFilterName);
   const newRowVisibility = makeNewMetadatatItem(getAxisVisibilityName);
   const newRowHeights = makeNewMetadatatItem(getAxisSizingName);
   const newFrozenRows = makeNewMetadatatItem(getFrozenAxisName);
   return  [ newCells, newRowFilters, newRowVisibility, newRowHeights, newFrozenRows ];
};

export default moveRow;