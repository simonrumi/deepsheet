import { UPDATED_FOCUS, CLEARED_FOCUS, HIGHLIGHTED_CELL_RANGE } from '../actions/focusTypes';
import { isSomething } from '../helpers';

export const focusReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_FOCUS:
         console.log('focusReducer got UPDATED_FOCUS for cell row', action.payload.cell.row, 'column', action.payload.cell.column);
         // FYI payload: { cell: cellData },
         return { ...state, ...action.payload, cellRange: null };

      case CLEARED_FOCUS:
         /* const previouslyFocusedCell = { ...state.cell };
         return { previouslyFocusedCell }; */ // TODO might have to reinstate this when working on cell range....BUT need to make sure it doesn't mess up tabbing
         return {}

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
