import {
	FETCHED_SHEET,
	UPDATE_EDITOR,
	UPDATE_CELL_BEING_EDITED,
	UPDATED_CELL_,
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

export const updatedCell = cell => {
	if (!cell || !cell.metadata) {
		console.log('WARNING: updateCell could not create an action. It received', cell);
		return;
	}
	const updateCellType = UPDATED_CELL_ + cell.metadata.row + '_' + cell.metadata.column;
	console.log('updateCell returning type: ' + updateCellType + ', payload: ' + cell.content);
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
