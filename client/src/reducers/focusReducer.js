import {
   UPDATED_FOCUS,
   UPDATED_FOCUS_REF,
   UPDATED_FOCUS_ABORT_CONTROL,
   CLEARED_FOCUS,
	UPDATED_EDITOR_STATE,
	UPDATED_CELL_POSITIONING,
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
         return {};
	
		case UPDATED_EDITOR_STATE:
			return { ...state, editor: action.payload };

		case UPDATED_CELL_POSITIONING:
			return { ...state, cellPositioning: action.payload };

      default:
         return state;
   }
};
