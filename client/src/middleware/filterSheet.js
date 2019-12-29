import * as R from 'ramda';
import { UPDATED_FILTER, UPDATED_CELL_ } from '../actions/types';

export default store => next => action => {
   if (!action) {
      return;
   }
   switch (action.type) {
      case UPDATED_FILTER:
         // TODO
         // is it a column or row?
         // if column, which rows are filtered?
         // if row, which columns are filtered?
         // update all the cells in the filtered column/row with visible/invisible accordlingly
         console.log('in filterSheet, UPDATED_FILTER');
         console.log('action.payload:', action.payload);
         const storeState = store.getState();
         const columnCells = getCellsInColumn(
            action.payload.colIndex,
            storeState
         );
         console.log('getCellsInColumn()', columnCells);
         const rowVisibility = getRowVisibilityFromFilterExpression(
            action.payload.filterExpression,
            action.payload.caseSensitive,
            action.payload.regex,
            columnCells,
            storeState
         );
         console.log('rowVisibility', rowVisibility);
         break;
      default:
      //console.log('in filterSheet but not UPDATED_FILTER');
   }

   let result = next(action);
   //console.log('next state', store.getState());
   return result;
};

const isColumn = colIndex => !R.isNil(colIndex);

const getCellsInColumn = (colIndex, storeState) =>
   R.filter(
      currentCellKey => storeState[currentCellKey].column === colIndex,
      storeState.cellKeys
   );

const getRowVisibilityFromFilterExpression = (
   filterExpression,
   caseSensitive,
   isRegex,
   columnCells,
   storeState
) => {
   const regex = new RegExp(filterExpression);
   const rowVisibility = {};
   for (let i = 0; i < columnCells.length; i++) {
      const currentCell = storeState[columnCells[i]];
      //currentCell.visible = regex.test(currentCell.content);
      rowVisibility[currentCell.row] = regex.test(currentCell.content);
   }
   return rowVisibility;
};

const hideFilteredRows = (newRowVisibility, store) => {
   console.log('QQQQ finish hideFilteredRows ');
   // newRowVisibility[row];
   // for (i = 0; i < store.getState().totalRows; i++) {
   //    const updateAction = UPDATED_CELL_ + row + '_' + i;
   //    store.dispatch({
   //       type: updateAction,
   //       payload: store.getState()[cellKeyName],
   //    });
   // }
};
