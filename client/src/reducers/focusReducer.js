import {
   UPDATED_FOCUS,
   UPDATED_FOCUS_REF,
   UPDATED_FOCUS_ABORT_CONTROL,
   CLEARED_FOCUS,
   HIGHLIGHTED_CELL_RANGE,
   CLEARED_CELL_RANGE,
   UPDATED_FROM_CELL,
} from '../actions/focusTypes';
import { ADDED_CELL_TO_RANGE, REMOVED_CELL_FROM_RANGE, } from '../actions/cellTypes';
import { isSomething } from '../helpers';
import { removeCellFromArray } from '../helpers/cellHelpers';

export const focusReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_FOCUS:
         // FYI payload: { cell: cellData },
         return { ...state, ...action.payload, cellRange: null };

      case UPDATED_FROM_CELL:
         // payload: cell
         return { 
            ...state, 
            cellRange: {
               ...state.cellRange,
               from: action.payload,
            },
         }

      case UPDATED_FOCUS_REF:
         return { ...state, ref: action.payload.ref };

      case UPDATED_FOCUS_ABORT_CONTROL:
         return { ...state, abortControl: action.payload.abortControl };

      case CLEARED_FOCUS:
         const fromCell = isSomething(state.cell) ? { ...state.cell } : null; // the cell that potentially becomes the "from" cell in a range is the last focused cell
         return { cellRange: { from: fromCell } };

      case ADDED_CELL_TO_RANGE:
         // FYI payload is just the cell
         return {
            ...state,
            cellRange: {
               ...state.cellRange,
               cells: [ ...state.cellRange.cells || [], action.payload ],
            }
         }

      case REMOVED_CELL_FROM_RANGE:
         // FYI payload is just the cell
         return {
            ...state,
            cellRange: {
               ...state.cellRange,
               cells: removeCellFromArray(action.payload, state.cellRange.cells),
            }
         }

      case HIGHLIGHTED_CELL_RANGE:
         // FYI payload: { cell: cellData } // this is the "to" Cell
         if (isSomething(state.cellRange.from)) {
            return {
               ...state,
               cell: null, // we don't want to focus a particular cell, instead highlight the whole range
               cellRange: {
                  ...state.cellRange,
                  to: action.payload.cell,
               },
            };
         }
         return { ...state, cellRange: {}, ...action.payload };

      case CLEARED_CELL_RANGE:
         // payload { cell: cellData }
         return {
            ...state,
            cellRange: {
               from: action.payload?.cell || null
            }
         };

      default:
         return state;
   }
};
