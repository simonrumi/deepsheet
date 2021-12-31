import {
   OPENED_TITLE_EDITOR,
   CHANGED_TITLE_VALUE,
   POSTING_UPDATED_TITLE,
   TITLE_EDIT_CANCELLED,
   TITLE_ERROR_DETECTED
} from './titleTypes';
import { FINISHED_EDITING_TITLE, STARTED_EDITING_TITLE } from './titleTypes';
import managedStore from '../store';

export const openedTitleEditor = isEditingTitle => {
   managedStore.store.dispatch({
      type: OPENED_TITLE_EDITOR,
      payload: isEditingTitle,
   });
};

export const changedTitleValue = newTitle => {
   managedStore.store.dispatch({ type: CHANGED_TITLE_VALUE, payload: newTitle });
}

export const finishedEditingTitle = info => {
   managedStore.store.dispatch({ type: FINISHED_EDITING_TITLE, payload: info });
};

export const postingUpdatedTitle = ({ sheetId, text }) => {
   managedStore.store.dispatch({ type: POSTING_UPDATED_TITLE, payload: { sheetId, text } }); 
}

export const titleEditCancelled = () => {
   managedStore.store.dispatch({ type: TITLE_EDIT_CANCELLED });
};

export const titleErrorDetected = error => {
   managedStore.store.dispatch({ type: TITLE_ERROR_DETECTED, payload: error });
}

export const startedEditingTitle = initialValue => {
   managedStore.store.dispatch({ type: STARTED_EDITING_TITLE, payload: initialValue });
};