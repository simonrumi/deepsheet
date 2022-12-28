import {
   UPDATED_FOCUS,
   UPDATED_FOCUS_REF,
   UPDATED_FOCUS_ABORT_CONTROL,
   CLEARED_FOCUS,
	UPDATED_EDITOR_POSITIONING,
	UPDATED_TEXT_SELECTION,
	CLICKED_EDITOR_HEADER,
	RELEASED_EDITOR_HEADER,
} from '../actions/focusTypes';

export const focusReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_FOCUS:
         // FYI payload: { cell: cellData },
			console.log('focusReducer--UPDATED_FOCUS got action.payload', action.payload);
         return { ...state, ...action.payload };

      case UPDATED_FOCUS_REF:
         return { ...state, ref: action.payload.ref };

      case UPDATED_FOCUS_ABORT_CONTROL:
         return { ...state, abortControl: action.payload.abortControl };

      case CLEARED_FOCUS:
         return {};

		case UPDATED_EDITOR_POSITIONING:
			console.log('focusREducer--UPDATED_EDITOR_POSITIONING got payload', action.payload);
			return { ...state, editorPositioning: action.payload };

		case UPDATED_TEXT_SELECTION:
			return { ...state, textSelection: action.payload };

		case CLICKED_EDITOR_HEADER:
			return { ...state, clickedEditorHeader: true };

		case RELEASED_EDITOR_HEADER:
			return { ...state, clickedEditorHeader: false };

      default:
         return state;
   }
};
