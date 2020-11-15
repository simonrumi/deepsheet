import * as R from 'ramda';
import {
   UPDATED_ROW_ORDER,
   UPDATED_COLUMN_ORDER,
   ROW_MOVED,
   ROW_MOVED_TO,
   COLUMN_MOVED,
   COLUMN_MOVED_TO,
   SORTED_AXIS,
} from '../actions/types';
import { UPDATED_CELL } from '../actions/cellTypes';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';
import {
   replacedRowFilters,
   replacedColumnFilters,
   replacedRowVisibility,
   replacedColumnVisibility,
   clearedSortOptions,
} from '../actions';
import { hasChangedMetadata, } from '../actions/metadataActions';
import moveRow from '../services/moveRow';
import moveColumn from '../services/moveColumn';
import sortAxis from '../services/sortAxis';
import { hasChangedCell } from '../actions/cellActions';
import { runIfSomething, isSomething } from '../helpers';
import { stateMetadataProp } from '../helpers/dataStructureHelpers';

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
         () => [null, null, null] // otherwise return null for all 3 values
      )(store.getState());

   switch (action.type) {
      case UPDATED_ROW_ORDER:
         const [newRowCells, newRowFilters, newRowVisibility] = maybeMoveAxis(
            'rowMoved',
            'rowMovedTo',
            moveRow,
            store
         );
         // Note: if moveRow() returns an array then we get an error when trying to runCellDispatches() on it.
         // Instead here moveRow() returns an object which we convert to an array with R.values() ...and it works fine
         // same approached used with moveColumn()
         // Is this a Ramda bug?
         runCellDispatches(R.values(newRowCells));
         runIfSomething(replacedRowFilters, newRowFilters);
         runIfSomething(replacedRowVisibility, newRowVisibility);
         hasChangedMetadata();
         break;

      case UPDATED_COLUMN_ORDER:
         const [newColumnCells, newColumnFilters, newColumnVisibility] = maybeMoveAxis(
            'columnMoved',
            'columnMovedTo',
            moveColumn,
            store
         );
         runCellDispatches(R.values(newColumnCells));
         runIfSomething(replacedColumnFilters, newColumnFilters);
         runIfSomething(replacedColumnVisibility, newColumnVisibility);
         hasChangedMetadata();
         break;

      case SORTED_AXIS:
         const { updatedCells = [], updatedVisibility = {}, updatedFilters = {} } = sortAxis(store.getState());
         runIfSomething(replacedRowVisibility, updatedVisibility[ROW_AXIS]);
         runIfSomething(replacedColumnVisibility, updatedVisibility[COLUMN_AXIS]);
         runIfSomething(replacedRowFilters, updatedFilters[ROW_AXIS]);
         runIfSomething(replacedColumnFilters, updatedFilters[COLUMN_AXIS]);
         runCellDispatches(updatedCells);
         clearedSortOptions();
         break;

      default:
   }
   return next(action);
};
