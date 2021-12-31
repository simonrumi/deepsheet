import { 
	HIGHLIGHTED_CELL_RANGE,
	CLEARED_CELL_RANGE,
	UPDATED_FROM_CELL, 
	ADDED_CELL_TO_RANGE,
	REPLACED_CELLS_IN_RANGE,
	CLEAR_LIST_OF_CELLS_IN_RANGE,
	UPDATED_RANGE_WAS_COPIED,
	UPDATED_PASTING_CELL_RANGE,
} from '../actions/cellRangeTypes';
import { UPDATED_FOCUS } from '../actions/focusTypes';
import { isSomething } from '../helpers';

const cellRangeReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_FOCUS:
         // FYI payload: { cell: cellData },
			return { ...state, maybeFrom: action.payload.cell };

      case UPDATED_FROM_CELL:
         // payload: cell
         return {
            ...state,
            from: action.payload,
            maybeFrom: null, // if we have updated the from cell we no longer need the maybeFrom cell
         };

      case HIGHLIGHTED_CELL_RANGE:
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

		case UPDATED_PASTING_CELL_RANGE:
			return {
				...state,
				isPastingCellRange: action.payload,
			}

      case ADDED_CELL_TO_RANGE:
         // FYI payload is just the cell
         return {
            ...state,
            cells: [...(state.cells || []), action.payload],
         };

      case REPLACED_CELLS_IN_RANGE:
         // payload is an array of cells
         return {
            ...state,
            cells: action.payload,
         };

      case CLEARED_CELL_RANGE:
         // payload { cell: cellData }
         return {
            ...state,
            cells: [],
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