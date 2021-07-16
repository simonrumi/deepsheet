import managedStore from '../store';
import { UPDATED_CLIPBOARD } from './clipboardTypes';

export const updatedClipboard = clipboardString => {
   managedStore.store.dispatch({
      type: UPDATED_CLIPBOARD,
      payload: clipboardString,
   });
};