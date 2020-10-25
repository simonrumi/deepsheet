import { OPENED_TITLE_EDITOR, POSTING_UPDATED_TITLE, TITLE_EDIT_CANCELLED } from './titleTypes';
import managedStore from '../store';

export const openedTitleEditor = isEditingTitle => {
   managedStore.store.dispatch({
      type: OPENED_TITLE_EDITOR,
      payload: isEditingTitle,
   });
};

export const updatedTitle = titleData => {
   managedStore.store.dispatch({ type: POSTING_UPDATED_TITLE, payload: titleData });
};

export const titleEditCancelled = () => {
   managedStore.store.dispatch({ type: TITLE_EDIT_CANCELLED });
};
