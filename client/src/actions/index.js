import managedStore from '../store';
import { COMPLETED_SAVE_UPDATES } from './types';
import { MENU_HIDDEN } from './menuTypes';
import { HIDE_AXIS_ITEM_TOOL } from './metadataTypes'; // don't move this one to metadataActions.js
import { TOGGLED_SHOW_SORT_MODAL } from './sortTypes';
import { TOGGLED_SHOW_FILTER_MODAL } from './filterTypes';
import { 
   UPDATED_COLUMN_FILTERS,
   REPLACED_COLUMN_FILTERS,
   UPDATED_ROW_FILTERS,
   REPLACED_ROW_FILTERS,
   UPDATED_TOTAL_COLUMNS,
   UPDATED_TOTAL_ROWS,
   UPDATED_COLUMN_VISIBILITY,
   REPLACED_COLUMN_VISIBILITY,
   UPDATED_ROW_VISIBILITY,
   REPLACED_ROW_VISIBILITY,
} from './metadataTypes';

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

/****** TODO metadata actions to be moved, from here down: *****/

export const updatedColumnFilters = newColumnFilter => {
   managedStore.store.dispatch({
      type: UPDATED_COLUMN_FILTERS,
      payload: newColumnFilter,
   });
};

export const replacedColumnFilters = columnFilters => {
   managedStore.store.dispatch({
      type: REPLACED_COLUMN_FILTERS,
      payload: columnFilters,
   });
};

export const updatedRowFilters = newRowFilter => {
   managedStore.store.dispatch({
      type: UPDATED_ROW_FILTERS,
      payload: newRowFilter,
   });
};

export const replacedRowFilters = rowFilters => {
   managedStore.store.dispatch({
      type: REPLACED_ROW_FILTERS,
      payload: rowFilters,
   });
};

export const updatedTotalColumns = newTotalColumns => {
   managedStore.store.dispatch({
      type: UPDATED_TOTAL_COLUMNS,
      payload: newTotalColumns,
   });
};

export const updatedTotalRows = newTotalRows => {
   managedStore.store.dispatch({
      type: UPDATED_TOTAL_ROWS,
      payload: newTotalRows,
   });
};

export const updatedColumnVisibility = newVisibility => {
   managedStore.store.dispatch({
      type: UPDATED_COLUMN_VISIBILITY,
      payload: newVisibility,
   });
};

export const replacedColumnVisibility = newVisibility => {
   managedStore.store.dispatch({
      type: REPLACED_COLUMN_VISIBILITY,
      payload: newVisibility,
   });
};

export const updatedRowVisibility = newVisibility => {
   managedStore.store.dispatch({
      type: UPDATED_ROW_VISIBILITY,
      payload: newVisibility,
   });
};

export const replacedRowVisibility = newVisibility => {
   managedStore.store.dispatch({
      type: REPLACED_ROW_VISIBILITY,
      payload: newVisibility,
   });
};