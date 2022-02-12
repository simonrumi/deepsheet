import * as R from 'ramda';
import { isSomething, isNothing, getObjectFromArrayByKeyValue , forLoopMap, forLoopReduce, ifThen, ifThenElse } from '../helpers';
import { getRequiredNumItemsForAxis } from '../helpers/visibilityHelpers';
import { stateRowHeights, stateColumnWidths, stateTotalRows, stateTotalColumns } from '../helpers/dataStructureHelpers';
import { COMPLETED_CREATE_SHEET, FETCHED_SHEET } from '../actions/sheetTypes';
import { CELLS_LOADED } from '../actions/cellTypes';
import { replacedColumnWidths, replacedRowHeights } from '../actions/metadataActions';
import { ROW_AXIS, COLUMN_AXIS, DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT } from '../constants';

const buildAxisSizing = store => next => action => {
   if (!action) {
      return;
   }

   const createDefaultSizing = (numItems, defaultSize, axisSizingReplaceFn) => {
      const sizes = isSomething(numItems) 
         ? forLoopMap(
            index => ({ index, size: defaultSize }),
            numItems
         )
         : [];
      axisSizingReplaceFn(sizes); // ie call replacedRowSizes or replacedColumnSizes to put the size array into the store
      return sizes;
   };

   const fillInMissingSizing = (totalInAxis, currentSizingArr, defaultSize, axisSizingReplaceFn) => {
      const allSizing = forLoopReduce(
         (accumulator, index) => R.pipe(
               getObjectFromArrayByKeyValue, // e.g. {index: 0, size: "87.859375px"}
               indexSizingObj => ({ params: { ifParams: indexSizingObj } }), // this will be the missing argument sent to ifThenElse
               ifThenElse({
                  ifCond: isNothing,
                  thenDo: () => R.append({ index, size: defaultSize }, accumulator),
                  elseDo: () => accumulator
               }),
            )('index', index, currentSizingArr),
         currentSizingArr,
         totalInAxis,
      );
      axisSizingReplaceFn(allSizing);
   }

   switch(action.type) {
      case COMPLETED_CREATE_SHEET:
      case FETCHED_SHEET:
      case CELLS_LOADED: // in fact cells_loaded may be the only action of the 3, where all the metadata is in place, ready to build the sizing
         const state = store.getState();
         const maybeCreateDefaultSizing = ifThen({ ifCond: isNothing, thenDo: createDefaultSizing });

         const rowHeights = stateRowHeights(state);
         const totalVisibleRows = getRequiredNumItemsForAxis(ROW_AXIS, state);
         // if there are no sizings currently, then set all rows to the default sizing
         maybeCreateDefaultSizing({ params: { 
               ifParams: rowHeights, 
               thenParams: [totalVisibleRows, DEFAULT_ROW_HEIGHT, replacedRowHeights] 
         } });
         // if there are some, but not all rows with sizing, use the default sizing to fill out the missing ones
         ifThen({
            ifCond: isSomething(rowHeights) && rowHeights.length < totalVisibleRows,
            thenDo: fillInMissingSizing,
            params: {
               thenParams: [stateTotalRows(state), rowHeights, DEFAULT_ROW_HEIGHT, replacedRowHeights],
            },
         });

         const columnWidths = stateColumnWidths(state);
         const totalVisibleColumns = getRequiredNumItemsForAxis(COLUMN_AXIS, state);
         // if there are no sizings currently, then set all cloumns to the default sizing
         maybeCreateDefaultSizing({ params: { 
               ifParams: columnWidths, 
               thenParams: [totalVisibleColumns, DEFAULT_COLUMN_WIDTH, replacedColumnWidths] 
         } });
         // if there are some, but not all rows with sizing, use the default sizing to fill out the missing ones
         ifThen({
            ifCond: isSomething(columnWidths) && columnWidths.length < totalVisibleColumns,
            thenDo: fillInMissingSizing,
            params: {
               thenParams: [stateTotalColumns(state), columnWidths, DEFAULT_COLUMN_WIDTH, replacedColumnWidths],
            },
         });
         break;

      default:
   }
   return next(action);
};

export default buildAxisSizing;