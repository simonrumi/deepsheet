import managedStore from '../store';
import { COMPLETED_SAVE_UPDATES } from './types';
import { MENU_HIDDEN } from './menuTypes';
import { HIDE_AXIS_ITEM_TOOL } from './metadataTypes'; // don't move this one to metadataActions.js
import { TOGGLED_SHOW_SORT_MODAL } from './sortTypes';
import { TOGGLED_SHOW_FILTER_MODAL } from './filterTypes';

export const completedSaveUpdates = () => {
   managedStore.store.dispatch({
      type: COMPLETED_SAVE_UPDATES,
   });
};

// note that hidePopups should not hide the filterModal - user must close filterModal after use
// if this were to close the filterModal, that would cause a bug whereby filterModal wouldn't ever show
export const hidePopups = () => {
   managedStore.store.dispatch({
      type: MENU_HIDDEN,
   });
   managedStore.store.dispatch({
      type: HIDE_AXIS_ITEM_TOOL,
   });
}

// This is designed to be used after an undo/redo, so that just the change in state is seen, but all popups are kept closed
export const hideAllPopups = () => {
   managedStore.store.dispatch({
      type: MENU_HIDDEN,
   });
   managedStore.store.dispatch({
      type: HIDE_AXIS_ITEM_TOOL,
   });
   managedStore.store.dispatch({
      type: TOGGLED_SHOW_SORT_MODAL,
      payload: { showModal: false, rowIndex: null, columnIndex: null },
   });
   managedStore.store.dispatch({
      type: TOGGLED_SHOW_FILTER_MODAL,
      payload: { showModal: false, rowIndex: null, columnIndex: null },
   });
}

