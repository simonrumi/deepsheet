import {
   CAPTURED_SYSTEM_CLIPBOARD,
   UPDATED_SHOW_PASTE_OPTIONS_MODAL,
   UPDATED_CELL_EDITOR_POSITIONING,
	UPDATED_BLUR_EDITOR_FUNCTION,
} from '../actions/pasteOptionsModalTypes';

const pasteOptionsModalReducer = (state = { showModal: false }, action) => {
   switch (action.type) {
      case CAPTURED_SYSTEM_CLIPBOARD:
         console.log('pasteOptionsModalReducer CAPTURED_SYSTEM_CLIPBOARD got payload', action.payload);
         return { ...state, systemClipboard: action.payload };

      case UPDATED_SHOW_PASTE_OPTIONS_MODAL:
         console.log('pasteOptionsModalReducer UPDATED_SHOW_PASTE_OPTIONS_MODAL got payload', action.payload);
         return { ...state, showModal: action.payload };

      case UPDATED_CELL_EDITOR_POSITIONING:
         console.log('pasteOptionsModalReducer UPDATED_CELL_EDITOR_POSITIONING got payload', action.payload);
         return { ...state, positioning: action.payload };

		case UPDATED_BLUR_EDITOR_FUNCTION:
			console.log('pasteOptionsModalReducer UPDATED_BLUR_EDITOR_FUNCTION got payload', action.payload);
         return { ...state, blurEditorFunction: action.payload };

      default:
         return state;
   }
};

export default pasteOptionsModalReducer;
