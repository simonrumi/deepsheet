import * as R from 'ramda';
import { reducer as reduxFormReducer } from 'redux-form';
import { cellKeyReducer } from './cellReducers';
import { DEFAULT_SHEET_ID } from '../constants';
import {
   UPDATED_SHEET_ID,
   FETCHED_SHEET,
   UPDATED_HAS_CHANGED,
   UPDATE_EDITOR,
   SET_EDITOR_REF,
   UPDATED_TITLE,
   SET_EDITING_TITLE,
   TOGGLED_SHOW_FILTER_MODAL,
   UPDATED_COLUMN_VISIBILITY,
   REPLACED_COLUMN_VISIBILITY,
   UPDATED_ROW_VISIBILITY,
   REPLACED_ROW_VISIBILITY,
   UPDATED_FILTER,
   UPDATED_COLUMN_FILTERS,
   REPLACED_COLUMN_FILTERS,
   UPDATED_ROW_FILTERS,
   REPLACED_ROW_FILTERS,
   RESET_VISIBLITY,
   UPDATED_TOTAL_COLUMNS,
   UPDATED_TOTAL_ROWS,
   ROW_MOVED,
   ROW_MOVED_TO,
   COLUMN_MOVED,
   COLUMN_MOVED_TO,
   UPDATED_SORT_OPTIONS,
   CLEARED_SORT_OPTIONS,
} from '../actions/types';

const sheetIdReducer = (state = DEFAULT_SHEET_ID, action) => {
   switch (action.type) {
      case UPDATED_SHEET_ID:
         return action.payload;
      default:
         return state;
   }
};

const sheetReducer = (state = {}, action) => {
   switch (action.type) {
      case FETCHED_SHEET:
         return action.payload.metadata;

      case UPDATED_HAS_CHANGED:
         return { ...state, hasChanged: action.payload };

      case UPDATED_COLUMN_VISIBILITY:
         const newColumnVisibility = R.mergeAll([
            state.columnVisibility,
            action.payload,
         ]);
         return { ...state, columnVisibility: newColumnVisibility };

      case REPLACED_COLUMN_VISIBILITY:
         return { ...state, columnVisibility: action.payload };

      case UPDATED_ROW_VISIBILITY:
         const newRowVisibility = R.mergeAll([
            state.rowVisibility,
            action.payload,
         ]);
         return { ...state, rowVisibility: newRowVisibility };

      case REPLACED_ROW_VISIBILITY:
         return { ...state, rowVisibility: action.payload };

      case RESET_VISIBLITY:
         return {
            ...state,
            columnVisibility: {},
            rowVisibility: {},
            columnFilters: {},
            rowFilters: {},
         };

      case UPDATED_COLUMN_FILTERS:
         const newColumnFilters = R.mergeAll([
            state.columnFilters,
            action.payload,
         ]);
         return { ...state, columnFilters: newColumnFilters };

      case REPLACED_COLUMN_FILTERS:
         return { ...state, columnFilters: action.payload };

      case UPDATED_ROW_FILTERS:
         const newRowFilters = R.mergeAll([state.rowFilters, action.payload]);
         return { ...state, rowFilters: newRowFilters };

      case REPLACED_ROW_FILTERS:
         return { ...state, rowFilters: action.payload };

      case UPDATED_TOTAL_COLUMNS:
         return { ...state, totalColumns: action.payload };

      case UPDATED_TOTAL_ROWS:
         return { ...state, totalRows: action.payload };

      case ROW_MOVED:
         return { ...state, rowMoved: action.payload };

      case ROW_MOVED_TO:
         return { ...state, rowMovedTo: action.payload };

      case COLUMN_MOVED:
         return { ...state, columnMoved: action.payload };

      case COLUMN_MOVED_TO:
         return { ...state, columnMovedTo: action.payload };

      case UPDATED_SORT_OPTIONS:
         return typeof action.payload.rowSortByIndex === 'number'
            ? {
                 ...state,
                 rowSortByIndex: action.payload.rowSortByIndex,
                 rowSortDirection: action.payload.sortDirection,
              }
            : {
                 ...state,
                 columnSortByIndex: action.payload.columnSortByIndex,
                 columnSortDirection: action.payload.sortDirection,
              };

      case CLEARED_SORT_OPTIONS:
         return {
            ...state,
            rowSortByIndex: null,
            rowSortDirection: null,
            columnSortByIndex: null,
            columnSortDirection: null,
         };

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

export const filterModalReducer = (
   state = { showFilterModal: false },
   action
) => {
   switch (action.type) {
      case TOGGLED_SHOW_FILTER_MODAL:
         const { showModal, rowIndex, colIndex } = action.payload;
         return { ...state, showFilterModal: showModal, rowIndex, colIndex };

      case UPDATED_FILTER:
         return action.payload;

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
