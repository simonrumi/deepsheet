import {
   UPDATED_FOCUS,
   UPDATED_FOCUS_REF,
   UPDATED_FOCUS_ABORT_CONTROL,
   CLEARED_FOCUS,
} from '../actions/focusTypes';

export const focusReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_FOCUS:
         // FYI payload: { cell: cellData },
         return { ...state, ...action.payload };

      case UPDATED_FOCUS_REF:
         return { ...state, ref: action.payload.ref };

      case UPDATED_FOCUS_ABORT_CONTROL:
         return { ...state, abortControl: action.payload.abortControl };

      case CLEARED_FOCUS:
         return {}

      default:
         return state;
   }
};
