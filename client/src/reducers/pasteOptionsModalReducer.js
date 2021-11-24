import {
   CAPTURED_SYSTEM_CLIPBOARD,
   UPDATED_SHOW_PASTE_OPTIONS_MODAL,
   UPDATED_CELL_EDITOR_POSITIONING,
	UPDATED_BLUR_EDITOR_FUNCTION,
} from '../actions/pasteOptionsModalTypes';

const pasteOptionsModalReducer = (state = { showModal: false }, action) => {
   switch (action.type) {
      case CAPTURED_SYSTEM_CLIPBOARD:
         return { ...state, systemClipboard: action.payload };

      case UPDATED_SHOW_PASTE_OPTIONS_MODAL:
         return { ...state, showModal: action.payload };

      case UPDATED_CELL_EDITOR_POSITIONING:
         return { ...state, positioning: action.payload };

		case UPDATED_BLUR_EDITOR_FUNCTION:
         return { ...state, blurEditorFunction: action.payload };

      default:
         return state;
   }
};

export default pasteOptionsModalReducer;
