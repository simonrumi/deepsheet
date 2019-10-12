import { reducer as reduxFormReducer } from 'redux-form';
import { cellKeyReducer } from './cellReducers';
import { FETCHED_SHEET, UPDATE_EDITOR, SET_EDITOR_REF, UPDATED_TITLE, SET_EDITING_TITLE } from '../actions/types';

const sheetReducer = (state = [], action) => {
	switch (action.type) {
		case FETCHED_SHEET:
			return action.payload.metadata;
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
		case FETCHED_SHEET:
			return {
				text: action.payload.title,
				isEditingTitle: false,
			};
		case UPDATED_TITLE:
			return action.payload;
		case SET_EDITING_TITLE:
			return { ...state, isEditingTitle: action.payload };
		default:
			return state;
	}
};

export const staticReducers = {
	sheet: sheetReducer,
	editorRef: editorRefReducer,
	editor: updateEditorReducer,
	title: titleReducer,
	form: reduxFormReducer,
	cellKeys: cellKeyReducer,
};
