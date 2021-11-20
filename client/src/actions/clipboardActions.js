import managedStore from '../store';
import { UPDATED_CLIPBOARD, UPDATED_CLIPBOARD_ERROR } from './clipboardTypes';

export const updatedClipboard = clipboardString => {
   managedStore.store.dispatch({
      type: UPDATED_CLIPBOARD,
      payload: clipboardString,
   });
};

export const updatedClipboardError = err => {
   managedStore.store.dispatch({
      type: UPDATED_CLIPBOARD_ERROR,
      payload: err,
   });
}