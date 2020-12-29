import managedStore from '../store';
import { COMPLETED_SAVE_UPDATES, } from './types';
import { MENU_HIDDEN } from './menuTypes';
import { HIDE_AXIS_ITEM_TOOL } from './metadataTypes'; // don't move this one to metadataActions.js
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
   UPDATED_SORT_OPTIONS,
   SORTED_AXIS,
   CLEARED_SORT_OPTIONS,
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

/***** TODO these look like actions to do wtih sorting, should be in a separate file also */

export const sortedAxis = () => {
   managedStore.store.dispatch({
      type: SORTED_AXIS,
      payload: null,
   });
};

export const updatedSortOptions = sortOptions => {
   managedStore.store.dispatch({
      type: UPDATED_SORT_OPTIONS,
      payload: sortOptions,
   });
};

export const clearedSortOptions = () => {
   managedStore.store.dispatch({
      type: CLEARED_SORT_OPTIONS,
      payload: null,
   });
};
