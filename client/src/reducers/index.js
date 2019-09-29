import { combineReducers } from 'redux';
import { reducer as reduxFormReducer } from 'redux-form';
import {
	FETCH_SHEET,
	UPDATE_EDITOR,
	UPDATE_CELL_BEING_EDITED,
	SET_EDITOR_REF,
	UPDATE_TITLE,
	SET_EDITING_TITLE,
} from '../actions/types';

const sheetReducer = (state = [], action) => {
	switch (action.type) {
		case FETCH_SHEET:
			return action.payload;
		case UPDATE_CELL_BEING_EDITED:
			return action.payload;
		case UPDATE_TITLE:
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

export const titleReducer = (state = {}, action) => {
	switch (action.type) {
		case FETCH_SHEET:
			return {
				title: action.payload.metadata.title,
				isEditingTitle: false,
			};
		case UPDATE_TITLE:
			return { ...state, title: action.payload };
		case SET_EDITING_TITLE:
			return { ...state, isEditingTitle: action.payload };
		default:
			return state;
	}
};

export default combineReducers({
	sheet: sheetReducer,
	editorRef: editorRefReducer,
	editor: updateEditorReducer,
	title: titleReducer,
	form: reduxFormReducer,
});
