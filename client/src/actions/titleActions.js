import {
   UPDATED_TITLE,
   OPENED_TITLE_EDITOR,
   POSTING_UPDATED_TITLE,
   COMPLETED_TITLE_UPDATE,
   TITLE_UPDATE_FAILED,
   TITLE_EDIT_CANCELLED,
} from './titleTypes';
import managedStore from '../store';
import { updateTitleInDB } from '../services/sheetServices';

export const openedTitleEditor = isEditingTitle => {
   managedStore.store.dispatch({
      type: OPENED_TITLE_EDITOR,
      payload: isEditingTitle,
   });
};

export const updatedTitle = titleData => {
   managedStore.store.dispatch({ type: POSTING_UPDATED_TITLE, payload: titleData }); //don't really need this payload

   updateTitleInDB(titleData.sheetId, titleData.title)
      .then(response => {
         console.log('updatedTitle got response', response);
         managedStore.store.dispatch({
            type: COMPLETED_TITLE_UPDATE,
            payload: { text: response.data, lastUpdated: Date.now() },
         });
      })
      .catch(err => {
         console.log('did not successfully update the title: err:', err);
         managedStore.store.dispatch({
            type: TITLE_UPDATE_FAILED,
            payload: { ...titleData, errorMessage: 'title was not updated: ' + err },
         });
      });
};

export const titleEditCancelled = () => {
   managedStore.store.dispatch({ type: TITLE_EDIT_CANCELLED });
};
