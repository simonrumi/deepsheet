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
			console.log('focusREducer--UPDATED_FOCUS got action.payload', action.payload);
         // FYI payload: { cell: cellData },
         return { ...state, ...action.payload };

      case UPDATED_FOCUS_REF:
			console.log('focusREducer--UPDATED_FOCUS_REF got action.payload', action.payload, 'and ref.current is', action.payload.ref?.current);
         return { ...state, ref: action.payload.ref };

      case UPDATED_FOCUS_ABORT_CONTROL:
         return { ...state, abortControl: action.payload.abortControl };

      case CLEARED_FOCUS:
			console.log('focusReducer--CLEARED_FOCUS will set focus to {}');
         return {};

		case UPDATED_EDITOR_POSITIONING:
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
