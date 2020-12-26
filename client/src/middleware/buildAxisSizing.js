import * as R from 'ramda';
import { isSomething, isNothing, forLoopMap } from '../helpers';
import { getRequiredNumItemsForAxis } from '../helpers/visibilityHelpers';
import { stateRowHeights, stateColumnWidths } from '../helpers/dataStructureHelpers';
import { TRIGGERED_FETCH_SHEET, COMPLETED_CREATE_SHEET, FETCHED_SHEET } from '../actions/sheetTypes';
import { replacedColumnWidths, replacedRowHeights } from '../actions/metadataActions';
import { ROW_AXIS, COLUMN_AXIS, DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT } from '../constants';

export default store => next => action => {
   if (!action) {
      return;
   }

   const createDefaultSizing = R.curry((numItems, defaultSize, axisSizingReplaceFn) => {
      const sizes = isSomething(numItems) 
         ? forLoopMap(
            index => ({ index, size: defaultSize }),
            numItems
         )
         : [];
      axisSizingReplaceFn(sizes); // ie call replacedRowSizes or replacedColumnSizes to put the size array into the store
      return sizes;
   });

   switch(action.type) {
      case TRIGGERED_FETCH_SHEET:
      case COMPLETED_CREATE_SHEET:
      case FETCHED_SHEET:
         const state = store.getState();
         if (isNothing(stateRowHeights(state))) {
            createDefaultSizing(
               getRequiredNumItemsForAxis(ROW_AXIS, state),
               DEFAULT_ROW_HEIGHT,
               replacedRowHeights
            )
         }
         if (isNothing(stateColumnWidths(state))) {
            createDefaultSizing(
               getRequiredNumItemsForAxis(COLUMN_AXIS, state),
               DEFAULT_COLUMN_WIDTH,
               replacedColumnWidths
            )
         }
         break;

      default:
   }
   return next(action);
};