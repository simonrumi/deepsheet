import { combineReducers } from 'redux';
import { FETCH_SHEET, UPDATE_EDITOR, UPDATE_CELL_BEING_EDITED, SET_EDITOR_REF } from '../actions/types';

const sheetReducer = (state = [], action) => {
	switch (action.type) {
		case FETCH_SHEET:
			return action.payload;
		case UPDATE_CELL_BEING_EDITED:
			//const newSheet = { ...state };
			//newSheet.content[action.payload.column].content[action.payload.row].content = action.payload.content;
			//return newSheet;
			return action.payload;
		default:
			return state;
	}
};

const updateEditorReducer = (state = {}, action) => {
	switch (action.type) {
		case UPDATE_EDITOR:
			return action.payload;
		default:
			return state;
	}
};

const editorRefReducer = (state = {}, action) => {
	switch (action.type) {
		case SET_EDITOR_REF:
			return action.payload;
		default:
			return state;
	}
};

export default combineReducers({
	sheet: sheetReducer,
	editorRef: editorRefReducer,
	editor: updateEditorReducer,
});
