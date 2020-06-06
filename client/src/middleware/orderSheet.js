import * as R from 'ramda';
import {
   UPDATED_ROW_ORDER,
   UPDATED_COLUMN_ORDER,
   UPDATED_CELL_,
   ROW_MOVED,
   ROW_MOVED_TO,
   COLUMN_MOVED,
   COLUMN_MOVED_TO,
   SORTED_AXIS,
} from '../actions/types';
import { ROW_AXIS, COLUMN_AXIS } from '../constants';
import {
   replacedRowFilters,
   replacedColumnFilters,
   replacedRowVisibility,
   replacedColumnVisibility,
   updatedHasChanged,
   clearedSortOptions,
} from '../actions';
import moveRow from '../services/moveRow';
import moveColumn from '../services/moveColumn';
import sortAxis from '../services/sortAxis';
import { runIfSomething } from '../helpers';

export default (store) => (next) => (action) => {
   if (!action) {
      return;
   }

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

   const runCellDispatches = async (updatedCells) => {
      await R.map(async (cell) => {
         const promisedDispatch = await store.dispatch({
            type: UPDATED_CELL_ + cell.row + '_' + cell.column,
            payload: cell,
         });
         return promisedDispatch;
      })(updatedCells);
      // force clearMoveData to run on the next tick, otherwise move data is cleared before move is completed
      //so move doesn't actually happen. async-awaits didn't work, but leaving in here anyway, just in case
      setTimeout(clearMoveData, 0);
   };

   const maybeMoveAxis = (axisMoved, axisMovedTo, axisMoveFn, store) =>
      R.ifElse(
         R.allPass([
            // axisMoved must be present in sheet
            R.pipe(R.path(['sheet', axisMoved]), R.isNil, R.not),
            // axisMovedTo must be present in sheet
            R.pipe(R.path(['sheet', axisMovedTo]), R.isNil, R.not),
            // axisMoved and axisMovedTo values can't be equal
            R.pipe(
               (state) =>
                  R.equals(
                     R.path(['sheet', axisMoved], state),
                     R.path(['sheet', axisMovedTo], state)
                  ),
               R.not
            ),
         ]),
         axisMoveFn, // if we pass all the conditions, run the fn
         () => [null, null, null, false] // otherwise return null for all 3 values and false for hasChanged
      )(store.getState());

   switch (action.type) {
      case UPDATED_ROW_ORDER:
         const [
            newRowCells,
            newRowFilters,
            newRowVisibility,
            rowsHaveChanged,
         ] = maybeMoveAxis('rowMoved', 'rowMovedTo', moveRow, store);

         // Note: if moveRow() returns an array then we get an error when trying to runCellDispatches() on it.
         // Instead here moveRow() returns an object which we convert to an array with R.values() ...and it works fine
         // same approached used with moveColumn()
         // Is this a Ramda bug?
         runCellDispatches(R.values(newRowCells));
         runIfSomething(replacedRowFilters, newRowFilters);
         runIfSomething(replacedRowVisibility, newRowVisibility);
         updatedHasChanged(rowsHaveChanged);
         break;

      case UPDATED_COLUMN_ORDER:
         const [
            newColumnCells,
            newColumnFilters,
            newColumnVisibility,
            columnsHaveChanged,
         ] = maybeMoveAxis('columnMoved', 'columnMovedTo', moveColumn, store);
         runCellDispatches(R.values(newColumnCells));
         runIfSomething(replacedColumnFilters, newColumnFilters);
         runIfSomething(replacedColumnVisibility, newColumnVisibility);
         updatedHasChanged(columnsHaveChanged);
         break;

      case SORTED_AXIS:
         const {
            updatedCells = [],
            updatedVisibility = {},
            updatedFilters = {},
         } = sortAxis(store.getState());
         runIfSomething(replacedRowVisibility, updatedVisibility[ROW_AXIS]);
         runIfSomething(
            replacedColumnVisibility,
            updatedVisibility[COLUMN_AXIS]
         );
         runIfSomething(replacedRowFilters, updatedFilters[ROW_AXIS]);
         runIfSomething(replacedColumnFilters, updatedFilters[COLUMN_AXIS]);
         runCellDispatches(updatedCells);
         clearedSortOptions();
         break;

      default:
   }
   return next(action);
};
