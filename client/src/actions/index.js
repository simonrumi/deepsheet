import { map } from 'ramda';
import managedStore from '../store';
import {
   FETCHED_SHEET,
   UPDATE_EDITOR,
   UPDATE_CELL_BEING_EDITED,
   UPDATED_CELL_,
   UPDATED_CELL_KEYS,
   SET_EDITOR_REF,
   UPDATE_TITLE,
   SET_EDITING_TITLE,
} from './types';

export const fetchedSheet = sheet => {
   return { type: FETCHED_SHEET, payload: sheet };
};

export const updateEditor = cellBeingEdited => dispatch => {
   console.log('actions/updateEditor: cellContent = ', cellBeingEdited.content);
   dispatch({ type: UPDATE_EDITOR, payload: cellBeingEdited });
};

export const updateCellBeingEdited = sheet => {
   return { type: UPDATE_CELL_BEING_EDITED, payload: sheet };
};

export const populateCellsInStore = sheet => {
   const getCellsFromRow = row => {
      for (let index in row.columns) {
         updatedCell(row.columns[index]);
      }
   };
   map(getCellsFromRow, sheet.rows);
};

export const updatedCell = cell => {
   if (!cell || !cell.metadata) {
      console.log(
         'WARNING: updateCell could not create an action. It received',
         cell
      );
      return;
   }
   const updateCellType =
      UPDATED_CELL_ + cell.metadata.row + '_' + cell.metadata.column;
   managedStore.store.dispatch({ type: updateCellType, payload: cell.content });
};

export const updatedCellKeys = keys => {
   return { type: UPDATED_CELL_KEYS, payload: keys };
};

export const setEditorRef = editorRef => {
   return { type: SET_EDITOR_REF, payload: editorRef };
};

export const updateTitle = sheetWithNewTitle => {
   return { type: UPDATE_TITLE, payload: sheetWithNewTitle };
};

export const setEditingTitle = isEditingTitle => {
   return { type: SET_EDITING_TITLE, payload: isEditingTitle };
};
