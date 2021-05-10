import { UPDATED_FOCUS, CLEARED_FOCUS, HIGHLIGHTED_CELL_RANGE } from '../actions/focusTypes';
import { isSomething } from '../helpers';

export const focusReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_FOCUS:
         // FYI payload: { cell: cellData },
         return { ...state, ...action.payload, cellRange: null };

      case CLEARED_FOCUS:
         const previouslyFocusedCell = { ...state.cell };
         return { previouslyFocusedCell };

      case HIGHLIGHTED_CELL_RANGE:
         // FYI payload: { cell: cellData },
         if (isSomething(state.previouslyFocusedCell)) {
            return {
               ...state,
               cellRange: {
                  from: { ...state.previouslyFocusedCell },
                  to: action.payload.cell
               }
            }
         }
         return { ...state, cellRange: {}, ...action.payload };

      default:
         return state;
   }
};
