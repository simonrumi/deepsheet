import managedStore from '../store';
import { UPDATED_CLIPBOARD, UPDATED_CLIPBOARD_ERROR, CLEARED_CLIPBOARD } from './clipboardTypes';

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

export const clearedClipboard = () => {
   managedStore.store.dispatch({
      type: CLEARED_CLIPBOARD,
   });
};