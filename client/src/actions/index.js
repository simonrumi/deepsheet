// import { map } from 'ramda';
import * as R from 'ramda';
import managedStore from '../store';
import { fetchSummaryCellFromSheet } from '../services/sheetServices';
import { isObject } from '../helpers';

import {
	FETCHED_SHEET,
	UPDATED_HAS_CHANGED,
	UPDATED_EDITOR,
	SET_EDITOR_REF,
	UPDATED_CELL_,
	UPDATED_CONTENT_OF_CELL_,
	UPDATED_CELL_KEYS,
	UPDATED_TITLE,
	SET_EDITING_TITLE,
	UPDATED_SHEET_ID,
	TOGGLED_SHOW_FILTER_MODAL,
	UPDATED_FILTER,
	UPDATED_COLUMN_FILTERS,
	REPLACED_COLUMN_FILTERS,
	UPDATED_ROW_FILTERS,
	REPLACED_ROW_FILTERS,
	HIDE_FILTERED,
	CLEAR_ALL_FILTERS,
	UPDATED_TOTAL_COLUMNS,
	UPDATED_TOTAL_ROWS,
	UPDATED_COLUMN_VISIBILITY,
	REPLACED_COLUMN_VISIBILITY,
	UPDATED_ROW_VISIBILITY,
	REPLACED_ROW_VISIBILITY,
	ROW_MOVED,
	ROW_MOVED_TO,
	COLUMN_MOVED,
	COLUMN_MOVED_TO,
	UPDATED_ROW_ORDER,
	UPDATED_COLUMN_ORDER,
	UPDATED_SORT_OPTIONS,
	SORTED_AXIS,
	CLEARED_SORT_OPTIONS,
} from './types';

export const fetchedSheet = sheet => {
	managedStore.store.dispatch({ type: FETCHED_SHEET, payload: sheet });
};

export const updatedSheetId = sheetId => {
	managedStore.store.dispatch({ type: UPDATED_SHEET_ID, payload: sheetId });
};

export const updatedHasChanged = hasChanged => {
	managedStore.store.dispatch({
		type: UPDATED_HAS_CHANGED,
		payload: hasChanged,
	});
};

export const updatedColumnFilters = columnFilters => {
	managedStore.store.dispatch({
		type: UPDATED_COLUMN_FILTERS,
		payload: columnFilters,
	});
};

export const replacedColumnFilters = columnFilters => {
	managedStore.store.dispatch({
		type: REPLACED_COLUMN_FILTERS,
		payload: columnFilters,
	});
};

export const updatedRowFilters = rowFilters => {
	managedStore.store.dispatch({
		type: UPDATED_ROW_FILTERS,
		payload: rowFilters,
	});
};

export const replacedRowFilters = rowFilters => {
	managedStore.store.dispatch({
		type: REPLACED_ROW_FILTERS,
		payload: rowFilters,
	});
};

export const updatedEditor = cellData => {
	managedStore.store.dispatch({
		type: UPDATED_EDITOR,
		payload: cellData,
	});
};

export const setEditorRef = editorRef => {
	managedStore.store.dispatch({ type: SET_EDITOR_REF, payload: editorRef });
};

export const updatedCellBeingEdited = cell => {
	const updateCellType = UPDATED_CONTENT_OF_CELL_ + cell.row + '_' + cell.column;
	managedStore.store.dispatch({ type: updateCellType, payload: cell });
};

export const updatedCell = cell => {
	console.log('updatedCell got cell', cell);
	if (R.isNil(cell) || R.not(R.has('content', cell))) {
		console.log('WARNING: updatedCell could not create an action. It received', cell);
		return;
	}
	const updateCellType = UPDATED_CELL_ + cell.row + '_' + cell.column;
	// cells that are displaying subSheet content have an object as the content
	if (isObject(cell.content)) {
		if (R.not(R.has('subSheetId', cell.content)) || R.isNil(cell.content.subSheetId)) {
			console.log('WARNING: updatedCell could not get sub-cell  content');
		} else {
			const contentText = fetchSummaryCellFromSheet(cell.content.subSheetId);
			const subCellContent = { ...cell.content, subContent: contentText };
			const subCell = { ...cell, content: subCellContent };
			managedStore.store.dispatch({
				type: updateCellType,
				payload: subCell,
			});
		}
	} else {
		managedStore.store.dispatch({ type: updateCellType, payload: cell });
	}
};

export const updatedCellKeys = keys => {
	managedStore.store.dispatch({ type: UPDATED_CELL_KEYS, payload: keys });
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

export const replacedColumnVisibility = newVisibility => {
	managedStore.store.dispatch({
		type: REPLACED_COLUMN_VISIBILITY,
		payload: newVisibility,
	});
};

export const updatedRowVisibility = newVisibility => {
	managedStore.store.dispatch({
		type: UPDATED_ROW_VISIBILITY,
		payload: newVisibility,
	});
};

export const replacedRowVisibility = newVisibility => {
	managedStore.store.dispatch({
		type: REPLACED_ROW_VISIBILITY,
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

export const columnMoved = column => {
	managedStore.store.dispatch({
		type: COLUMN_MOVED,
		payload: column,
	});
	managedStore.store.dispatch({
		type: UPDATED_COLUMN_ORDER,
		payload: null,
	});
};

export const columnMovedTo = column => {
	managedStore.store.dispatch({
		type: COLUMN_MOVED_TO,
		payload: column,
	});
	managedStore.store.dispatch({
		type: UPDATED_COLUMN_ORDER,
		payload: null,
	});
};

export const sortedAxis = () => {
	managedStore.store.dispatch({
		type: SORTED_AXIS,
		payload: null,
	});
};

export const updatedSortOptions = sortOptions => {
	managedStore.store.dispatch({
		type: UPDATED_SORT_OPTIONS,
		payload: sortOptions,
	});
};

export const clearedSortOptions = () => {
	managedStore.store.dispatch({
		type: CLEARED_SORT_OPTIONS,
		payload: null,
	});
};
