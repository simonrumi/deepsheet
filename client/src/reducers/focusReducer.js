import {
   UPDATED_FOCUS,
   UPDATED_FOCUS_REF,
   UPDATED_FOCUS_ABORT_CONTROL,
   CLEARED_FOCUS,
   HIGHLIGHTED_CELL_RANGE,
} from '../actions/focusTypes';
import { isSomething } from '../helpers';

export const focusReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_FOCUS:
         // FYI payload: { cell: cellData },
         return { ...state, ...action.payload, cellRange: null };

      case UPDATED_FOCUS_REF:
         return { ...state, ref: action.payload.ref };

      case UPDATED_FOCUS_ABORT_CONTROL:
         return { ...state, abortControl: action.payload.abortControl };

      case CLEARED_FOCUS:
         /* const previouslyFocusedCell = { ...state.cell };
         return { previouslyFocusedCell }; */ // TODO might have to reinstate this when working on cell range....BUT need to make sure it doesn't mess up tabbing
         return {};

      case HIGHLIGHTED_CELL_RANGE:
         // FYI payload: { cell: cellData },
         if (isSomething(state.previouslyFocusedCell)) {
            return {
               ...state,
               cellRange: {
                  from: { ...state.previouslyFocusedCell },
                  to: action.payload.cell,
               },
            };
         }
         return { ...state, cellRange: {}, ...action.payload };

      default:
         return state;
   }
};
