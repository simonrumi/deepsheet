// import { map } from 'ramda';
import * as R from 'ramda';
import managedStore from '../store';
import {
   FETCHED_SHEET,
   UPDATE_EDITOR,
   UPDATED_CELL_,
   UPDATED_CELL_KEYS,
   SET_EDITOR_REF,
   UPDATED_TITLE,
   SET_EDITING_TITLE,
   UPDATED_SHEET_ID,
   TOGGLED_SHOW_FILTER_MODAL,
   UPDATED_FILTER,
   UPDATED_COLUMN_FILTERS,
   UPDATED_ROW_FILTERS,
   HIDE_FILTERED,
   CLEAR_ALL_FILTERS,
   UPDATED_TOTAL_COLUMNS,
   UPDATED_TOTAL_ROWS,
   UPDATED_COLUMN_VISIBILITY,
   UPDATED_ROW_VISIBILITY,
   ROW_MOVED,
   ROW_MOVED_TO,
   UPDATED_ROW_ORDER,
} from './types';

export const fetchedSheet = sheet => {
   managedStore.store.dispatch({ type: FETCHED_SHEET, payload: sheet });
};

export const updatedSheetId = sheetId => {
   managedStore.store.dispatch({ type: UPDATED_SHEET_ID, payload: sheetId });
};

export const updatedColumnFilters = columnFilters => {
   managedStore.store.dispatch({
      type: UPDATED_COLUMN_FILTERS,
      payload: columnFilters,
   });
};

export const updatedRowFilters = rowFilters => {
   managedStore.store.dispatch({
      type: UPDATED_ROW_FILTERS,
      payload: rowFilters,
   });
};

export const updateEditor = cellBeingEdited => {
   managedStore.store.dispatch({
      type: UPDATE_EDITOR,
      payload: cellBeingEdited,
   });
};

export const updatedCellBeingEdited = cell => {
   const updateCellType = UPDATED_CELL_ + cell.row + '_' + cell.column;
   managedStore.store.dispatch({ type: updateCellType, payload: cell.content });
};

export const updatedCell = cell => {
   if (R.isNil(cell) || R.not(R.has('content', cell))) {
      console.log(
         'WARNING: updateCell could not create an action. It received',
         cell
      );
      return;
   }
   const updateCellType = UPDATED_CELL_ + cell.row + '_' + cell.column;
   managedStore.store.dispatch({ type: updateCellType, payload: cell });
};

export const updatedCellKeys = keys => {
   managedStore.store.dispatch({ type: UPDATED_CELL_KEYS, payload: keys });
};

export const setEditorRef = editorRef => {
   managedStore.store.dispatch({ type: SET_EDITOR_REF, payload: editorRef });
};

export const updatedTitle = titleData => {
   managedStore.store.dispatch({ type: UPDATED_TITLE, payload: titleData });
};

export const setEditingTitle = isEditingTitle => {
   managedStore.store.dispatch({
      type: SET_EDITING_TITLE,
      payload: isEditingTitle,
   });
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

export const updatedRowVisibility = newVisibility => {
   managedStore.store.dispatch({
      type: UPDATED_ROW_VISIBILITY,
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
