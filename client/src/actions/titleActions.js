import { OPENED_TITLE_EDITOR, CHANGED_TITLE_VALUE, POSTING_UPDATED_TITLE, TITLE_EDIT_CANCELLED } from './titleTypes';
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

export const updatedTitle = titleData => {
   managedStore.store.dispatch({ type: POSTING_UPDATED_TITLE, payload: titleData });
};

export const titleEditCancelled = () => {
   managedStore.store.dispatch({ type: TITLE_EDIT_CANCELLED });
};
