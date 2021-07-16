import * as R from 'ramda';
import { updatedCell, hasAddedCell } from '../actions/cellActions';
import { isSomething } from '../helpers';
import { createCellKey } from '../helpers/cellHelpers';

export const addNewCellsToStore = cells => R.map(cell => updatedCell(cell), cells);

export const createUpdatesForNewCellKeys = newCells => R.map(newCell => createCellKey(newCell.row, newCell.column), newCells);

export const addNewCellsToCellDbUpdates = R.map(cell => {
   hasAddedCell({ row: cell.row, column: cell.column });
   return null; // don't need to return anything, but adding this to clear a warning in the console
});

export const maybeAddAxisVisibilityEntry = (axisIndex, axisVisibilityObj, updatedAxisVisibilityFn) =>
   R.when(
      R.both(
         isSomething, // axisVisibilityObj is not empty and...
         R.pipe(R.has(axisIndex), R.not) // axisVisibilityObj doesn't have an entry for the Item we're adding
      ),
      R.pipe(
         () => ({ index: axisIndex, isVisible: true }),
         updatedAxisVisibilityFn // add the above object into the rowVisibility object
      )
   )(axisVisibilityObj);
