import * as R from 'ramda';
import {
   UPDATED_ROW_ORDER,
   UPDATED_CELL_,
   ROW_MOVED,
   ROW_MOVED_TO,
} from '../actions/types';
import { replacedRowFilters, replacedRowVisibility } from '../actions';
import moveRow from '../services/moveRow';
import { runIfSomething } from '../helpers';

export default store => next => action => {
   if (!action) {
      return;
   }

   const runCellDispatches = R.map(async cell => {
      try {
         const promisedDispatch = await store.dispatch({
            type: UPDATED_CELL_ + cell.row + '_' + cell.column,
            payload: cell,
         });
         clearMoveData();
         return await promisedDispatch;
      } catch (err) {
         console.log('Error in orderSheet.runCellDispatches', err);
      }
   });

   const clearMoveData = () => {
      store.dispatch({
         type: ROW_MOVED,
         payload: null,
      });
      store.dispatch({
         type: ROW_MOVED_TO,
         payload: null,
      });
   };

   switch (action.type) {
      case UPDATED_ROW_ORDER:
         const [newCells, newRowFilters, newRowVisibility] = R.ifElse(
            R.allPass([
               // rowMoved must be present
               R.pipe(
                  R.path(['sheet', 'rowMoved']),
                  R.isNil,
                  R.not
               ),
               // rowMovedTo must be present
               R.pipe(
                  R.path(['sheet', 'rowMovedTo']),
                  R.isNil,
                  R.not
               ),
               // rowMoved and rowMovedTo can't be equal
               R.pipe(
                  state =>
                     R.equals(
                        R.path(['sheet', 'rowMoved'], state),
                        R.path(['sheet', 'rowMovedTo'], state)
                     ),
                  R.not
               ),
            ]),
            moveRow, // if we pass all the conditions run moveRow
            () => [null, null, null] // otherwise return null for all 3 values
         )(store.getState());

         // Note: if moveRow() returns an array then we get an error when trying to runCellDispatches() on it.
         // Instead here moveRow() returns an object which we convert to an array with R.values() ...and it works fine
         // Is this a Ramda bug?
         runCellDispatches(R.values(newCells));
         runIfSomething(replacedRowFilters, newRowFilters);
         runIfSomething(replacedRowVisibility, newRowVisibility);

         break;
      default:
   }
   return next(action);
};
