import * as R from 'ramda';
import managedStore from '../store';
import { COMPLETED_SAVE_UPDATES, TOGGLED_SHOW_FILTER_MODAL, } from './types';
import {
   UPDATED_FILTER, 
   UPDATED_COLUMN_FILTERS,
   REPLACED_COLUMN_FILTERS,
   UPDATED_ROW_FILTERS,
   REPLACED_ROW_FILTERS,
   HIDE_FILTERED,
   CLEAR_ALL_FILTERS,
   UPDATED_TOTAL_COLUMNS,
   UPDATED_TOTAL_ROWS,
   UPDATED_COLUMN_VISIBILITY,
   REPLACED_COLUMN_VISIBILITY,
   UPDATED_ROW_VISIBILITY,
   REPLACED_ROW_VISIBILITY,
   ROW_MOVED,
   ROW_MOVED_TO,
   COLUMN_MOVED,
   COLUMN_MOVED_TO,
   UPDATED_ROW_ORDER,
   UPDATED_COLUMN_ORDER,
   UPDATED_SORT_OPTIONS,
   SORTED_AXIS,
   CLEARED_SORT_OPTIONS,
} from './metadataTypes';

// TODO: move all the metadata actions to their own file 

export const completedSaveUpdates = () => {
   managedStore.store.dispatch({
      type: COMPLETED_SAVE_UPDATES,
   });
};

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

export const toggledShowFilterModal = (rowIndex, colIndex) => {
   const showModal = !R.isNil(rowIndex) || !R.isNil(colIndex);
   managedStore.store.dispatch({
      type: TOGGLED_SHOW_FILTER_MODAL,
      payload: { showModal, rowIndex, colIndex },
   });
};

export const updatedFilter = (filterOptions, isInitializingSheet) => {
   managedStore.store.dispatch({
      type: UPDATED_FILTER,
      payload: filterOptions,
   });
   managedStore.store.dispatch({
      type: HIDE_FILTERED,
      payload: { filterOptions, isInitializingSheet },
   });
};

export const clearedAllFilters = () => {
   managedStore.store.dispatch({
      type: CLEAR_ALL_FILTERS,
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

export const rowMoved = row => {
   managedStore.store.dispatch({
      type: ROW_MOVED,
      payload: row,
   });
   managedStore.store.dispatch({
      type: UPDATED_ROW_ORDER,
      payload: null,
   });
};

export const rowMovedTo = row => {
   managedStore.store.dispatch({
      type: ROW_MOVED_TO,
      payload: row,
   });
   managedStore.store.dispatch({
      type: UPDATED_ROW_ORDER,
      payload: null,
   });
};

export const columnMoved = column => {
   managedStore.store.dispatch({
      type: COLUMN_MOVED,
      payload: column,
   });
   managedStore.store.dispatch({
      type: UPDATED_COLUMN_ORDER,
      payload: null,
   });
};

export const columnMovedTo = column => {
   managedStore.store.dispatch({
      type: COLUMN_MOVED_TO,
      payload: column,
   });
   managedStore.store.dispatch({
      type: UPDATED_COLUMN_ORDER,
      payload: null,
   });
};

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
