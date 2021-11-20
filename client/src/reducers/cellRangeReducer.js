import { 
	HIGHLIGHTED_CELL_RANGE,
	CLEARED_CELL_RANGE,
	UPDATED_FROM_CELL, 
	ADDED_CELL_TO_RANGE, 
	REMOVED_CELL_FROM_RANGE,
	REPLACED_CELLS_IN_RANGE,
	CLEAR_LIST_OF_CELLS_IN_RANGE,
	UPDATED_RANGE_WAS_COPIED,
} from '../actions/cellRangeTypes';
import { CLEARED_FOCUS, UPDATED_FOCUS } from '../actions/focusTypes';
import { isSomething } from '../helpers';
import { removeCellFromArray } from '../helpers/cellHelpers';

const cellRangeReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_FOCUS:
         console.log('cellRangeReducer UPDATED_FOCUS got action.payload', action.payload, 'initial state is', state);
         // FYI payload: { cell: cellData },
			return { ...state, maybeFrom: action.payload.cell };

      case CLEARED_FOCUS: // TODO remove this if not needed
         console.log('cellRangeReducer CLEARED_FOCUS got action.payload', action.payload); 
         // const fromCell = isSomething(state.cell) ? { ...state.cell } : null; // the cell that potentially becomes the "from" cell in a range is the last focused cell
         // return { cellRange: { from: fromCell } };
         /// TODO unclear what to do here...maybe UPDATED_FOCUS should handle setting the from cell
         return state;

      case UPDATED_FROM_CELL:
         console.log('cellRangeReducer UPDATED_FROM_CELL got action.payload', action.payload);
         // payload: cell
         return {
            ...state,
            from: action.payload,
            maybeFrom: null, // if we have updated the from cell we no longer need the maybeFrom cell
         };

      case HIGHLIGHTED_CELL_RANGE:
         console.log('cellRangeReducer HIGHLIGHTED_CELL_RANGE got action.payload', action.payload);
         // FYI payload: { cell: cellData } // this is the "to" Cell
         return isSomething(state.from)
            ? {
                 ...state,
                 to: action.payload.cell,
              }
            : state;

		case UPDATED_RANGE_WAS_COPIED: 
			// payload is true/false
			return {
				...state,
				rangeWasCopied: action.payload,
			}

      case ADDED_CELL_TO_RANGE:
         // FYI payload is just the cell
         console.log('cellRangeReducer got ADDED_CELL_TO_RANGE with payload (should be a cell):', action.payload);
         return {
            ...state,
            cells: [...(state.cells || []), action.payload],
         };

      // TODO - doesn't seem like this action is ever generated....maybe this can be removed? ... actually see cellActions ...probably need to implement there
      case REMOVED_CELL_FROM_RANGE:
         // FYI payload is just the cell
         return {
            ...state,
            cells: removeCellFromArray(action.payload, state.cells),
         };

      case REPLACED_CELLS_IN_RANGE:
         // payload is an array of cells
         return {
            ...state,
            cells: action.payload,
				// TODO - do we need to set rangeWasCopied: false here? 
         };

      case CLEARED_CELL_RANGE:
         console.log('cellRangeReducer CLEARED_CELL_RANGE got action.payload', action.payload);
         // payload { cell: cellData }
         return {
            ...state,
            cells: [], // TODO check this should be here
            from: action.payload?.cell || null,
            to: null,
				rangeWasCopied: false,
         };

      case CLEAR_LIST_OF_CELLS_IN_RANGE:
         return { ...state, cells: [], rangeWasCopied: false };

      default:
         return state;
   }
};

export default cellRangeReducer;