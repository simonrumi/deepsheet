import managedStore from '../store';
import {
   UPDATED_FOCUS,
   UPDATED_FOCUS_REF,
   UPDATED_FOCUS_ABORT_CONTROL,
   CLEARED_FOCUS,
	UPDATED_EDITOR_POSITIONING,
	UPDATED_TEXT_SELECTION,
	CLICKED_EDITOR_HEADER,
	RELEASED_EDITOR_HEADER,
} from './focusTypes';

export const focusedCell = cellData => {
   managedStore.store.dispatch({
      type: UPDATED_FOCUS,
      payload: { cell: cellData },
   });
};

export const updatedFocusRef = ref => {
   managedStore.store.dispatch({
      type: UPDATED_FOCUS_REF,
      payload: { ref },
   });
}

export const updatedFocusAbortControl = (abortControl, cell) => {
   managedStore.store.dispatch({
      type: UPDATED_FOCUS_ABORT_CONTROL,
      payload: { abortControl, cell },
   })
}

export const clearedFocus = () => {
   managedStore.store.dispatch({
      type: CLEARED_FOCUS,
   });
};

export const updatedEditorPositioning = positioning => {
	managedStore.store.dispatch({
      type: UPDATED_EDITOR_POSITIONING,
		payload: positioning,
   });
};

export const updatedTextSelection = textSelection => {
	managedStore.store.dispatch({
      type: UPDATED_TEXT_SELECTION,
		payload: textSelection,
   });
}

export const clickedEditorHeader = () => {
	managedStore.store.dispatch({ type: CLICKED_EDITOR_HEADER });
}

export const releasedEditorHeader = () => {
	managedStore.store.dispatch({ type: RELEASED_EDITOR_HEADER });
}