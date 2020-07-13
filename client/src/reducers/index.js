import * as R from 'ramda';
import { reducer as reduxFormReducer } from 'redux-form';
import { cellKeyReducer, cellDbUpdatesReducer } from './cellReducers';
import { removeObjectFromArrayByKeyValue, isSomething } from '../helpers';
import { updatedAxisFilters } from '../helpers/visibilityHelpers';
import titleReducer from './titleReducer';
import fetchSheetReducer from './fetchSheetReducer';
import {
   HAS_CHANGED_METADATA,
   UPDATED_EDITOR,
   SET_EDITOR_REF,
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
import { TITLE_EDIT_CANCELLED } from '../actions/titleTypes';
import { FETCHED_SHEET } from '../actions/fetchSheetTypes';
import { POSTING_UPDATED_METADATA, COMPLETED_SAVE_METADATA, METADATA_UPDATE_FAILED } from '../actions/metadataTypes';

const metadataReducer = (state = {}, action) => {
   switch (action.type) {
      case FETCHED_SHEET:
         if (!action.payload || !action.payload.metadata) {
            return null;
         }
         return action.payload.metadata || null;

      case HAS_CHANGED_METADATA: {
         return { ...state, isStale: true };
      }

      case UPDATED_COLUMN_VISIBILITY:
         const oldColumnValueRemoved = removeObjectFromArrayByKeyValue(
            'index',
            action.payload.index,
            state.columnVisibility
         );
         const newColumnVisibility = R.append(action.payload, oldColumnValueRemoved);
         return { ...state, columnVisibility: newColumnVisibility };

      case REPLACED_COLUMN_VISIBILITY:
         return { ...state, columnVisibility: action.payload };

      case UPDATED_ROW_VISIBILITY:
         const oldRowValueRemoved = removeObjectFromArrayByKeyValue('index', action.payload.index, state.rowVisibility);
         const newRowVisibility = R.append(action.payload, oldRowValueRemoved);
         return { ...state, rowVisibility: newRowVisibility };

      case REPLACED_ROW_VISIBILITY:
         return { ...state, rowVisibility: action.payload };

      case RESET_VISIBLITY:
         return {
            ...state,
            columnVisibility: [],
            rowVisibility: [],
            columnFilters: [],
            rowFilters: [],
         };

      case UPDATED_COLUMN_FILTERS:
         return updatedAxisFilters(action.payload, 'columnFilters', state, state.columnFilters);

      case REPLACED_COLUMN_FILTERS:
         return { ...state, columnFilters: action.payload };

      case UPDATED_ROW_FILTERS:
         return updatedAxisFilters(action.payload, 'rowFilters', state, state.rowFilters);

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

      case POSTING_UPDATED_METADATA:
         return {
            ...state,
            isCallingDb: true,
            isStale: true,
            errorMessage: null,
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      case COMPLETED_SAVE_METADATA:
         console.log('COMPLETED_SAVE_METADATA');
         return {
            ...state,
            isCallingDb: false,
            isStale: false,
            errorMessage: null,
            lastUpdated: action.payload.lastUpdated,
         };

      case METADATA_UPDATE_FAILED:
         return {
            ...state,
            isCallingDb: false,
            isStale: true,
            errorMessage: isSomething(action.payload.errorMessage) ? action.payload.errorMessage : null,
            lastUpdated: isSomething(state.lastUpdated) ? state.lastUpdated : null,
         };

      default:
         return state;
   }
};

const editorReducer = (state = {}, action) => {
   switch (action.type) {
      case UPDATED_EDITOR:
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

export const filterModalReducer = (state = { showFilterModal: false }, action) => {
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
   sheetId: fetchSheetReducer,
   metadata: metadataReducer,
   editorRef: editorRefReducer,
   editor: editorReducer,
   title: titleReducer,
   form: reduxFormReducer.plugin({
      titleForm: (state, action) => {
         switch (action.type) {
            case TITLE_EDIT_CANCELLED:
               return undefined;
            default:
               return state;
         }
      },
   }),
   filterModal: filterModalReducer,
   cellKeys: cellKeyReducer,
   cellDbUpdates: cellDbUpdatesReducer,
};
