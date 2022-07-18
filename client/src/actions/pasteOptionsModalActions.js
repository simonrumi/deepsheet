import managedStore from '../store';
import {
   CAPTURED_SYSTEM_CLIPBOARD,
   UPDATED_SHOW_PASTE_OPTIONS_MODAL,
   UPDATED_CELL_EDITOR_POSITIONING,
	UPDATED_BLUR_EDITOR_FUNCTION,
	UPDATED_HANDLING_PASTE,
} from './pasteOptionsModalTypes';

export const capturedSystemClipboard = systemClipboardText => {
   managedStore.store.dispatch({ type: CAPTURED_SYSTEM_CLIPBOARD, payload: systemClipboardText });
};

export const updatedShowPasteOptionsModal = showModal => {
   managedStore.store.dispatch({ type: UPDATED_SHOW_PASTE_OPTIONS_MODAL, payload: showModal });
};

export const updatedCellEditorPositioning = positioning => {
   managedStore.store.dispatch({ type: UPDATED_CELL_EDITOR_POSITIONING, payload: positioning });
};

export const updatedBlurEditorFunction = blurEditor => {
   managedStore.store.dispatch({ type: UPDATED_BLUR_EDITOR_FUNCTION, payload: blurEditor });
};

export const updatedHandlingPaste = isHandlingPaste => {
   managedStore.store.dispatch({ type: UPDATED_HANDLING_PASTE, payload: isHandlingPaste });
};