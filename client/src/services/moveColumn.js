// Note that this is very similar to moveRow.js but not generalizing (as moveAxis) because it becomes too hard to follow

import * as R from 'ramda';
import { forLoopReduce } from '../helpers';
import { createCellKey } from '../helpers/cellHelpers';
import { getAxisVisibilityName, getAxisFilterName } from '../helpers/visibilityHelpers';
import { getAxisSizingName } from '../helpers/axisSizingHelpers';
import { getFrozenAxisName } from '../helpers/frozenAxisHelpers';
import {
   stateTotalRows,
   stateTotalColumns,
   stateColumnMoved,
   stateColumnMovedTo,
   stateCell,
} from '../helpers/dataStructureHelpers';
import {
   makeNewMetadataItemFromMap,
   buildObject,
   reorderIndicies,
   createOptimizedMappingFromArray,
   createMappingFromArray,
} from './moveAxis';
import { COLUMN_AXIS } from '../constants';

const makeNewCellsFromMap = (columnUpdateMapping, state) => {
   const getCellFromState = R.pipe(createCellKey, stateCell(state));

   const createCells = R.reduce((newCells, columnMapping) => {
      const columnIndex = columnMapping[0]; // this is the column that we are going to reconstruct
      const movedColumnIndex = columnMapping[1]; // this is the column that we are getting the content (and other stuff) from
      newCells = forLoopReduce(
         (accumulator, rowIndex) =>
            R.pipe(
               buildObject, // builds a cell based on the cell in the column being moved, but with the index of the destination column
               R.assoc(createCellKey(rowIndex, columnIndex), R.__, accumulator) // puts the cell in the newCells object (the accumulator)
            )(getCellFromState(rowIndex, movedColumnIndex), R.assoc('column', columnIndex, {})), // params for buildObject
         newCells,
         stateTotalRows(state)
      );
      return newCells;
   }, {});
   return createCells(columnUpdateMapping);
};

export default state => {
   const columnIndexToMove = stateColumnMoved(state);
   const insertAtIndex = stateColumnMovedTo(state);
   const totalColumns = stateTotalColumns(state);
   const reorderedIndicies = reorderIndicies(columnIndexToMove, insertAtIndex, totalColumns);

   const newCells = R.pipe(
      createOptimizedMappingFromArray, 
      makeNewCellsFromMap(R.__, state)
   )(reorderedIndicies);

   const columnUpdateArr = createMappingFromArray(reorderedIndicies);
   const makeNewMetadatatItem = itemNameFn =>
      R.pipe(
         itemNameFn, 
         makeNewMetadataItemFromMap(columnUpdateArr, state)
      )(COLUMN_AXIS);

   const newColumnFilters = makeNewMetadatatItem(getAxisFilterName);
   const newColumnVisibility = makeNewMetadatatItem(getAxisVisibilityName);
   const newColumnWidths = makeNewMetadatatItem(getAxisSizingName);
   const newFrozenColumns = makeNewMetadatatItem(getFrozenAxisName);
   return [ newCells, newColumnFilters, newColumnVisibility, newColumnWidths, newFrozenColumns ];
};
