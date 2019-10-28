import { staticReducers } from '../../reducers';
import mockSheet from '../../mockSheet2';
import {
	DEFAULT_SHEET_ID,
	UPDATED_SHEET_ID,
	FETCHED_SHEET,
	UPDATE_EDITOR,
	SET_EDITOR_REF,
	UPDATED_TITLE,
	SET_EDITING_TITLE,
} from '../../actions/types';

describe('reducers', () => {
	const initialState = {
		sheetId: 5,
		sheet: [],
		title: { text: '', isEditingTitle: false },
	};

	const sheetIdReducer = staticReducers.sheetId;
	const sheetReducer = staticReducers.sheet;
	const updateEditorReducer = staticReducers.editor;
	const editorRefReducer = staticReducers.editorRef;
	const titleReducer = staticReducers.title;

	it('sheetIdReducer should update sheetId in the state', () => {
		const newSheetId = 99;
		const updatedSheetIdAction = {
			type: UPDATED_SHEET_ID,
			payload: newSheetId,
		};
		const newState = sheetIdReducer(initialState, updatedSheetIdAction);
		expect(newState).toEqual(newSheetId);
	});

	it('sheetIdReducer should return the default sheet id when the type is not UPDATED_SHEET_ID', () => {
		const newState = sheetIdReducer(undefined, {});
		expect(newState).toEqual(DEFAULT_SHEET_ID);
	});

	it('sheetReducer should update sheet in the state', () => {
		const sheetAction = {
			type: FETCHED_SHEET,
			payload: mockSheet,
		};
		const newState = sheetReducer(initialState, sheetAction);
		expect(newState).toEqual(mockSheet.metadata);
	});

	it('sheetReducer should return the default state when the type is not FETCHED_SHEET', () => {
		const newState = sheetReducer(undefined, {});
		expect(newState).toEqual([]);
	});

	it('updateEditorReducer should update the state with the cell data of the cell being edited', () => {
		const cellData = {
			row: 2,
			column: 3,
			content: 'some cell content',
		};
		const updateEditorAction = {
			type: UPDATE_EDITOR,
			payload: cellData,
		};
		const newState = updateEditorReducer(initialState, updateEditorAction);
		expect(newState).toEqual(cellData);
	});

	it('updateEditorReducer should return the default state when the type is not UPDATE_EDITOR', () => {
		const newState = updateEditorReducer(undefined, {});
		expect(newState).toEqual({});
	});

	it('editorRefReducer should update the state with the editorRef object', () => {
		const editorRefMock = { ref: 'stand in for the editor ref object' };
		const editorRefAction = {
			type: SET_EDITOR_REF,
			payload: editorRefMock,
		};
		const newState = editorRefReducer(initialState, editorRefAction);
		expect(newState).toEqual(editorRefMock);
	});

	it('editorRefReducer should return the default state when the type is not SET_EDITOR_REF', () => {
		const newState = editorRefReducer(undefined, {});
		expect(newState).toEqual({});
	});

	it('titleReducer should update the state with the title based on the UPDATED_TITLE action', () => {
		const titleData = { text: 'some new title', isEditingTitle: false };
		const updatedTitleAction = {
			type: UPDATED_TITLE,
			payload: titleData,
		};
		const newState = titleReducer(initialState, updatedTitleAction);
		expect(newState).toEqual(titleData);
	});

	it('titleReducer should update the state with the title, based on the FETCHED_SHEET action', () => {
		const updatedTitleAction = {
			type: FETCHED_SHEET,
			payload: mockSheet,
		};
		const newState = titleReducer(initialState, updatedTitleAction);
		expect(newState).toEqual({ text: mockSheet.title, isEditingTitle: false });
	});

	it('titleReducer should update the isEditingTitle property in the state, based on the SET_EDITING_TITLE action', () => {
		const isEditingTitleValue = true;
		const setEditingTitleAction = {
			type: SET_EDITING_TITLE,
			payload: isEditingTitleValue,
		};
		const newState = titleReducer(initialState.title, setEditingTitleAction);
		expect(newState).toEqual({ text: initialState.title.text, isEditingTitle: isEditingTitleValue });
	});

	it('titleReducer should return the default state when the type is not UPDATED_TITLE or FETCHED_SHEET or SET_EDITING_TITLE', () => {
		const newState = titleReducer(undefined, {});
		expect(newState).toEqual({});
	});
});
