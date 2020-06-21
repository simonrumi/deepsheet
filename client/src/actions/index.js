import * as R from 'ramda';
import managedStore from '../store';

import {
   UPDATED_HAS_CHANGED,
   UPDATED_EDITOR,
   SET_EDITOR_REF,
   UPDATED_CELL_,
   UPDATED_CONTENT_OF_CELL_,
   UPDATED_CELL_KEYS,
   TOGGLED_SHOW_FILTER_MODAL,
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
} from './types';

console.log('TODO: split up the actions & types');

export const updatedHasChanged = hasChanged => {
   managedStore.store.dispatch({
      type: UPDATED_HAS_CHANGED,
      payload: hasChanged,
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

export const updatedEditor = cellData => {
   managedStore.store.dispatch({
      type: UPDATED_EDITOR,
      payload: cellData,
   });
};

export const setEditorRef = editorRef => {
   managedStore.store.dispatch({ type: SET_EDITOR_REF, payload: editorRef });
};

export const updatedCellBeingEdited = cell => {
   const updateCellType = UPDATED_CONTENT_OF_CELL_ + cell.row + '_' + cell.column;
   managedStore.store.dispatch({ type: updateCellType, payload: cell });
};

export const updatedCell = cell => {
   if (R.isNil(cell) || R.not(R.has('content', cell))) {
      console.log('WARNING: updatedCell could not create an action. It received', cell);
      return;
   }
   managedStore.store.dispatch({
      type: UPDATED_CELL_ + cell.row + '_' + cell.column,
      payload: cell,
   });
};

export const updatedCellKeys = keys => {
   managedStore.store.dispatch({ type: UPDATED_CELL_KEYS, payload: keys });
};

export const toggledShowFilterModal = (rowIndex, colIndex) => {
   const showModal = !R.isNil(rowIndex) || !R.isNil(colIndex);
   managedStore.store.dispatch({
      type: TOGGLED_SHOW_FILTER_MODAL,
      payload: { showModal, rowIndex, colIndex },
   });
};

export const updatedFilter = filterOptions => {
   managedStore.store.dispatch({
      type: UPDATED_FILTER,
      payload: filterOptions,
   });
   managedStore.store.dispatch({
      type: HIDE_FILTERED,
      payload: filterOptions,
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
