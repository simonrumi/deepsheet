import managedStore from '../store';
import { UPDATED_EDITOR, SET_EDITOR_REF } from './editorTypes';

export const updatedEditor = cellData => {
   managedStore.store.dispatch({
      type: UPDATED_EDITOR,
      payload: cellData,
   });
};

export const setEditorRef = editorRef => {
   managedStore.store.dispatch({ type: SET_EDITOR_REF, payload: editorRef });
};
