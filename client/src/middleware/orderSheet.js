import * as R from 'ramda';
import {
   UPDATED_ROW_ORDER,
   UPDATED_COLUMN_ORDER,
   ROW_MOVED,
   ROW_MOVED_TO,
   COLUMN_MOVED,
   COLUMN_MOVED_TO,
} from '../actions/metadataTypes';
import { SORTED_AXIS } from '../actions/sortTypes';
import { UPDATED_CELL } from '../actions/cellTypes';
import { startedUndoableAction, completedUndoableAction } from '../actions/undoActions';
import {
   replacedRowFilters,
   replacedColumnFilters,
   replacedRowVisibility,
   replacedColumnVisibility,
} from '../actions';
import { clearedSortOptions } from '../actions/sortActions';
import {
   hasChangedMetadata,
   replacedRowHeights,
   replacedColumnWidths,
   replacedFrozenRows,
   replacedFrozenColumns,
} from '../actions/metadataActions';
import moveRow from '../services/moveRow';
import moveColumn from '../services/moveColumn';
import sortAxis from '../services/sortAxis';
import { hasChangedCell } from '../actions/cellActions';
import { runIfSomething, isSomething, arrayContainsSomething } from '../helpers';
import { stateMetadataProp } from '../helpers/dataStructureHelpers';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';

export default store => next => async action => {
   const clearMoveData = () => {
      store.dispatch({
         type: ROW_MOVED,
         payload: null,
      });
      store.dispatch({
         type: ROW_MOVED_TO,
         payload: null,
      });
      store.dispatch({
         type: COLUMN_MOVED,
         payload: null,
      });
      store.dispatch({
         type: COLUMN_MOVED_TO,
         payload: null,
      });
   };

   const runCellDispatches = updatedCells => {
      R.map(cell => {
         hasChangedCell({
            row: cell.row,
            column: cell.column,
         });
         store.dispatch({ type: UPDATED_CELL, payload: cell });
         return null; // returning something to avoid console warning..really we just want to run the dispatch function multiple times
      })(updatedCells);
      // force clearMoveData to run on the next tick, otherwise move data is cleared before move is completed
      //so move doesn't actually happen. async-awaits didn't work, but leaving in here anyway, just in case
      setTimeout(clearMoveData, 0);
   };

   const maybeMoveAxis = (axisMoved, axisMovedTo, axisMoveFn, store) =>
      R.ifElse(
         R.allPass([
            // axisMoved must be present in sheet
            R.pipe(stateMetadataProp(R.__, axisMoved), isSomething),
            // axisMovedTo must be present in sheet
            R.pipe(stateMetadataProp(R.__, axisMovedTo), isSomething),
            // axisMoved and axisMovedTo values can't be equal
            R.pipe(
               state => R.equals(stateMetadataProp(state, axisMoved), stateMetadataProp(state, axisMovedTo)),
               R.not
            ),
         ]),
         axisMoveFn, // if we pass all the conditions, run the fn
         () => [] // otherwise return nothing
      )(store.getState());

   switch (action.type) {
      case UPDATED_ROW_ORDER:
         const [
            newRowCells = null,
            newRowFilters = null,
            newRowVisibility = null,
            newRowHeights = null,
            newFrozenRows = null,
         ] = maybeMoveAxis('rowMoved', 'rowMovedTo', moveRow, store);
         // Note: if moveRow() returns an array for newRowCells then we get an error when trying to runCellDispatches() on it.
         // Instead here moveRow() returns an object which we convert to an array with R.values() ...and it works fine
         // same approached used with moveColumn()
         // Is this a Ramda bug?
         const newRowCellsArr = R.values(newRowCells);
         if (arrayContainsSomething(newRowCellsArr)) {
            startedUndoableAction();
         }
         runCellDispatches(newRowCellsArr);
         runIfSomething(replacedRowFilters, newRowFilters);
         runIfSomething(replacedRowVisibility, newRowVisibility);
         runIfSomething(replacedRowHeights, newRowHeights);
         runIfSomething(replacedFrozenRows, newFrozenRows);
         hasChangedMetadata();
         if (arrayContainsSomething(newRowCellsArr)) {
            completedUndoableAction();
         }
         break;

      case UPDATED_COLUMN_ORDER:
         const [
            newColumnCells = null,
            newColumnFilters = null,
            newColumnVisibility = null,
            newColumnWidths = null,
            newFrozenColumns = null,
         ] = maybeMoveAxis('columnMoved', 'columnMovedTo', moveColumn, store);
         const newColumnCellsArr = R.values(newColumnCells);
         if (arrayContainsSomething(newColumnCellsArr)) {
            startedUndoableAction();
         }
         runCellDispatches(newColumnCellsArr);
         runIfSomething(replacedColumnFilters, newColumnFilters);
         runIfSomething(replacedColumnVisibility, newColumnVisibility);
         runIfSomething(replacedColumnWidths, newColumnWidths);
         runIfSomething(replacedFrozenColumns, newFrozenColumns);
         hasChangedMetadata();
         if (arrayContainsSomething(newColumnCellsArr)) {
            completedUndoableAction();
         }
         break;

      case SORTED_AXIS:
         const sortAxisResult = sortAxis(store.getState());
         const { updatedCells = [], updatedVisibility = {}, updatedFilters = {}, updatedSizing = {} } = sortAxisResult;
         runIfSomething(replacedRowVisibility, updatedVisibility[ROW_AXIS]);
         runIfSomething(replacedColumnVisibility, updatedVisibility[COLUMN_AXIS]);
         runIfSomething(replacedRowFilters, updatedFilters[ROW_AXIS]);
         runIfSomething(replacedColumnFilters, updatedFilters[COLUMN_AXIS]);
         runIfSomething(replacedRowHeights, updatedSizing[ROW_AXIS]);
         runIfSomething(replacedColumnWidths, updatedSizing[COLUMN_AXIS]);
         runCellDispatches(updatedCells);
         clearedSortOptions();
         completedUndoableAction();
         break;

      default:
   }
   return next(action);
};
