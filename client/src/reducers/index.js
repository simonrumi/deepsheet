import { reducer as reduxFormReducer } from 'redux-form';
import { cellKeyReducer } from './cellReducers';
import { replaceFilterEntry } from '../helpers/visibilityHelpers';
import {
	DEFAULT_SHEET_ID,
	UPDATED_SHEET_ID,
	FETCHED_SHEET,
	UPDATED_COLUMN_VISIBILITY,
	UPDATED_ROW_VISIBILITY,
	UPDATE_EDITOR,
	SET_EDITOR_REF,
	UPDATED_TITLE,
	SET_EDITING_TITLE,
	TOGGLED_SHOW_FILTER_MODAL,
	UPDATED_FILTER,
} from '../actions/types';

const sheetIdReducer = (state = DEFAULT_SHEET_ID, action) => {
	switch (action.type) {
		case UPDATED_SHEET_ID:
			return action.payload;
		default:
			return state;
	}
};

const sheetReducer = (state = [], action) => {
	switch (action.type) {
		case FETCHED_SHEET:
			return action.payload.metadata;
		case UPDATED_COLUMN_VISIBILITY:
			return { ...state, columnVisibility: action.payload };
		case UPDATED_ROW_VISIBILITY:
			return { ...state, rowVisibility: action.payload };
		case UPDATED_FILTER:
			return replaceFilterEntry(action.payload, state);
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

export const filterModalReducer = (state = { showFilterModal: false }, action) => {
	switch (action.type) {
		case TOGGLED_SHOW_FILTER_MODAL:
			const { showModal, rowIndex, colIndex } = action.payload;
			return { ...state, showFilterModal: showModal, rowIndex, colIndex };

		case UPDATED_FILTER:
			return { ...state, ...action.payload };

		default:
			return state;
	}
};

export const staticReducers = {
	sheetId: sheetIdReducer,
	sheet: sheetReducer,
	editorRef: editorRefReducer,
	editor: updateEditorReducer,
	title: titleReducer,
	form: reduxFormReducer,
	filterModal: filterModalReducer,
	cellKeys: cellKeyReducer,
};
