import {
   FETCH_SHEET,
   UPDATE_EDITOR,
   UPDATE_CELL_BEING_EDITED,
   UPDATE_CELL_,
   SET_EDITOR_REF,
   UPDATE_TITLE,
   SET_EDITING_TITLE,
} from './types';

// temp fake data
import mockSheet from '../mockSheet2';

export const fetchSheet = () => dispatch => {
   //in future this will need to make an async call to a db
   dispatch({ type: FETCH_SHEET, payload: mockSheet });
   return mockSheet;
};

export const updateEditor = cellBeingEdited => dispatch => {
   console.log('actions/updateEditor: cellContent = ', cellBeingEdited.content);
   dispatch({ type: UPDATE_EDITOR, payload: cellBeingEdited });
};

export const updateCellBeingEdited = sheet => {
   return { type: UPDATE_CELL_BEING_EDITED, payload: sheet };
};

export const updateCell = cell => {
   if (!cell || !cell.metadata) {
      console.log(
         'WARNING: updateCell could not create an action. It received',
         cell
      );
      return;
   }
   const updateCellType =
      UPDATE_CELL_ + cell.metadata.row + '_' + cell.metadata.column;
   console.log(
      'updateCell returning type: ' +
         updateCellType +
         ', payload: ' +
         cell.content
   );
   return { type: updateCellType, payload: cell.content };
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
