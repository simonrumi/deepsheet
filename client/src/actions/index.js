// import { map } from 'ramda';
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
} from './types';

export const fetchedSheet = sheet => {
   return { type: FETCHED_SHEET, payload: sheet };
};

export const updatedSheetId = sheetId => {
   managedStore.store.dispatch({ type: UPDATED_SHEET_ID, payload: sheetId });
};

export const updateEditor = cellBeingEdited => dispatch => {
   dispatch({ type: UPDATE_EDITOR, payload: cellBeingEdited });
};

export const updatedCellBeingEdited = cell => {
   const updateCellType = UPDATED_CELL_ + cell.row + '_' + cell.column;
   return { type: updateCellType, payload: cell.content };
};

export const updatedCell = cell => {
   if (!cell || !cell.content) {
      console.log(
         'WARNING: updateCell could not create an action. It received',
         cell
      );
      return;
   }
   const updateCellType = UPDATED_CELL_ + cell.row + '_' + cell.column;
   managedStore.store.dispatch({ type: updateCellType, payload: cell.content });
};

export const updatedCellKeys = keys => {
   managedStore.store.dispatch({ type: UPDATED_CELL_KEYS, payload: keys });
};

export const setEditorRef = editorRef => {
   return { type: SET_EDITOR_REF, payload: editorRef };
};

export const updateTitle = titleData => {
   return { type: UPDATED_TITLE, payload: titleData };
};

export const setEditingTitle = isEditingTitle => {
   return { type: SET_EDITING_TITLE, payload: isEditingTitle };
};
